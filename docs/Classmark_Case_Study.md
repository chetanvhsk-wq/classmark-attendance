# Classmark — Technical Case Study and Project Report

> **Project:** Classmark — Student Attendance Tracker  
> **Repository:** https://github.com/chetanvhsk-wq/classmark-attendance  
> **Live application:** https://classmark-attendance-nexus-9af5.vercel.app/  
> **Platforms:** Web / Progressive Web App (PWA) and Android  
> **Branch reviewed:** `main`  
> **Review date:** 19 November 2026  
> **Document type:** Implementation-based technical case study

---

## 1. Executive Summary

Classmark is a student-focused attendance management application designed to make attendance tracking more actionable. Instead of presenting only a percentage, it calculates whether a student is above or below a chosen attendance target and estimates how many future classes can be missed or must be attended to reach that target.

Students can create subjects, enter previously accumulated attendance, record individual present or absent classes, backfill earlier dates, review attendance history, and view trends. The app also supports importing attendance information from copied college-portal text or tables, optional AI assistance for complex inputs and timetable images, and exporting data into common formats.

The repository implements a shared web application packaged for Android through Capacitor. Firebase Authentication provides signed-in access, while Cloud Firestore stores each user's workspace under a user-specific document path. A native Android home-screen widget displays an overall percentage and a short list of subjects. Reminders are implemented through Android Local Notifications and Web Notifications.

Classmark's core value is decision support: it translates attendance records into a practical answer to the question, **“Can I miss the next class and still remain above my target?”** The reviewed source confirms the application architecture and documented functions. It does not, by itself, establish numerical claims about attendance accuracy, adoption, availability, or production reliability; those require measured testing.

## 2. Problem Statement

Students often track attendance across several subjects, each with a separate present/absent total and minimum attendance requirement. A percentage on its own may not make the consequences of missing another class obvious. Students may have to calculate manually whether they can afford to miss a lecture or how many consecutive classes they need to attend to recover.

A second practical problem is data entry. Attendance may be available in a college portal, copied table, screenshot, or timetable, making manual entry repetitive. Students also need their records to remain available across devices and to have a backup they can export.

### 2.1 Problems addressed

- Attendance information is distributed across multiple subjects.
- Students need to understand the practical effect of future absences.
- Manual calculations are inconvenient and easy to get wrong.
- Backdated attendance corrections and day-level history are useful.
- Re-entering attendance on more than one device creates friction.
- Importing portal data and maintaining a timetable can be repetitive.
- Students need portable backups and readable reports.

### 2.2 Proposed solution

Classmark provides a unified workspace in which each subject has an attendance target, baseline counts, and dated class records. It calculates attendance from present and absent counts, provides skip/attend guidance, and supports cloud sync for the signed-in account.

## 3. Project Objectives

1. Provide a simple way to create and manage multiple subjects.
2. Track attendance at an individual class/date level.
3. Calculate attendance percentage from present and total class counts.
4. Allow each subject to have a configurable target percentage.
5. Estimate how many future classes can be missed without falling below the target.
6. Estimate how many consecutive classes must be attended to reach the target.
7. Support editing, removing, and backfilling attendance records.
8. Provide a statistics view with trends and calendar-style history.
9. Import attendance data from pasted text and structured tables.
10. Support timetable entry and image-assisted timetable extraction.
11. Keep user data synchronized across devices using Firebase.
12. Provide export and import options for user-managed backups.
13. Offer reminders and an Android home-screen attendance widget.
14. Provide a responsive web interface and Android application from a shared codebase.

## 4. Scope of the Project

### 4.1 Functionality present in repository documentation/source

- Subject creation and editing.
- Configurable target attendance percentage.
- Present/absent class marking.
- Backdated marks and record corrections.
- Attendance percentage and skip/attend calculations.
- Home summary cards and customization.
- Statistics, trend view, 84-day heatmap, weekly recap, and day log.
- Attendance portal text/table import.
- Optional Gemini processing for complex attendance imports and timetable images.
- Weekly timetable and reminders.
- JSON, CSV, PDF, and Excel export/import flows.
- Firebase sign-in and Firestore workspace sync.
- Native Android home-screen widget.
- Multiple interface styles, light/dark modes, fonts, and accent settings.
- Account deletion flow and privacy-policy page.

