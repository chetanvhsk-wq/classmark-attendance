# Classmark Attendance

This package contains the distributable Classmark Attendance web app.

The web app requires a signed-in Firebase account. The shipped UI links to the [Classmark Privacy Policy](../www/privacy.html), and signed-in users can delete their Firebase account and synced workspace from **Settings → Account & sync → Delete account and data**.

Before publishing a web or Android release, deploy the policy at a public HTTPS URL and complete the matching Play Console privacy, Data safety, app-access, content-rating, and target-audience declarations. The release-readiness details are tracked in the repository's [go-live checklist](../go-live-checklist.md).

## Install from GitHub Packages

Configure npm for the GitHub Packages registry:

```ini
@chetanvhsk-wq:registry=https://npm.pkg.github.com
```

Then install:

```bash
npm install @chetanvhsk-wq/classmark-attendance
```
