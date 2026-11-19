# Go-Live Checklist

**Created:** 2026-11-19 00:00 IST
**Last updated:** 2026-11-19 00:00 IST
**Project:** Classmark
**Stack:** Responsive web app and Capacitor 6 Android app, Firebase Authentication, Firestore, Vercel server functions, Gemini proxy

## Summary

| Severity | Total | PENDING | DONE | SKIPPED | CANCELLED |
|---|---:|---:|---:|---:|---:|
| CRITICAL | 6 | 6 | 0 | 0 | 0 |
| HIGH | 8 | 8 | 0 | 0 | 0 |
| MEDIUM | 6 | 6 | 0 | 0 | 0 |
| LOW | 4 | 4 | 0 | 0 | 0 |

**Top blockers (CRITICAL, PENDING):**
- [ ] C1. Generate and verify a Play-ready release AAB with a current target SDK
- [ ] C2. Replace the debug-only Android delivery with a protected release signing flow
- [ ] C3. Publish a privacy policy and implement account deletion
- [ ] C5. Verify the production web deployment and Firebase authorized domains

## CRITICAL

### [PENDING] C1. Generate and verify a Play-ready release AAB
**What:** The repository builds an `assembleDebug` APK in `.github/workflows/build-apk.yml:60` and does not contain a tracked Android Gradle project, so release target SDK and bundle configuration are not verifiable.
**Why critical:** A new Play app or update must target Android 16 API 36 or higher from August 31, 2026.
**Where:** `.github/workflows/build-apk.yml:54-64`, `capacitor.config.json:2`
**How:** Generate the Android platform in a release branch, inspect `android/app/build.gradle` for `compileSdk` and `targetSdk`, switch CI to build a signed `bundleRelease`, and verify the resulting AAB in Play Console's bundle explorer.
**Reference:** https://support.google.com/googleplay/android-developer/answer/11926878

### [PENDING] C2. Configure Play App Signing and a release upload key
**What:** CI copies `keystore/debug.keystore` and publishes `app-debug.apk` at `.github/workflows/build-apk.yml:56-64`.
**Why critical:** A debug APK is not a production release artifact, and future updates require a stable protected signing path.
**Where:** `.github/workflows/build-apk.yml:56-64`, `keystore/debug.keystore`
**How:** Create a separate upload keystore outside Git, store its values in GitHub Actions secrets, configure a release signing task, enroll the package `com.attendance.app` in Play App Signing, and upload an AAB rather than the debug APK.
**Reference:** https://developer.android.com/studio/publish/app-signing

### [PENDING] C3. Publish a privacy policy and implement account deletion
**What:** No privacy-policy page or account-deletion flow was found in the tracked app files, while the app requires account creation and syncs attendance data to Firestore.
**Why critical:** Google Play requires a public privacy-policy URL in Play Console and inside the app; account-creation apps must also provide an accessible deletion path that deletes associated user data.
**Where:** `www/index.html`, `www/firebase-sync.js`, `README.md`
**How:** Publish a non-editable HTTPS policy covering Firebase Auth, Firestore, Gemini proxy processing, retention, and device-only timetable/photos. Add a signed-in Settings action that deletes the Firebase Auth user and `users/{uid}/sync/workspace`, then link the policy in the app and Play Console.
**Reference:** https://support.google.com/googleplay/android-developer/answer/10144311

### [PENDING] C4. Complete Play Console account and production-access requirements
**What:** Developer identity, app registration, app content declarations, and testing-track status cannot be verified from the repository.
**Why critical:** New personal developer accounts created after November 13, 2023 need a closed test with at least 12 continuously opted-in testers for 14 days before production access.
**Where:** Play Console > Dashboard, Testing > Closed testing, and Policy and programs > App content
**How:** Verify the developer account, create the app with package `com.attendance.app`, complete App access, Ads, Content rating, Target audience, Data safety, and privacy declarations, then complete the required closed test and apply for production access.
**Reference:** https://support.google.com/googleplay/android-developer/answer/14151465

