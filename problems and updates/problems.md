# Problems overcome and stability record

**Release candidate:** Classmark v1.0.7
**Repository status:** Private; prepared as the most stable candidate to date. Candidate Android build passed on the review branch; main merge and release approval are still pending.

This log consolidates the problems documented in tracked commits and the previous project notes. It records confirmed fixes, not every unrecorded local incident. The release candidate adds notification error reporting, serialized rescheduling, reminder-owned cancellation, and tap-to-Home routing.

## v1.0.7 stability-candidate fixes

- Fixed browser notification permission requests and delivery failures being silently ignored; failures are now reported and the in-app reminder remains available as a fallback.
- Fixed Android local-notification reschedules running concurrently, which could cancel or replace a newer schedule; scheduling now runs serially.
- Limited reminder cancellation to Classmark reminder IDs instead of cancelling every pending local notification.
- Added a validated reminder payload and action handler so tapping a Classmark reminder opens the Home attendance view.
- Added visible handling for missing Android notification support, denied permission, schedule errors, and tap-handler registration errors.
- Confirmed the source logo and web icon assets have been tracked unchanged since the initial app import; the existing Class Mark artwork remains the source for Android, PWA, favicon, and in-app use.
- Generated Android metadata from the release package version (`versionName` 1.0.7 and `versionCode` 10007), and named the downloadable APK `classmark.apk`.
- Passed the Android build workflow on the review branch; no GitHub Release or release tag has been created.

This project evolved from a local attendance prototype into a synced web and Android app. The main problems solved were:

## Glyph editor follow-up fixes — 24 November 2026

- Fixed text Block rendering by sampling text color instead of canvas alpha, so the background no longer lights every dot.
- Added named animation frame behavior for creature, bot, graph, and motion glyph presets.

- Fixed the glyph editor allowing the Home glyph to disappear because `glyphEnabled` and the legacy Home-card flag could become inconsistent; On/Off remains user-controlled and both flags now stay synchronized.
- Added the missing reference-style glyph presets: bots, ghost, equalizer, orbit, cat, rocket, fish, UFO, alien, bat, heartbeat, bounce, rain, spinner, ripple, DNA, and clock.
- Reworked the Heart preset into a centered, visible 20×10 pattern.
- Replaced the short hand-written text bitmap behavior with canvas rasterization so typed letters, numbers, punctuation, symbols, and other keyboard characters render into the dot grid.
- Prevented glyph preset overflow by making the preset list scroll inside the editor and sizing the editor panel for smaller screens.
- Changed custom drawing from click-only toggling to smooth paint-board drawing with pointer interpolation, so fast mouse, touch, and stylus swipes do not skip dots.
- Removed the distracting bright/dull pulse animation; Home glyphs now use a stable appearance with a subtle hover/press interaction.

## Home dashboard customization — 24 November 2026

- Added a configurable Home dashboard with up to ten selectable graph and insight widgets instead of limiting the Home view to four cards.
- Added responsive grid rules for mini phones, standard phones, long phones, tablets, and laptop-width screens so widgets wrap without overlap or horizontal overflow.
- Kept widget choices local to the user settings and limited the active selection to ten to protect small-screen readability and performance.

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

## Work completed on 19 November 2026

- Restored the full animated Glyph editor with presets, colors, text/initials mode, and a custom dot canvas; its Home card can be enabled or disabled and the remaining Home cards reflow into the available space.
- Made all four Home cards editable and restored persistent Add class access, plus the inline Add subject row below the subject list.
- Added a visible portal-paste entry point, local Attended/Total table parsing, Gemini consent before fallback processing, and a retry/manual fallback for temporary Gemini errors.
- Added Edit subject validation so blank names and attended counts above total are shown inline and cannot be saved.
- Fixed the Glass mode document width so animated surfaces no longer create a visible right-side scroll gap.
- Added the privacy-policy page and visible links in the login and Settings surfaces, plus account deletion for the Firebase Auth account and synced Firestore workspace.

The earlier floating-plus removal was a temporary intermediate state; the current UI restores the persistent Add class control and documents it above.

## Work completed on 18 November 2026

- Fixed class reminder scheduling so changing reminder settings, reminder time, or timetable data reschedules notifications immediately.
- Fixed browser reminder fallback so an unavailable notification permission does not incorrectly mark a reminder as already delivered.
- Improved the Glass interface with moving ambient highlights, frosted surfaces, and clearer contrast across the UI.
- Kept Matte and Normal styles readable instead of allowing theme styles to collapse into an all-black screen.
- Verified the JavaScript syntax and installed dependencies with `npm ci --ignore-scripts`.
- Updated the root package version and corrected the published package version used by GitHub Packages.
- Removed the incorrect `v1.0.5` release and rebuilt the single `v1.0.4` release from the corrected commit.
- Confirmed the GitHub Packages workflow completed successfully.
- Built the Android APK successfully through GitHub Actions and attached `app-debug.apk` to the `v1.0.4` GitHub release at that time; GitHub no longer lists v1.0.4 as a published release.
- Documented the release fixes, including reminders, theme fixes, package publishing, and APK delivery.

## Release verification

- The latest published GitHub Release is [Classmark v1.0.3](https://github.com/chetanvhsk-wq/classmark-attendance/releases/tag/v1.0.3).
- The repository also contains a v1.0.6 tag, but GitHub does not list a published release for that tag. v1.0.7 is the next unique candidate tag; it remains unpublished pending explicit approval.
- Candidate CI: [Android build run 44663156874](https://github.com/chetanvhsk-wq/classmark-attendance/actions/runs/44663156874) passed and uploaded the `attendance-apk` artifact containing `classmark.apk`.
- Main is protected by a required code-owner approval; the candidate PR cannot be merged until that review is recorded.
- Release assets and workflow runs must be rechecked at publication time; historical links in older notes are not evidence of current availability.

## Current known limitation

Native Google sign-in is intentionally hidden in the APK until a production signing certificate is used. Email/password and phone sign-in work in the APK. Google sign-in remains available on the web app.

The Android Firebase configuration is supplied through the encrypted `GOOGLE_SERVICES_JSON` GitHub Actions secret. A previously exposed API key was removed from tracked source/configuration; any key that was publicly exposed should also be revoked and replaced in Google Cloud/Firebase.

## Validation limitations

- The repository has no configured lint or test suite; local JavaScript and Python syntax checks, workflow YAML, documentation links, package versions, and native icon/version generation were verified directly.
- The installed production dependency graph reports seven npm audit advisories (one critical, five high, one moderate). Automated remediation would force major dependency changes, and the audit reports no fix for SheetJS `xlsx`; this was not changed in the release candidate.