### 4.2 Boundaries and exclusions

Classmark is a personal attendance tracker. The reviewed repository does not implement direct integration with a college ERP backend, automatic attendance capture from classroom hardware, biometric attendance, or an institution-wide administrator/teacher management portal. Users remain responsible for the accuracy of the attendance they enter or import.

## 5. System Overview

### 5.1 High-level architecture

```text
                 Student
                    |
          +---------+----------+
          |                    |
          v                    v
     Web / PWA            Android App
    (www/index.html)      (Capacitor 6)
          |                    |
          +---------+----------+
                    |
           Shared Classmark UI
                    |
         +----------+-----------+
         |          |           |
         v          v           v
   Attendance    Import &    Export /
   calculations  Timetable   Backup
         |          |
         |          v
         |      Gemini Proxy
         |          |
         |       Vercel API
         |          |
         |      Gemini API
         |
         v
    Local Workspace State
         |
         v
    Firebase Authentication
         |
         v
    Cloud Firestore
  users/{uid}/sync/workspace
         |
         +------ Realtime listener
         |
         v
   Other signed-in devices

 Android-specific:
   Capacitor plugins -> Local Notifications / Share
   Native widget     -> Android AppWidgetProvider
```

### 5.2 Application layers

| Layer | Responsibility |
|---|---|
| Presentation | Single-page HTML/CSS/JavaScript interface in `www/index.html` |
| Attendance domain | Subject state, dated records, calculations, statistics, import/export |
| Authentication | Firebase Authentication client |
| Cloud persistence | Firestore user workspace document |
| AI integration | Authenticated server-side Gemini proxy |
| Android bridge | Capacitor plugins and native Java overlay |
| Deployment | Vercel web/API deployment and GitHub Actions Android build |

The main UI is implemented in a large single-page file. The Firebase authentication and synchronization code is separated into `www/firebase-sync.js`.

## 6. Technology Stack

| Technology | Role in Classmark |
|---|---|
| HTML5 | Application structure |
| CSS | Responsive layout, themes, visual effects, motion and accessibility states |
| JavaScript | UI interaction, attendance logic, import/export workflows |
| Node.js | Local development server and server-side API logic |
| Capacitor 6 | Packages the shared web application as an Android app |
| Firebase Authentication | Email/password, Google and phone sign-in flows |
| Cloud Firestore | Signed-in user's synchronized workspace |
| Firebase JS SDK | Client authentication and Firestore operations |
| Gemini API | Optional AI-assisted processing for complex inputs |
| Vercel Functions | Server-side Gemini request proxy |
| Java / Android SDK | Native Android widget and activity integration |
| GitHub Actions | Automated Android debug APK build |
| jsPDF | PDF report export |
| SheetJS (xlsx) | Spreadsheet export/import |

The root `package.json` identifies the project as version `1.0.6`. Exact dependency versions and available scripts should be checked against that file when reproducing a build.

## 7. Core Attendance Model and Calculations

### 7.1 Attendance percentage

The project documentation states that attendance is recalculated from present and absent counts rather than trusting an imported percentage.

Let:
- (P) = number of present classes.
- (A) = number of absent classes.
- (T = P + A) = total counted classes.

[
\text{Attendance \%} = \frac{P}{P + A} \times 100
]

If (P+A=0), the application must treat the percentage as undefined or as a no-record state rather than divide by zero.

### 7.2 Classes that can be missed

Let (r) be the target percentage as a fraction (for example, 75% = 0.75). If a student has (P) present classes and (T) total classes, then after missing (x) additional classes the percentage becomes:

[
\frac{P}{T+x}
]

The maximum number of additional absences that keeps the percentage at or above target is the largest integer (x) satisfying:

[
\frac{P}{T+x} \ge r
]

For (r>0), this gives:

[
x_{\max} = \max\left(0,\left\lfloor\frac{P}{r}-T\right\rfloor\right)
]

This is a mathematical interpretation of the “Can skip” guidance. Test boundary cases against the UI implementation before treating the formula as a formal verification of the code.

### 7.3 Consecutive classes needed to reach the target