### [PENDING] C5. Verify the production web deployment and Firebase authorized domains
**What:** The web app is deployed separately from Android, but the repository cannot verify that the live Vercel domain is an authorized Firebase domain or that its production environment is configured.
**Why critical:** A web launch can appear healthy while every sign-in or synced workspace request fails on the real domain.
**Where:** `vercel.json`, `server.js:1-104`, `README.md:15-17`
**How:** Deploy the current `www/` build to the production Vercel project, add the exact production and preview hostnames to Firebase Authentication authorized domains, verify Firestore deployment, and test sign-in, refresh, sign-out, and cross-device sync at the HTTPS URL.
**Reference:** https://firebase.google.com/docs/auth/web/ Google Authentication > Settings > Authorized domains

### [PENDING] C6. Verify web account deletion and privacy access
**What:** The same privacy and deletion requirements apply to the browser experience, and no in-app web privacy or account-deletion path was found.
**Why critical:** Web users must be able to review the policy and delete their account without installing the Android app.
**Where:** `www/index.html`, `www/firebase-sync.js`
**How:** Add a visible privacy-policy link and account-deletion action to the web Settings/account UI, require reauthentication where Firebase needs it, delete the Firestore workspace, and confirm the user is signed out afterward.
**Reference:** https://support.google.com/googleplay/android-developer/answer/10144311

## HIGH

### [PENDING] H1. Complete the Data safety declaration
**What:** The app uses Firebase Authentication, Firestore sync, phone verification, Firebase-hosted services, and an authenticated Gemini proxy, but no submitted Data safety declaration is visible in the repository.
**Why:** The Play listing must accurately describe collected, shared, and deletion behavior.
**Where:** Play Console > Policy and programs > App content > Data safety
**How:** Declare account identifiers and authentication data, synced attendance/timetable/preferences, network transmission, security practices, and the Gemini processing path. Align every answer with the published privacy policy.
**Reference:** https://support.google.com/googleplay/android-developer/answer/10787469

### [PENDING] H2. Prepare the complete store listing
**What:** The repository has app icons but no verified Play feature graphic, phone screenshots, short description, or full description package.
**Why:** A listing cannot be published without the required store assets and metadata.
**Where:** Play Console > Grow users > Store presence > Main store listing
**How:** Provide the 512×512 Play icon, feature graphic, screenshots, title, short description, full description, support email, and privacy-policy URL. Use real signed-in Classmark screens and do not include debug or localhost text.
**Reference:** https://support.google.com/googleplay/android-developer/answer/9866151

### [PENDING] H3. Verify Google OAuth production credentials
**What:** Web Google sign-in is implemented, but native Google sign-in is intentionally hidden and the production release SHA-1/SHA-256 fingerprints are not verifiable because Android is generated in CI.
**Why:** Google sign-in can fail for release users if the OAuth client, Firebase Android app, or release fingerprints are incomplete.
**Where:** `www/firebase-sync.js:230-253`, `.github/workflows/build-apk.yml:25-52`
**How:** Register the release package and both release fingerprints in Firebase and Google Cloud, verify authorized domains and OAuth consent-screen publication, then test native sign-in with a release-signed build before exposing the button.
**Reference:** https://firebase.google.com/docs/auth/android/google-signin

### [PENDING] H4. Verify Firebase production controls and App Check decision
**What:** `firestore.rules` correctly restricts the workspace to the matching signed-in UID, but deployment state, App Check, quota plan, and Auth provider settings are external and unverified.
**Why:** Production data protection depends on deployed rules and correctly configured Firebase services, not only the local rules file.
**Where:** `firestore.rules:13-47`, Firebase Console > Firestore > Rules and Authentication
**How:** Deploy and test the rules with authenticated and cross-user cases, verify email/password, Google, and phone providers, enable App Check where compatible, and confirm billing/quota alerts for the production project.
**Reference:** https://firebase.google.com/docs/firestore/security/rules-conditions

### [PENDING] H5. Run a signed release test matrix
**What:** CI currently verifies only a debug APK build; no release smoke test or device matrix is recorded.
**Why:** Authentication redirects, notifications, file import/export, share sheets, widget behavior, and portal/Gemini import can differ in a release build.
**Where:** `.github/workflows/build-apk.yml:60-64`, `scripts/patch_android.py`
**How:** Test the release AAB/APK on Android 12, 13, 14, 15, and 16 or representative devices: sign-in and sign-out, account sync, account deletion, reminders, widget refresh, import/export, offline behavior, deep links, and upgrade from the previous version.
**Reference:** https://developer.android.com/studio/publish/preparing

