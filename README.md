# Classmark

A local-first attendance tracker for students, packaged as a PWA and an Android app with
[Capacitor](https://capacitorjs.com/). Optional Firebase sign-in and cloud sync let you use the
same account on more than one device. It answers one question well: **how many classes can I
skip, or how many do I need to attend, to stay above my target?**

Sign-in is required to open the app so each workspace is tied to a Firebase account. There is no
analytics.

## Features

- Per-subject attendance with a configurable target percentage.
- "Can skip / must attend" math shown front and center.
- Swipe a subject card left to mark present, right to mark absent; buttons work too.
- Backfill past dates and edit/remove individual marks.
- Stats: trend graph, 84-day heatmap, weekly recap with a shareable image, day log, reordering.
- Reminders via Android Local Notifications (or Web Notifications in the browser).
- Native Android home-screen widget (overall % + up to 4 subjects).
- Export/import JSON, CSV, PDF, and Excel. On Android these are written to app storage and
  opened through the system share sheet; on the web they download normally.
- Light/dark themes with multiple UI styles and accent colors.
- Optional email/password, Google, and phone sign-in with Firebase Authentication.
- Owner-protected Firestore sync for attendance, course totals, timetable, and preferences.

## Install the Android APK

1. Open the **Actions** tab and wait for the **Build Android APK** workflow.
2. Open the latest green run and download the **attendance-apk** artifact.
3. Unzip it and copy `app-debug.apk` to your phone, then install it (allow "Install unknown
   apps" when asked).

The workflow runs automatically on every push. You can also trigger it manually with
**Run workflow**.

### App updates and signing

The APK is signed with the debug keystore committed at `keystore/debug.keystore` (alias
`androiddebugkey`, password `android`). This makes every CI build use the **same** signing key,
so new debug APKs install over old ones. It is a debug key for personal use only - replace it
with your own private release keystore before publishing anywhere.

If you lose local data: the app stores data in the WebView's local storage. Export a JSON
backup before uninstalling. Uninstalling always deletes app data.

## Build locally

Requirements: Node 20+, JDK 17, Android SDK with a platform and build-tools, and Python 3
with Pillow.

```bash
npm ci                    # installs deps + vendors jsPDF, SheetJS, and Firebase into www/vendor
npx cap add android
python3 scripts/patch_android.py
npx cap sync android
cd android && ./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

To preview the web app, start the local server (Firebase Auth and the private Gemini proxy need localhost):

```bash
npm run dev
```

Then open `http://localhost:8000`. To enable Gemini features, add your key to the root `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Save `.env` and restart `npm run dev`. The local server sends Gemini requests to Google without
exposing the key to browser JavaScript. The `.env` file is ignored by Git. A static Python server
does not provide this private-key proxy. Add the deployed website hostname under Firebase
Authentication → Settings → Authorized domains before using sign-in on a hosted domain. For
local testing, `localhost` must be listed there; opening `www/index.html` directly with `file://`
will not pass Firebase's authorized-domain check.

### Host on Vercel

The Vercel project uses the repository root, runs `npm run vendor`, and publishes `www/`. Gemini
requests run through authenticated Node.js functions under `api/`; they require a Firebase sign-in
and read `GEMINI_API_KEY` from the Vercel Production/Preview environment. Add the deployed
`*.vercel.app` hostname to Firebase Authentication → Settings → Authorized domains before using
sign-in on the hosted site. Never add the Gemini key to a `NEXT_PUBLIC_` variable or client file.

## Data and privacy

- Attendance, imported course totals, dated marks, weekly timetable, and selected preferences
  sync to the `attended-9480d` Firestore database. Firestore rules restrict each account to its
  own workspace. Existing local data is merged when the account first signs in.
- Gemini API keys are read by the local Node server from `.env` and by Vercel Functions from the
  server-side environment; they are never sent to the browser or synced to Firestore. Timetable
  photos and wallpaper images remain on-device.
  The Firebase web configuration includes a public Firebase API key; it is not a Gemini key or a
  password. Do not put private Gemini keys in source files.
- The app does not send analytics. Google Fonts is optional and falls back to system fonts
  offline. Export libraries (jsPDF, SheetJS) and the Firebase SDK bundle are generated into
  `www/vendor` during installation.
- Backups are user-initiated files. Treat an exported JSON backup as personal data.

## Known limitations

- The APK is a debug build, not Play Store-signed or Play Store-ready.
- Reminder delivery depends on Android/OEM battery management. On aggressive OEMs (for
  example OPPO/Realme), set battery usage to **Unrestricted** and allow auto-launch.
- Reminders are scheduled for a rolling 14-day window when the app runs. Reopen the app
  periodically to replenish the window. A force-stop or reboot can affect pending deliveries
- The launcher controls widget refresh cadence; the widget also refreshes when the app writes data.
- The UI is one large `www/index.html` file. It works, but it is the main thing to refactor if
  you want to contribute substantially.

## Project layout

```
www/                  single-page web app (HTML/CSS/JS) + icons
  firebase-sync.js    Firebase Authentication and Firestore sync client
  vendor/             generated at install time (jsPDF, SheetJS, Firebase SDK bundle)
firebase.json         Firestore Enterprise database configuration
firestore.rules       Per-user Firestore security rules
overlay/              native Android sources/resources copied into the Capacitor project
scripts/patch_android.py   injects widget, permissions, and icons after `cap add android`
scripts/vendor_libs.js      copies and bundles browser libraries into www/vendor
keystore/debug.keystore     stable debug signing key (personal use only)
.github/workflows/    CI that builds the debug APK
```

## Contributing

Issues and pull requests are welcome. Keep changes focused, test on a real Android device when
touching the native widget or notifications, and export a backup before testing import/export.

## License

MIT - see [LICENSE](LICENSE).