If current attendance is below target, assume the student attends the next (n) classes. The resulting percentage is:

[
\frac{P+n}{T+n}
]

The minimum whole number (n) must satisfy:

[
\frac{P+n}{T+n} \ge r
]

For (0 \le r < 1), rearranging gives:

[
n_{\min} = \left\lceil\frac{rT-P}{1-r}\right\rceil
]

The app's visible guidance is described in the README as “Need to attend” and “Can skip.” The implementation should be tested at boundary values (no classes, exactly on target, zero target, 100% target, and already below target) before making a formal correctness claim.

### 7.4 Baseline counts and dated records

The changelog and synchronization code refer to both baseline counts and dated class records:
- `basePresent` and `baseTotal` represent attendance entered before using detailed daily marking.
- `records` stores date-keyed attendance marks.
- Imported or manually backfilled records can then be included in the workspace.

This hybrid approach allows students to start with already accumulated attendance rather than entering every historical class one at a time.

## 8. Functional Modules

### 8.1 Subject management

Students can add subjects and configure a target percentage. The application presents subject cards and exposes subject-editing controls. The project changelog documents validation for required subject names and attended/total counts, preventing invalid values from being saved through the relevant edit form.

### 8.2 Daily attendance marking

The README documents Present and Absent controls, including swipe interactions on subject cards. Students can choose another date when recording older attendance and can edit or remove individual marks.

### 8.3 Skip/attend decision guidance

Each subject displays current attendance status relative to its target and a practical future-class calculation. This is the product's main distinction from trackers that show a percentage only.

### 8.4 Home dashboard

The Home screen contains configurable summary cards, including Overall, Subjects, Safe subjects, and an animated Glyph card. The changelog documents customization of card visibility, labels, and the Glyph appearance.

### 8.5 Statistics and history

The README documents:
- Attendance trend graph.
- 84-day heatmap.
- Weekly recap with a shareable image.
- Day log.
- Subject reordering.

### 8.6 Attendance portal import

The project documentation describes local parsing for copied portal text and standard Attended/Total tables. The documented flow attempts deterministic local parsing first. Gemini assistance is available as a fallback for more complex inputs, with user consent before sending information for AI processing, retry handling, and a manual-add fallback.

Imported data should be reviewed before applying it. A parser can encounter unfamiliar portal formats, duplicated rows, or ambiguous course names.

### 8.7 Timetable management

The application supports manual weekly timetable entry and timetable image/screenshot import with optional Gemini extraction. The weekly timetable can be used to drive reminders. Timetable photos remain on-device according to the README's privacy description.

### 8.8 Reminders

The project documents Android Local Notifications and Web Notifications. Reminders are configurable and use the user's timetable data. The repository also records limitations: Android battery-management behavior can affect delivery, reminder scheduling is maintained over a rolling 14-day window when the application runs, and force-stop or reboot behavior should be tested on target devices.

### 8.9 Export and backup

The README lists the following formats:
- JSON for a structured backup.
- CSV for tabular attendance data.
- PDF for a formatted summary and charts.
- Excel for workbook-based review.

The app also provides import flows. Exported backups may contain personal attendance information and should be stored and shared carefully.

### 8.10 Android home-screen widget

The native Java `AttendanceWidgetProvider` reads a JSON payload from Android SharedPreferences and displays:
- Overall attendance percentage.
- Up to four subject names and percentages.
- Subject-specific text colors when valid.

Tapping the widget opens the application. The widget is a compact display surface, not an independent attendance database.

### 8.11 Personalization and interface design

The app documents Skeuomorphic, Glass, Matte, and Normal interface styles, light/dark appearance, accent colors, wallpaper opacity, and font choices. The responsive UI uses touch-oriented interactions and a persistent Add class entry point.

## 9. Authentication, Cloud Sync, and Data Security

### 9.1 Authentication methods

The Firebase client code imports Firebase Authentication methods for:
- Email/password account creation and sign-in.
- Google sign-in on the web.
- Phone number verification.
- Sign-out.
- User account deletion.

The README and Firebase client code note that native Google sign-in is intentionally hidden in the Android application until the production signing configuration is verified. Email/password and phone sign-in remain available in the APK; the web app exposes Google sign-in.

