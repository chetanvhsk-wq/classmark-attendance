# Classmark Updates

**Last updated: November 21, 2026**

This file tracks the major features and improvements added to Classmark.

## Before November 15, 2026

The first build phase included many small fixes and foundation changes that made the later redesign possible:

- Imported and organized the original Android attendance project into the Classmark workspace.
- Established the single-page web app and Capacitor Android build path from the shared www/ source.
- Added Firebase project configuration, Authentication, Firestore rules, and per-user cloud synchronization.
- Added email/password, Google, and phone sign-in flows with authorized-domain guidance.
- Added the server-side Gemini proxy, environment-variable support, and secret-safe deployment configuration.
- Added Vercel deployment configuration and connected the live web app at classmark-attendance-nexus-9af5.vercel.app.
- Added local vendor bundling for Firebase, jsPDF, and SheetJS so the app does not depend on runtime CDNs.
- Added attendance text parsing, ERP-table import, percentage recalculation from present/absent counts, and review-before-apply behavior.
- Added timetable image upload, manual timetable editing, reminder scheduling, Android notifications, and widget support.
- Added JSON/CSV/PDF/Excel export and import flows, then refined the reports with summary metrics, charts, and insights.
- Added responsive touch interactions, swipe attendance marking, navigation states, loading states, settings controls, and mobile layout fixes.
- Added the Classmark icon, sign-in branding, theme controls, font choices, accent colors, glass navigation, and accessibility improvements.
- Removed unnecessary browser/search/Giphy integrations while keeping the useful AI overview and analysis features.

These smaller foundation commits are part of the project history even when they were later combined, refined, or replaced by the larger November 15–16 changes.

## Attendance import and overview

- Added local parsing for copied attendance tables and unstructured ERP text; basic text imports work without a Gemini API key.
- Added a review step so course matches and attendance counts can be checked before applying.
- Attendance percentages are calculated from **Present ÷ (Present + Absent)**. Imported percentage and total fields are not trusted as the source of truth.
- Added optional Gemini processing for complex text and attendance screenshots.
- Kept the AI Overview and Analysis tools while removing the Browser, Search, and AI attendance-sync sections.

## Timetable and reminders

- Added timetable photo and screenshot upload, with optional Gemini extraction of weekly class slots.
- Added manual timetable entry and editing.
- Added class-day attendance reminders, defaulting to **7:00 PM**. The reminder time can be changed in settings.
- Reminders are based on timetable entries and skip classes already marked for that day.
- Added Android local notifications and attendance home-screen widget support.

## Data, sign-in, and exports

- Added Firebase Authentication options for email and password, Google sign-in, and phone verification.
- Added Firestore account sync so attendance and timetable data can follow the same signed-in account across devices.
- Kept Gemini keys, timetable photos, and wallpapers on the device.
- Added PDF and Excel exports. Excel workbooks include Overview, Daily Log, and Weekly Timetable sheets.
- Simplified the PDF to two focused pages: page 1 contains the important percentages and counts; page 2 contains only the attendance pie chart and subject bar graph.
- Added an Excel Insights sheet with key metrics, subject bar visuals, present/absent pie-chart data, filters, frozen headers, and improved column sizing.
- Added JSON and CSV export, plus data-file import.

## November 19, 2026 — Home customization and class entry

- Restored the animated Home Glyph card from the reference deployment.
- Restored the full Glyph editor: animated presets, color palette, text/initials mode, and custom 20×10 dot drawing with clear/reset.
- Added an explicit On/Off control for the Glyph card in Settings; the card can also be renamed or hidden from its editor.
- Made all four Home cards editable: Overall, Subjects, Safe subjects, and Glyph.
- Restored the persistent floating **Add class** button across the app, while retaining the inline Add subject control below the Home list.
- Updated the README and changelog to document the restored controls.

## November 19, 2026 — Import reliability and Glass polish

- Added a permanent **Add subject** row below the Home subject list and kept **Add class** available throughout the app.
- Added a first-screen **Paste from your college portal** entry point for importing multiple subjects.
- Added inline Edit subject validation for required names and invalid attended/total counts; Save stays disabled until the form is valid.
- Added local parsing for standard Attended/Total tables before any Gemini fallback, with a consent step before sending data to Gemini.
- Added one automatic retry for temporary Gemini failures, followed by a clear Classmark error and **Add manually** fallback.
- Fixed a small horizontal overflow in Glass mode so the page no longer leaves a right-side scroll gap.
- Added a public privacy-policy page, login and Settings links to it, and a signed-in Delete account and data action for the Firebase Auth user and synced workspace.

## Interface and visual design

