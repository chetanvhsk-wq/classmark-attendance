# Classmark modularization contract

This document defines the safe refactoring boundary for Classmark. It does not change runtime behavior, storage keys, Firebase data, or the public UI.

## Current runtime contract

- `www/index.html` remains the current composition root until each section is extracted and verified.
- `www/firebase-sync.js` remains the synchronization boundary.
- The attendance model and local-storage keys are compatibility-sensitive.
- Capacitor bridge names and `window.classmarkApp` are public integration points.

## Target modules

```text
www/js/
  core/
    constants.js       # storage keys, defaults, palettes
    storage.js         # local persistence and rollback
    model.js           # normalization and compatibility
    attendance.js      # totals, percentages, guidance
  ui/
    render.js          # renderAll and shared DOM helpers
    navigation.js      # tabs, gestures, back-stack
    overlays.js        # sheets, dialogs, date picker, color picker
  features/
    subjects.js        # add/edit/delete/history/marking
    statistics.js      # graph, heatmap, week recap, day log
    settings.js        # themes, wallpaper, timetable, reminders
    import-export.js   # JSON, CSV, PDF, Excel, Gemini import
    glyph.js           # glyph editor and animation
  integrations/
    capacitor.js       # haptics, notifications, widget bridge
    firebase.js        # existing Firebase sync boundary
```

Each file must be loaded in dependency order or converted to an ES module with explicit imports. During extraction, keep the existing function names and `window` bridge intact; this allows one module to be migrated at a time.

## Low-end device rules

1. Keep Firebase, jsPDF, SheetJS, and Gemini code out of the initial page path. Load each only when its feature is opened.
2. Render only the active screen and update changed cards instead of calling a full render for every mark.
3. Cache frequently used DOM nodes and avoid repeated whole-document queries inside pointer and scroll handlers.
4. Use `requestAnimationFrame` for pointer-driven effects and skip decorative effects when `prefers-reduced-motion` is enabled.
5. Keep attendance calculations pure and synchronous; persist and sync after the UI update.
6. Preserve the existing local-storage schema and migration behavior.

## Extraction order

1. Constants, storage, and model normalization.
2. Pure attendance calculations.
3. Subject actions and history.
4. Statistics and visualizations.
5. Settings, reminders, and timetable.
6. Import/export and optional dependencies.
7. Navigation, overlays, and final composition root.

After every step, verify: sign-in, offline launch, mark present/absent, edit history, import/export, reminders, widget sync, and Firebase replacement through `window.classmarkApp`.