### 9.2 Firestore workspace structure

The client uses a named Firestore database and writes a workspace document at:

```text
users/{uid}/sync/workspace
```

The written workspace contains `schemaVersion`, `state`, `settings`, and `updatedAt`. The state includes subject data; settings include selected interface preferences, reminder values, and timetable information. The client listens for remote changes using Firestore's `onSnapshot` listener and applies merges to the local workspace.

### 9.3 Per-user access rules

The reviewed `firestore.rules` checks that the authenticated user's UID matches the UID in the document path. It limits access to the `workspace` document, validates expected top-level keys, constrains the subject list and timetable list, and denies all other document access by default.

This is an important application-level control. However, repository rules only provide protection once deployed to the intended Firebase project. Production rule deployment and cross-account authorization tests are external verification tasks.

### 9.4 Workspace merge behavior

The client merges remote and local subject state, using a normalized subject code when available and otherwise a normalized subject name as the matching key. It merges dated record arrays and combines timetable entries while removing duplicate day/subject pairs.

Multi-device conflict behavior is complex. The implementation should be tested with concurrent edits to the same subject/date, offline edits, duplicate subject names, and two devices reconnecting in different orders. A successful sync indicator alone does not prove every conflict case is resolved as intended.

### 9.5 Account deletion

The Firebase client exposes a signed-in deletion flow that confirms the action, deletes the user's workspace document, and then deletes the Firebase Authentication user. The README says users can reach this from Settings. Production testing should confirm all account-associated data is removed, including any additional data introduced in future versions.

## 10. AI-Assisted Processing Architecture

### 10.1 Purpose

Gemini is used as an optional helper for inputs that are harder to parse deterministically, such as complex attendance screenshots or timetable images. The project documentation describes local text/table parsing as the first path for standard inputs.

### 10.2 Request path

```text
Signed-in Classmark client
          |
          | Firebase ID token
          v
     Vercel API route
          |
          v
   Verify Firebase token
          |
          v
    Gemini proxy module
          |
          v
      Gemini API
          |
          v
  Structured response to client
```

The server-side handler requires a Bearer token and calls `verifyFirebaseIdToken` before forwarding a request to the Gemini generation module. The API key is read on the server side from environment configuration; the README warns not to place the Gemini key in browser code or public client variables.

### 10.3 Privacy and reliability safeguards

- AI processing is optional.
- Standard attendance text/table parsing is available locally.
- The documented flow requests consent before using Gemini fallback processing.
- A temporary AI failure should not prevent manual attendance entry.
- Server-side authorization is checked before generation.
- The Gemini API key is not intended to be sent to the browser or written to Firestore.

Do not submit sensitive personal or institutional information to an external AI service unless the user understands and accepts that processing.

## 11. Android Packaging and Continuous Integration

### 11.1 Shared application

The web UI under `www/` is packaged into Android through Capacitor. The repository includes a Capacitor configuration, Android overlay Java sources, and a Python patch script that adds native resources such as widget-related files, permissions, and icons after the Android platform is generated.

### 11.2 Build process documented in README

```bash
npm ci
npx cap add android
python3 scripts/patch_android.py
npx cap sync android
cd android && ./gradlew assembleDebug
```

The documented output is `android/app/build/outputs/apk/debug/app-debug.apk`.

The Android Firebase configuration is deliberately not tracked as a normal repository file. The README instructs developers to provide `google-services.json` locally or use the `GOOGLE_SERVICES_JSON` GitHub Actions secret during CI.

### 11.3 Current build limitation

The repository's Go-Live Checklist states that the CI workflow builds a debug APK using `assembleDebug`. The README also states that the debug keystore is used and must be replaced with a protected release signing setup before Play Store publication. A debug APK build is not proof that a Play-ready signed Android App Bundle has been generated.

## 12. Deployment Architecture

### 12.1 Web deployment

The README identifies Vercel as the web hosting platform. The build process vendors browser dependencies locally and publishes the `www/` directory. Firebase Authentication authorized domains must include the production hostname for sign-in to work correctly.

### 12.2 Local development

