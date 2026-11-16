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

## Current known limitation

Native Google sign-in is intentionally hidden in the APK until a production signing certificate is used. Email/password and phone sign-in work in the APK. Google sign-in remains available on the web app.
