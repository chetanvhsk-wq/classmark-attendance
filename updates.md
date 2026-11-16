# Classmark Updates

**Last updated: November 15, 2026**

This file tracks the major features and improvements added to Classmark.

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

## Interface and visual design

- Removed the persistent floating plus button from the bottom-right on web and Android; subject creation remains available from the Home controls.
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
- Removed the Giphy section and decorative glyph treatment.

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

- Live web app: [classmark-attendance-nexus-9af5.vercel.app](https://classmark-attendance-nexus-9af5.vercel.app/)
- GitHub release: [Classmark v1.0.0](https://github.com/chetanvhsk-wq/classmark-attendance/releases/tag/v1.0.0)
- GitHub Package: [classmark-attendance](https://github.com/users/chetanvhsk-wq/packages/npm/package/classmark-attendance)
- Latest Android workflow: [Build Android APK #38](https://github.com/chetanvhsk-wq/classmark-attendance/actions/runs/43883182553)