The README documents Node.js 20+, JDK 17, Android SDK, and Python 3 with Pillow as requirements. For a web preview:

```bash
npm ci
npm run dev
```

The app is served at `http://localhost:8000`. A local `.env` file can contain `GEMINI_API_KEY`; it is read by the Node server rather than injected into browser code.

### 12.3 Server-side request protections observed

The local server:
- Limits JSON request bodies to 8 MiB.
- Requires a Firebase Bearer token for Gemini generation.
- Verifies the token before processing.
- Returns JSON with no-store caching and `X-Content-Type-Options: nosniff`.
- Restricts the development server to loopback hostnames.

These are source-level observations. Production Vercel configuration, API usage limits, and deployed headers still need external verification.

## 13. Representative User Journey

1. A student opens Classmark on the web or Android.
2. The student signs in using an available authentication method.
3. The student creates a subject and sets an attendance target.
4. The student enters existing present/total counts where needed.
5. After a lecture, the student marks the class Present or Absent.
6. Classmark recalculates the current percentage and future skip/attend guidance.
7. The student reviews the subject history, trends, and overall summary.
8. The student imports portal information or a timetable if needed, reviews extracted content, and applies it.
9. The student's workspace synchronizes to other devices signed in with the same account.
10. The student exports a backup or report when required.

## 14. Testing and Validation Plan

The repository contains a Go-Live Checklist with pending release-verification items. The following is a recommended functional and non-functional test plan. It is not a claim that every test has already been performed.

| Test ID | Area | Test | Expected result |
|---|---|---|---|
| F01 | Subject management | Add a subject with a valid name and target | Subject is saved and displayed |
| F02 | Validation | Save a blank subject name | Form prevents saving and explains the error |
| F03 | Attendance | Mark a class Present | Present count and percentage update |
| F04 | Attendance | Mark a class Absent | Total count and percentage update |
| F05 | Backfill | Add a record for an earlier date | Day history reflects the selected date |
| F06 | Correction | Edit or remove an existing mark | Totals and percentage recalculate |
| F07 | Target logic | Test a subject above target | Skip guidance is non-negative and mathematically consistent |
| F08 | Target logic | Test a subject below target | Required-attendance guidance is calculated |
| F09 | Edge cases | Test zero total classes and 100% target | No divide-by-zero or invalid result |
| F10 | Import | Paste a standard Attended/Total table | Local parser extracts candidate course counts |
| F11 | Import | Paste an unfamiliar portal format | Review/fallback/manual entry path is shown |
| F12 | AI privacy | Decline AI fallback | No Gemini request is made |
| F13 | AI processing | Accept AI fallback for a complex input | Authorized request is processed or a clear error is shown |
| F14 | Sync | Sign into the same account on two devices | Workspace changes propagate |
| F15 | Sync | Sign into a different account | First user's workspace is not visible |
| F16 | Conflict | Edit the same subject on two devices while offline | Merge behavior is consistent and documented |
| F17 | Export | Export JSON, CSV, PDF, and Excel | Files are created and readable |
| F18 | Import | Re-import a valid backup | Workspace is restored without unintended duplicates |
| F19 | Reminders | Enable/disable reminders and change time | Schedule reflects the new settings |
| F20 | Widget | Change attendance and refresh widget | Overall and subject values update |
| F21 | Account | Delete account and workspace | User is signed out and associated data removal is verified |
| F22 | Android | Install and upgrade a debug build | App launches and workspace remains usable |
| F23 | Web | Test mobile and desktop viewport sizes | No critical overflow or blocked controls |
| F24 | Offline | Open app without network | Local behavior and unavailable cloud features are clear |

### 14.1 Suggested measurements

For a formal evaluation, record:
- Calculation correctness across a set of known attendance inputs.
- Import precision and recall against manually labelled portal samples.
- Sync propagation time under a controlled network.
- Conflict resolution correctness under concurrent edits.
- Export success rate and data round-trip fidelity.
- Reminder delivery success across supported Android versions/devices.
- App launch time and key interaction response time.
- Crash/ANR rate in a release-signed build.

Numerical results should only be added after repeatable tests have been run. Avoid claiming a particular accuracy or performance percentage from source inspection alone.

