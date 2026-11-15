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
- Added JSON and CSV export, plus data-file import.

## Interface and visual design

- Added Skeuomorphic, Glass, Matte, and Normal interface styles, with light and dark appearance options.
- Updated theme styling so the chosen interface style applies across cards, settings, inputs, dialogs, and other surfaces.
- Refined Glass mode with translucent blurred surfaces and a transparent page/navigation background.
- Added the persistent liquid-glass navigation pill with an animated active tab.
- Improved selected-theme feedback and the account-loading screen.
- Removed the Giphy section and decorative glyph treatment.

## Web and Android app

- Maintained the web app and Capacitor Android app from the same project.
- Connected the GitHub repository to Vercel for web deployments.