- The persistent floating Add class button is available across the web UI; subject creation also remains available from Home controls.
- Added Skeuomorphic, Glass, Matte, and Normal interface styles, with light and dark appearance options.
- Updated theme styling so the chosen interface style applies across cards, settings, inputs, dialogs, and other surfaces.
- Refined Glass mode with translucent blurred surfaces and a transparent page/navigation background.
- Added the persistent liquid-glass navigation pill with an animated active tab.
- Improved selected-theme feedback and the account-loading screen.
- Made theme and font choices native keyboard-accessible buttons with previews for each style.
- Restored the tactile glass surface system across cards, controls, settings, overlays, and navigation, based on the saved reference deployment.
- Made theme, appearance, and style-color controls native buttons with persistent pressed states for touch, keyboard, web, and Android use.
- Reinstated distinct Skeuomorphic, Glass, Matte, and Normal surface treatments so selecting an interface style visibly changes the full application.
- Simplified the sign-in page with readable dark-glass styling and reduced field/button glow.
- Added the supplied Classmark app icon to the sign-in brand and signed-in Home header.
- Restored the editable animated Glyph card from the supplied reference deployment, with an explicit Settings toggle.

## Web and Android app

- Maintained the web app and Capacitor Android app from the same project.
- Connected the GitHub repository to Vercel for web deployments.

## Chronological project log

Times below are repository commit times converted to IST (Asia/Kolkata).

### November 15, 2026

- **15:09** — Simplified sign-in and applied the Classmark logo.
- **15:10** — Recorded the sign-in/logo polish in the project documentation.
- **19:37** — Made theme and font selectors accessible and previewable.
- **19:38** — Documented the accessible theme and font controls.
- **19:57** — Added the glass-navigation screenshot to the repository.
- **19:57** — Showed the glass-navigation screenshot in the README.
- **16:00–16:01** — Restored tactile glass styling and reliable theme controls; documented the restored tactile system.
- **16:18–16:20** — Added playful tactile control feedback, documented it, then reverted the overly aggressive tactile styling and removed the reverted note.
- **19:04–19:05** — Added polished PDF/Excel export layouts, an Excel Insights visual, and the focused two-page PDF summary/chart design.

### November 16, 2026

- **19:36** — Removed the persistent floating plus action from the web and Android UI while keeping subject creation in Home controls.
- **19:36** — Documented the floating-plus removal.
- **19:39–19:40** — Added GitHub Packages npm metadata, package documentation, publish workflow, and npm authentication configuration.
- **19:41** — Published the Classmark v1.0.0 GitHub Release and published the classmark-attendance npm package to GitHub Packages. The Android APK workflow completed successfully and attached the APK to the release.
- **20:03** — Replaced the README with the polished Classmark presentation, badges, origin/credits, setup documentation, and privacy guidance.
- **20:07** — Linked the Live demo, Firebase, and Vercel badges to the deployed Classmark app.
- **20:11** — Moved the README screenshot section to the end for a cleaner landing page.

### Current release state

- **Latest published GitHub Release: v1.0.7**, published November 20, 2026.
- v1.0.7 includes the verified Class Mark branding and the latest reminder reliability fixes.
- The published Android artifact remains a debug-signed APK, not a Play Store-signed release.
- v1.0.6 is present as a repository tag but is not the latest published release.

- Live web app: [classmark-attendance-nexus-9af5.vercel.app](https://classmark-attendance-nexus-9af5.vercel.app/)
- GitHub release: [Classmark v1.0.7](https://github.com/chetanvhsk-wq/classmark-attendance/releases/tag/v1.0.7)
- GitHub Package: [classmark-attendance](https://github.com/users/chetanvhsk-wq/packages/npm/package/classmark-attendance)
- Latest Android workflow: [Build Android APK #38](https://github.com/chetanvhsk-wq/classmark-attendance/actions/runs/43883182553)

### November 16, 2026 — Android Firebase sign-in fix

- Fixed Google sign-in for the Android APK by switching native Capacitor builds from popup authentication to Firebase redirect authentication.
- Added redirect-result handling when the APK returns from the system browser.
- Web browser sign-in continues using the popup flow.
- Firebase authorized domains and the Android package registration were verified in project attended-9480d.
- Commit: 909f60d.

## November 20, 2026 — v1.0.7 stability release

- Audited browser and Android class reminders, including permission requests, rescheduling, notification payloads, and tap actions.
- Replaced silent browser/Android notification failures with console diagnostics and visible in-app fallbacks.
- Serialized Android reminder schedule updates and limited cancellation to Classmark-owned reminder IDs.
- Added a validated reminder action payload that routes notification taps to the Home attendance view.
- Verified the committed Class Mark logo remains the source artwork for the app, PWA, favicon, and Android icon generation; no icon asset replacement appeared in commit history.
- Added a Stable Release redirect in the README and moved the problem/update logs into this folder.
- Passed Android build workflow [44663156874](https://github.com/chetanvhsk-wq/classmark-attendance/actions/runs/44663156874); it generated and uploaded `classmark.apk` as the `attendance-apk` artifact.
- Updated GitHub Actions to current Node 24-compatible major versions after CI surfaced Node 20 deprecation warnings.
- Published state: **v1.0.7 is the latest GitHub Release**. The Android APK attached to it remains debug-signed and is not Play Store-ready.
- CI now renames the generated APK to `classmark.apk` for the downloadable artifact and eventual release attachment.
- The repository has no separate lint or test suite configured.
