import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  signInWithPhoneNumber, RecaptchaVerifier, signOut,
} from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBfP1R4D0_5S-6q3FpWldHn7AtyrHuPADo',
  authDomain: 'attended-9480d.firebaseapp.com',
  projectId: 'attended-9480d',
  storageBucket: 'attended-9480d.firebasestorage.app',
  messagingSenderId: '10955156934',
  appId: '1:10955156934:web:ec7bab54ea5f93155116c7',
  measurementId: 'G-0XSYMW936X',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
// The Enterprise database is named. Realtime listeners let signed-in devices
// see changes without polling.
const db = getFirestore(app, 'classmark-data');
const $ = (id) => document.getElementById(id);
const allowedSettings = [
  'ui','skeuTone','glass','colorMode','accent','customColor','fontStyle',
  'wallpaperOpacity','reminderEnabled','reminderTime','reminderDefaultsV2',
  'weeklyTimetable',
];
let activeUser = null;
let stopWorkspaceListener = null;
let pendingPhoneConfirmation = null;
let recaptcha = null;
let lastCloudSignature = '';
let saveTimer = null;
let applyingRemote = false;

function showStatus(message, signedIn = !!activeUser) {
  if ($('cloudSyncState')) $('cloudSyncState').textContent = message;
  if ($('cloudAuthDot')) $('cloudAuthDot').classList.toggle('on', signedIn);
  if ($('cloudSignedOut')) $('cloudSignedOut').style.display = signedIn ? 'none' : 'block';
  if ($('cloudSignedIn')) $('cloudSignedIn').style.display = signedIn ? 'block' : 'none';
}

function errorText(error) {
  const code = error?.code || '';
  const rawMessage = String(error?.message || '');
  if (code === 'auth/unauthorized-domain') {
    if (location.protocol === 'file:') return 'This page is opened from a file. Keep the local server running and open http://localhost:8000/ instead.';
    const host = location.hostname || 'this website';
    return `Add ${host} to Firebase Authentication → Settings → Authorized domains, then reload this page.`;
  }
  if (code === 'auth/operation-not-allowed' && /SMS unable to be sent until this region enabled/i.test(rawMessage)) {
    return 'Phone sign-in is enabled, but Firebase is blocking SMS to this region. In Firebase Console → Authentication → Settings → SMS region policy, allow India (IN) and save.';
  }
  const messages = {
    'auth/email-already-in-use':'That email already has an account. Sign in instead.',
    'auth/invalid-email':'Enter a valid email address.',
    'auth/weak-password':'Use a password with at least 6 characters.',
    'auth/invalid-credential':'Email or password is incorrect.',
    'auth/user-disabled':'This account has been disabled.',
    'auth/operation-not-allowed':'This sign-in method is not enabled in Firebase Authentication yet.',
    'auth/popup-closed-by-user':'The Google sign-in window was closed.',
    'auth/invalid-phone-number':'Enter the phone number with its country code, such as +91…',
    'auth/missing-phone-number':'Enter a phone number first.',
    'auth/invalid-verification-code':'That SMS code is invalid or expired.',
    'auth/captcha-check-failed':'Complete the reCAPTCHA and try again.',
    'auth/too-many-requests':'Too many attempts. Wait a little and try again.',
  };
  return messages[code] || error?.message || 'Firebase could not complete that request.';
}

function localWorkspace() {
  return { state: window.classmarkApp.getState(), settings: window.classmarkApp.getSettings() };
}

function cloudSettings(settings = {}) {
  const result = {};
  allowedSettings.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(settings, key)) result[key] = settings[key];
  });
  result.weeklyTimetable = Array.isArray(result.weeklyTimetable)
    ? result.weeklyTimetable.filter(x => x && Number.isInteger(Number(x.day)) && Number(x.day) >= 0 && Number(x.day) <= 6 && typeof x.subject === 'string')
      .slice(0, 200).map(x => ({ day: Number(x.day), subject: x.subject.slice(0, 120) }))
    : [];
  result.reminderEnabled = result.reminderEnabled === true;
  result.reminderTime = /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(String(result.reminderTime || ''))
    ? String(result.reminderTime)
    : '19:00';
  return result;
}

