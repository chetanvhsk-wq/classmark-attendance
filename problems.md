# Problems overcome

This project evolved from a local attendance prototype into a synced web and Android app. The main problems solved were:

- Parsed pasted, unstructured campus attendance text into reliable course records.
- Calculated attendance from present and absent counts instead of trusting pasted percentages.
- Added timetable photo import, timetable editing, daily reminders, and configurable reminder times.
- Added clean PDF and Excel exports with summaries, insights, charts, and timetable sheets.
- Added Firebase email/password, phone authentication, Firestore sync, and multi-device workspace merging.
- Added Google sign-in for the web app and configured the Android Firebase app, OAuth client, SHA-1, and SHA-256 certificates.
- Fixed the Android APK opening an unreachable `localhost` URL during authentication.
- Kept native Android authentication stable by hiding the unfinished Google button in the APK while retaining email and phone login.
- Kept Google, email, and phone login available on the web app.
- Fixed dark mode, glass/matte/normal interface styles, font styles, responsive layouts, and touch interactions.
- Fixed mobile overflow, bottom navigation spacing, and the first-screen drag interaction.
- Removed the floating plus action from the bottom-right UI.
- Improved release automation, Android workflow compatibility, Firebase configuration injection, and APK publishing.
- Added release assets, update history, README links, and reproducible Android builds.

## Work completed on 18 November 2026

- Fixed class reminder scheduling so changing reminder settings, reminder time, or timetable data reschedules notifications immediately.
- Fixed browser reminder fallback so an unavailable notification permission does not incorrectly mark a reminder as already delivered.
- Improved the Glass interface with moving ambient highlights, frosted surfaces, and clearer contrast across the UI.
- Kept Matte and Normal styles readable instead of allowing theme styles to collapse into an all-black screen.
- Verified the JavaScript syntax and installed dependencies with `npm ci --ignore-scripts`.
- Updated the root package version and corrected the published package version used by GitHub Packages.
- Removed the incorrect `v1.0.5` release and rebuilt the single `v1.0.4` release from the corrected commit.
- Confirmed the GitHub Packages workflow completed successfully.
- Built the Android APK successfully through GitHub Actions and attached `app-debug.apk` to the `v1.0.4` GitHub release.
- Documented the release fixes, including reminders, theme fixes, package publishing, and APK delivery.

## Release verification

- Release: [Classmark v1.0.4](https://github.com/chetanvhsk-wq/classmark-attendance/releases/tag/v1.0.4)
- APK: [app-debug.apk](https://github.com/chetanvhsk-wq/classmark-attendance/releases/download/v1.0.4/app-debug.apk)
- Corrected release commit: `c49876a`

## Current known limitation

Native Google sign-in is intentionally hidden in the APK until a production signing certificate is used. Email/password and phone sign-in work in the APK. Google sign-in remains available on the web app.

The Android Firebase configuration is supplied through the encrypted `GOOGLE_SERVICES_JSON` GitHub Actions secret. A previously exposed API key was removed from tracked source/configuration; any key that was publicly exposed should also be revoked and replaced in Google Cloud/Firebase.