## 15. Results and Capabilities Verified from Repository Review

The reviewed README and source files establish that:
- The application is designed for Android and web/PWA usage.
- Attendance is organized by subject and target percentage.
- The documented formula uses Present divided by Present plus Absent.
- The product surfaces skip/attend guidance.
- The app supports editing/backfilling class records according to the README.
- The README documents statistics, heatmap, weekly recap, and day log.
- The project documents JSON, CSV, PDF, and Excel backup/export.
- Firebase Authentication methods for email/password, Google, and phone are present in the client source.
- Firestore workspace access is scoped by authenticated user UID in the rules file.
- The client uses Firestore realtime listeners for workspace updates.
- Gemini API generation is routed through server code that validates Firebase ID tokens.
- The Android widget source displays overall attendance and up to four subjects.
- The repository includes an Android debug APK workflow.

These are implementation/documentation observations, not third-party certification or measured product test results.

## 16. Limitations, Risks, and Open Work

1. **No direct institutional integration:** Attendance data is entered or imported by the student; the reviewed project does not automatically read a college ERP account.
2. **User-entered data quality:** Incorrect marks or imported values can result in incorrect guidance.
3. **Parser variability:** Portal formats may change or differ across institutions; imports need a review step and manual fallback.
4. **AI uncertainty:** Gemini extraction can be wrong. Extracted attendance/timetable values should be checked before applying.
5. **Cloud dependence:** Authentication and cross-device sync require Firebase connectivity. The app reports local data availability when sync is unavailable.
6. **Conflict behavior:** Workspace merging requires concurrency testing, especially for simultaneous edits to the same subject/date.
7. **Single large UI file:** The README identifies `www/index.html` as a large single-page file and a likely refactoring target.
8. **Debug-only Android delivery:** The repository's release checklist identifies a debug APK workflow and absence of a verifiable Play-ready AAB/release-signing configuration.
9. **Play Store readiness:** Target SDK, signed AAB, Play App Signing, store listing assets, production Data safety declaration, account deletion verification, testing-track requirements, and policy declarations need Play Console verification.
10. **Reminder delivery:** Battery optimization, permissions, force-stop, and reboot behavior can affect notifications.
11. **Widget constraints:** Android launcher controls refresh cadence; widget display is limited to an overall percentage and four subjects.
12. **No analytics:** The README says analytics are not included. This is a privacy-conscious design choice but limits product usage measurement.
13. **No documented formal experiment:** A controlled evaluation with participants, test cases, and measured outcomes is needed before claiming impact on student attendance behavior.
14. **Privacy/compliance verification:** The presence of a privacy-policy page and account deletion code does not alone prove legal compliance or that the deployed deletion path removes all associated data.

## 17. Future Enhancements

### 17.1 Academic workflow
- Add optional semester, course, and faculty organization.
- Add institution-specific attendance rule profiles.
- Add configurable lab/theory session weights where relevant.
- Add a printable semester attendance report with an explicit calculation breakdown.
- Improve import presets for commonly used student portals without storing credentials.

### 17.2 Data and synchronization
- Add versioned migrations for workspace schema changes.
- Add more explicit conflict resolution for simultaneous edits.
- Add automated round-trip tests for JSON/CSV/Excel import/export.
- Add an optional encrypted local backup workflow.
- Provide a clear sync history/status view.

### 17.3 AI and import
- Add a user-visible field-by-field review screen for AI extraction.
- Show confidence/uncertainty and highlight unrecognized rows.
- Keep local parsing as the default for deterministic formats.
- Add regression fixtures for portal formats and OCR/image extraction scenarios.

### 17.4 Android and release quality
- Generate a signed release AAB using a protected upload key.
- Configure Play App Signing.
- Verify SDK levels, manifest permissions, adaptive icons, and version metadata.
- Add release smoke tests and a representative Android device matrix.
- Test notifications and widgets on devices with different battery-management policies.

### 17.5 Accessibility and quality
- Add automated UI and calculation tests.
- Add keyboard navigation, screen-reader, large-font, and contrast checks.
- Add browser performance and accessibility CI.
- Consider crash reporting only after a privacy review and clear disclosure.

## 18. Conclusion