function signature(value) {
  return JSON.stringify({ state: value.state, settings: cloudSettings(value.settings) });
}

function cloneValue(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function subjectKey(subject) {
  const code = String(subject.code || '').trim().toLowerCase();
  return code ? `code:${code}` : `name:${String(subject.name || '').trim().toLowerCase()}`;
}

function mergeWorkspaces(local, remote) {
  const localSubjects = Array.isArray(local?.state?.subjects) ? local.state.subjects : [];
  const remoteSubjects = Array.isArray(remote?.state?.subjects) ? remote.state.subjects : [];
  const byKey = new Map();
  [...remoteSubjects, ...localSubjects].forEach(subject => {
    if (!subject || typeof subject.name !== 'string') return;
    const key = subjectKey(subject);
    const previous = byKey.get(key);
    if (!previous) { byKey.set(key, cloneValue(subject)); return; }
    const first = cloneValue(previous);
    const second = subject;
    const remoteSubject = remoteSubjects.find(x => subjectKey(x) === key) || first;
    const records = { ...(first.records || {}) };
    Object.entries(second.records || {}).forEach(([date, marks]) => {
      const old = Array.isArray(records[date]) ? records[date] : [];
      const next = Array.isArray(marks) ? marks : [];
      records[date] = [...next, ...old.slice(next.length)];
    });
    const useSecondBaseline = Number(second.baseTotal || 0) > Number(first.baseTotal || 0);
    byKey.set(key, {
      ...first,
      ...remoteSubject,
      records,
      basePresent: useSecondBaseline ? Number(second.basePresent || 0) : Number(first.basePresent || 0),
      baseTotal: useSecondBaseline ? Number(second.baseTotal || 0) : Number(first.baseTotal || 0),
    });
  });
  const cloudPrefs = cloudSettings(remote?.settings || {});
  const localPrefs = cloudSettings(local?.settings || {});
  const settings = { ...localPrefs, ...cloudPrefs };
  const schedule = [...(localPrefs.weeklyTimetable || []), ...(cloudPrefs.weeklyTimetable || [])];
  const seen = new Set();
  settings.weeklyTimetable = schedule.filter(x => {
    const key = `${x.day}:${x.subject.trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  return { state: { subjects: [...byKey.values()] }, settings };
}

function cloudRef(uid = activeUser?.uid) {
  return doc(db, 'users', uid, 'sync', 'workspace');
}

async function writeWorkspace() {
  if (!activeUser || applyingRemote) return;
  const workspace = localWorkspace();
  const payload = { state: workspace.state, settings: cloudSettings(workspace.settings) };
  const nextSignature = signature(payload);
  if (nextSignature === lastCloudSignature) return;
  lastCloudSignature = nextSignature;
  showStatus('Syncing…');
  try {
    await setDoc(cloudRef(), {
      schemaVersion: 1,
      state: payload.state,
      settings: payload.settings,
      updatedAt: serverTimestamp(),
    });
    showStatus('Synced');
  } catch (error) {
    console.error('[Classmark cloud sync]', error);
    lastCloudSignature = '';
    showStatus('Sync paused · data stays on this device');
  }
}

function scheduleWrite() {
  if (!activeUser || applyingRemote) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(writeWorkspace, 650);
}

async function startWorkspaceSync(user) {
  const ref = cloudRef(user.uid);
  showStatus('Loading cloud data…');
  const initial = await getDoc(ref);
  const current = localWorkspace();
  if (!initial.exists()) {
    lastCloudSignature = '';
    showStatus('Saving this device…');
    await writeWorkspace();
  } else {
    const cloud = initial.data();
    const remote = { state: cloud.state || { subjects: [] }, settings: cloud.settings || {} };
    const merged = mergeWorkspaces(current, remote);
    lastCloudSignature = signature(remote);
    applyingRemote = true;
    window.classmarkApp.replaceWorkspace(merged.state, merged.settings);
    applyingRemote = false;
    const mergedSignature = signature(merged);
    if (mergedSignature !== lastCloudSignature) await writeWorkspace();
    else showStatus('Synced');
  }
  stopWorkspaceListener?.();
  stopWorkspaceListener = onSnapshot(ref, snapshot => {
    if (!snapshot.exists() || snapshot.metadata.hasPendingWrites) return;
    const data = snapshot.data();
    const remote = { state: data.state || { subjects: [] }, settings: data.settings || {} };
    const remoteSignature = signature(remote);
    if (remoteSignature === lastCloudSignature) return;
    const merged = mergeWorkspaces(localWorkspace(), remote);
    lastCloudSignature = remoteSignature;
    applyingRemote = true;
    window.classmarkApp.replaceWorkspace(merged.state, merged.settings);
    applyingRemote = false;
    if (signature(merged) !== remoteSignature) scheduleWrite();
    showStatus('Synced');
  }, error => {
    console.error('[Classmark cloud listener]', error);
    showStatus('Sync paused · data stays on this device');
  });
}

function runAuth(task) {
  return Promise.resolve().then(task).catch(error => {
    console.error('[Classmark sign-in]', error);
    window.classmarkApp.notify(errorText(error));
  });
}

function initAuthControls() {
  $('cloudSignInBtn').onclick = () => runAuth(() => signInWithEmailAndPassword(auth, $('cloudEmail').value.trim(), $('cloudPassword').value));
  $('cloudCreateBtn').onclick = () => runAuth(() => createUserWithEmailAndPassword(auth, $('cloudEmail').value.trim(), $('cloudPassword').value));
  $('cloudGoogleBtn').onclick = () => runAuth(() => signInWithPopup(auth, new GoogleAuthProvider()));
  $('cloudPhoneSendBtn').onclick = () => runAuth(async () => {
    const number = $('cloudPhone').value.trim();
    if (!number) throw Object.assign(new Error('Enter your phone number with its country code.'), { code: 'auth/missing-phone-number' });
    $('phoneAuthDetails').open = true;
    if (!recaptcha) recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'normal' });
    pendingPhoneConfirmation = await signInWithPhoneNumber(auth, number, recaptcha);
    $('cloudPhoneCodeRow').style.display = 'grid';
    window.classmarkApp.notify('Verification code sent. Check your SMS.');
  });
  $('cloudPhoneVerifyBtn').onclick = () => runAuth(async () => {
    if (!pendingPhoneConfirmation) throw new Error('Tap “Send SMS code” first.');
    const code = $('cloudPhoneCode').value.trim();
    if (!code) throw Object.assign(new Error('Enter the SMS verification code.'), { code: 'auth/invalid-verification-code' });
    await pendingPhoneConfirmation.confirm(code);
    pendingPhoneConfirmation = null;
  });
  $('cloudSignOutBtn').onclick = () => runAuth(async () => {
    clearTimeout(saveTimer);
    await writeWorkspace();
    await signOut(auth);
  });
}

initAuthControls();
window.classmarkCloudSync = { schedule: scheduleWrite };
window.classmarkGetIdToken = async () => {
  if (!activeUser) throw new Error('Sign in to use Gemini features.');
  return activeUser.getIdToken();
};
window.setClassmarkAuthGate?.('loading');
onAuthStateChanged(auth, async user => {
  stopWorkspaceListener?.();
  stopWorkspaceListener = null;
  activeUser = user;
  if (!user) {
    lastCloudSignature = '';
    showStatus('Signed out', false);
    window.setClassmarkAuthGate?.('signedOut');
    if ($('cloudUserLabel')) $('cloudUserLabel').textContent = '';
    return;
  }
  window.setClassmarkAuthGate?.('signedIn');
  if ($('cloudUserLabel')) $('cloudUserLabel').textContent = user.email || user.phoneNumber || user.displayName || 'Signed-in account';
  showStatus('Connecting…');
  try { await startWorkspaceSync(user); }
  catch (error) {
    console.error('[Classmark cloud connect]', error);
    showStatus('Sync unavailable · data stays on this device');
  }
});

window.addEventListener('online', () => {
  if (!activeUser) return;
  startWorkspaceSync(activeUser).catch(error => {
    console.error('[Classmark cloud reconnect]', error);
    showStatus('Sync unavailable · data stays on this device');
  });
});