### [PENDING] H6. Align release version metadata
**What:** `package.json:3` reports version `1.0.5`, while README and release notes reference older release versions; Android `versionCode` and `versionName` are generated and not reviewable in this checkout.
**Why:** Inconsistent release metadata causes confusing Play uploads and makes rollback and support harder.
**Where:** `package.json:1-4`, `README.md:32`, `updates.md`
**How:** Choose one release version, set Android `versionCode` and `versionName` explicitly in the generated release configuration, update README/release links, and record the exact Git commit and AAB checksum for each upload.
**Reference:** https://developer.android.com/studio/publish/versioning

### [PENDING] H7. Configure and smoke-test the Vercel Gemini proxy
**What:** `server.js` requires `GEMINI_API_KEY` server-side, but production environment variables, API route deployment, rate limits, and the deployed model configuration are external and unverified.
**Why:** Portal and complex attendance imports must fail safely and must not expose the Gemini key in browser JavaScript.
**Where:** `server.js:14-28`, `server.js:75-104`, `lib/gemini-proxy.js`, `vercel.json`
**How:** Set `GEMINI_API_KEY` and any model setting in Vercel Production, verify `/api/gemini/status` does not expose the key, test the authenticated generate route, set usage limits, and confirm local Attended/Total parsing still works without Gemini.
**Reference:** https://vercel.com/docs/functions/environment-variables

### [PENDING] H8. Run a browser release test matrix
**What:** No automated or documented production-browser smoke test was found for the responsive web app.
**Why:** Login redirects, responsive layouts, clipboard import, file export, notifications, and Glass overflow can behave differently across browsers and viewport sizes.
**Where:** `www/index.html`, `www/firebase-sync.js`, `server.js`
**How:** Test the HTTPS deployment in current Chrome, Safari, and Firefox at mobile and desktop widths: sign-in, add/edit subject validation, portal paste, Gemini consent/retry/manual fallback, exports, reminders, Glass mode, offline/reload behavior, and cross-device sync.
**Reference:** https://web.dev/articles/lighthouse-performance

## MEDIUM

### [PENDING] M1. Add crash reporting and release monitoring
**What:** No Crashlytics, Sentry, or equivalent crash-reporting integration was found.
**Why:** Release-only Android and WebView failures will otherwise be difficult to diagnose.
**Where:** `package.json`, `.github/workflows/build-apk.yml`
**How:** Add a privacy-reviewed crash-reporting service, upload mapping/symbol files for release builds, and define an alert owner and rollback threshold.
**Reference:** https://firebase.google.com/docs/crashlytics/get-started?platform=android

### [PENDING] M2. Decide whether product analytics are needed
**What:** No analytics SDK or event taxonomy was found.
**Why:** Without a deliberate decision, launch issues and import/sign-in funnel failures cannot be measured.
**Where:** `package.json`, `www/index.html`
**How:** Either document that analytics are intentionally absent, or add a consent-aware analytics plan and include it in the privacy policy and Data safety declaration.
**Reference:** https://support.google.com/googleplay/android-developer/answer/10787469

### [PENDING] M3. Review notification and background behavior on Android 13+
**What:** `scripts/patch_android.py:34-38` adds notification and boot permissions, but the generated Android behavior and user-facing permission rationale are not verified.
**Why:** Unnecessary permissions or reminders that fail after reboot can create policy and trust problems.
**Where:** `scripts/patch_android.py:34-38`, `www/index.html:2916-2968`
**How:** Request notification permission only when the user enables reminders, test reboot rescheduling and denied permission states, and confirm the boot receiver is needed for the final Capacitor implementation.
**Reference:** https://developer.android.com/develop/ui/views/notifications/notification-permission