Classmark turns attendance tracking from a passive percentage display into a decision-support tool. By combining per-subject records, configurable targets, skip/attend calculations, historical statistics, import/export tools, reminders, cloud synchronization, and a native Android widget, it addresses several practical student workflows in one application.

The repository demonstrates a substantial progression from a local attendance tracker toward a cross-device product with authentication, cloud persistence, and optional AI-assisted import. The most important next steps are formal testing of attendance calculations and import behavior, multi-device conflict validation, and completion of a properly signed Android release and Play Store compliance checks.

Classmark is best described as a student-oriented attendance management application with cloud synchronization and optional assisted data entry. It is not an automated institutional attendance system and should not be represented as one.

## 19. References and Repository Materials

### Project sources
- [Classmark GitHub repository](https://github.com/chetanvhsk-wq/classmark-attendance)
- [README and feature overview](https://github.com/chetanvhsk-wq/classmark-attendance/blob/main/README.md)
- [Main application UI](https://github.com/chetanvhsk-wq/classmark-attendance/blob/main/www/index.html)
- [Firebase authentication and synchronization](https://github.com/chetanvhsk-wq/classmark-attendance/blob/main/www/firebase-sync.js)
- [Firestore security rules](https://github.com/chetanvhsk-wq/classmark-attendance/blob/main/firestore.rules)
- [Gemini API handler](https://github.com/chetanvhsk-wq/classmark-attendance/blob/main/api/gemini/generate.js)
- [Android widget provider](https://github.com/chetanvhsk-wq/classmark-attendance/blob/main/overlay/java/AttendanceWidgetProvider.java)
- [Problems overcome log](https://github.com/chetanvhsk-wq/classmark-attendance/blob/main/problems.md)
- [Project update history](https://github.com/chetanvhsk-wq/classmark-attendance/blob/main/updates.md)
- [Android Go-Live checklist](https://github.com/chetanvhsk-wq/classmark-attendance/blob/main/go-live-checklist.md)

### Technical references
- [Firebase Authentication documentation](https://firebase.google.com/docs/auth)
- [Cloud Firestore documentation](https://firebase.google.com/docs/firestore)
- [Firestore security rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Capacitor documentation](https://capacitorjs.com/docs)
- [Android App Widgets](https://developer.android.com/develop/ui/views/appwidgets)
- [Google Play app signing](https://developer.android.com/studio/publish/app-signing)

> Add the exact access dates and any institution-required citation format before submitting this as a formal academic report.

---

## Appendix A — Repository File Map

| Path | Role |
|---|---|
| `www/index.html` | Main UI and client-side application |
| `www/firebase-sync.js` | Firebase Authentication and Firestore sync |
| `www/manifest.json` | PWA manifest |
| `www/privacy.html` | Privacy-policy page |
| `firestore.rules` | Per-user Firestore access rules |
| `api/gemini/generate.js` | Vercel Gemini generation endpoint |
| `api/gemini/status.js` | Gemini configuration status endpoint |
| `lib/firebase-token.js` | Firebase ID token verification |
| `lib/gemini-proxy.js` | Server-side Gemini proxy implementation |
| `overlay/java/AttendanceWidgetProvider.java` | Android home-screen widget |
| `scripts/patch_android.py` | Android project resource/permission patching |
| `.github/workflows/build-apk.yml` | Android debug APK CI workflow |
| `go-live-checklist.md` | Store launch readiness tracking |
| `problems.md` | Engineering issue and resolution log |
| `updates.md` | Product change history |

## Appendix B — Suggested Evidence for an Academic Submission

Attach original evidence from the running application:
1. Home dashboard showing subject attendance and overall summary.
2. Subject screen showing target percentage and skip/attend guidance.
3. Mark Present/Absent interaction and dated attendance history.
4. Statistics page with trend and heatmap.
5. Attendance portal import review screen.
6. Timetable and reminder settings.
7. Exported PDF or Excel report.
8. Two-device synchronization demonstration using the same test account.
9. Android widget screenshot.
10. Authentication and account deletion test evidence.
11. Build workflow result and installed Android build information.
12. A table of calculation/import/sync test cases with expected and observed values.

*End of report.*