### [PENDING] M4. Run dependency and vulnerability review before release
**What:** The project uses Capacitor 6, Firebase 12, Google Auth plugin RC4, jsPDF, and SheetJS, but no automated dependency audit is part of CI.
**Why:** Release builds should not ship known vulnerable or unsupported dependencies.
**Where:** `package.json:8-18`, `package-lock.json`
**How:** Run `npm audit --omit=dev`, review advisories manually, pin a supported Google Auth plugin release if available, and add a scheduled dependency audit workflow.
**Reference:** https://docs.npmjs.com/cli/v10/commands/npm-audit

### [PENDING] M5. Add web security headers and deployment checks
**What:** The local server sets `X-Content-Type-Options`, but the production Vercel response headers and Content Security Policy are not verified.
**Why:** Browser security headers reduce script injection and framing risk for the signed-in web workspace.
**Where:** `server.js:20-26`, `vercel.json`
**How:** Add and verify HTTPS-only deployment, `Content-Security-Policy` compatible with Firebase, Vercel functions, and the required font/assets, plus `Referrer-Policy`, `Permissions-Policy`, and frame protection. Confirm the policy does not allow the Gemini key or unsafe inline script expansion.
**Reference:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy

### [PENDING] M6. Run web accessibility and performance checks
**What:** No Lighthouse or automated accessibility/performance check is part of CI.
**Why:** The web app is a first-class product surface and should remain usable on slower student devices and keyboard or screen-reader navigation.
**Where:** `www/index.html`, `.github/workflows/`
**How:** Run Lighthouse on the production URL, fix high-impact accessibility and performance findings, and record a baseline for mobile performance before launch.
**Reference:** https://developer.chrome.com/docs/lighthouse/overview

## LOW

### [PENDING] L1. Add localization and accessibility review
**What:** User-facing strings are embedded in `www/index.html`; no translation resource structure was found.
**Why:** Localization and screen-reader review improve launch quality for a student audience.
**Where:** `www/index.html`
**How:** Run TalkBack and large-font checks, then extract high-traffic strings if Hindi or other launch locales are planned.
**Reference:** https://developer.android.com/guide/topics/resources/localization

### [PENDING] L2. Add adaptive launcher icons
**What:** `scripts/patch_android.py:44-56` rasterizes one source image into density folders and removes `mipmap-anydpi-v26`.
**Why:** Adaptive icons provide more consistent launcher rendering on modern Android devices.
**Where:** `scripts/patch_android.py:44-56`, `icon.png`
**How:** Supply adaptive foreground/background resources and preserve the v26 launcher XML while retaining the Play listing icon separately.
**Reference:** https://developer.android.com/develop/ui/views/launch/icon_design_adaptive

### [PENDING] L3. Add a repeatable pre-release checklist to CI
**What:** CI builds and uploads a debug APK but does not run a smoke test, validate the manifest, or publish checksums.
**Why:** Repeatable checks reduce accidental regressions between rollback points.
**Where:** `.github/workflows/build-apk.yml`
**How:** Add HTML syntax checks, Firestore rules tests, release artifact metadata, SHA-256 checksums, and a manual approval gate for production tags.
**Reference:** https://docs.github.com/en/actions/deployment/about-deployments/deploying-with-github-actions

### [PENDING] L4. Verify PWA install and offline fallback
**What:** `www/manifest.json` exists, but installability, icons, service-worker behavior, and offline fallback are not verified as part of release checks.
**Why:** Students may use the web app as an installed home-screen experience instead of the APK.
**Where:** `www/manifest.json`, `www/index.html`
**How:** Test install prompts and standalone mode in Chrome and Safari where supported, verify icons and theme colors, and document which screens work offline versus requiring Firebase or Gemini connectivity.
**Reference:** https://web.dev/learn/pwa

---

## Change log
- 2026-11-19 00:00 IST - Created from Android Go-Live Checklist review.
- 2026-11-19 00:00 IST - Expanded the checklist to cover the responsive web deployment and browser release path.

## Severity definitions
- **CRITICAL** - Play Store will reject the app, or the app will not function at launch
- **HIGH** - Strongly recommended before launch for security, store quality, or release reliability
- **MEDIUM** - Should be completed soon after launch if not before
- **LOW** - Nice to have or post-launch improvement
