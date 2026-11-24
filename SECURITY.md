# Security Policy

**Last reviewed: 25 November 2026**

Classmark handles account credentials through Firebase Authentication and stores
attendance workspaces in Cloud Firestore. This document explains the project's
security support and how to report a concern. It is not a guarantee that the
service is free from vulnerabilities.

## Supported versions

| Version | Security updates |
| --- | --- |
| Latest release | Best effort |
| Current `main` branch | Best effort |
| Older releases and third-party forks | Not supported |

The latest published release may lag behind the current source. Check the
[releases page](https://github.com/chetanvhsk-wq/classmark-attendance/releases)
and the [updates and problems log](problems%20and%20updates/updates.md) before
relying on a particular version.

## Reporting a vulnerability

Please do not publish exploit steps, personal data, credentials, or security
details in a public issue or pull request.

As of this review, GitHub private vulnerability reporting is not enabled for
this repository. If you find a vulnerability, open a minimal issue titled
**“Private security report request”** without technical details. The maintainer
will use it to arrange a private reporting channel. Do not include information
that would let someone reproduce or exploit the issue in that public request.

Include the affected version or commit, the component involved, the potential
impact, and concise reproduction details only after a private channel has been
established. Allow reasonable time for investigation and a fix before public
disclosure. There is no bug bounty or guaranteed response-time commitment.

## Scope

Reports are welcome for security defects in the Classmark web app, Android app,
server-side Gemini proxy, Firebase Authentication integration, and Firestore
security rules maintained in this repository.

Issues solely in Firebase, Google, Vercel, GitHub, Android, or other third-party
services should be reported to the relevant provider. Do not test against
accounts, data, or systems you do not own or have permission to assess. Avoid
actions that alter or delete data, disrupt the service, or expose another
person's information.

## Security design and user guidance

- Firestore rules are intended to limit each signed-in user to their own
  `users/{uid}/sync/workspace` document. The rules, not the client UI, are the
  access-control boundary. Review and test rule changes before deployment.
- The Gemini proxy requires a Firebase ID token. The Gemini API key belongs in
  a server-side environment variable (`GEMINI_API_KEY`), never in browser code,
  a committed file, or a client-visible environment variable.
- Firebase web configuration includes a public API key; it is not an
  authentication secret. Restrict its use and enabled APIs in Google Cloud.
  Keep Android service configuration and signing material out of public source
  and protect CI secrets.
- Timetable photos and wallpaper images are stored on the device by the app.
  Optional Gemini processing sends the content you choose to submit to Google's
  Gemini service; see the [Privacy Policy](www/privacy.html).
- Users should use a unique password, protect their device and sign-in methods,
  and avoid putting sensitive personal information in public issues or exports.
  Sign out on shared devices and keep exported backups in a safe place.

These are design intentions and configuration guidance, not an independent
security certification. Hosting, authentication, and AI providers may process
technical or service data under their own terms.

## Maintainer response

The maintainer will assess a report, confirm the affected component and impact,
and prioritize remediation based on severity and exploitability. If a
vulnerability affects users, the maintainer will consider mitigations,
coordinated disclosure, and any applicable legal notification obligations.
There is no formal service-level agreement.

## UK data-protection incidents

If a security incident involves personal data, the controller should assess it
promptly and follow applicable UK data-protection law. Where required, a
reportable personal data breach must be reported to the Information
Commissioner's Office within 72 hours of becoming aware of it; affected people
must also be informed without undue delay where the legal high-risk threshold
is met. This policy does not replace an incident-response plan or legal advice.

Before using Classmark with UK students, the service operator should also verify
the controller's contact details, processor terms, data locations and transfer
safeguards, retention settings, and whether a data-protection impact assessment
or the UK Age Appropriate Design Code applies. These details depend on the
deployment and are not confirmed by this repository.

## Release and maintenance notes

The project log records a historical npm audit with unresolved advisories.
That result can change as dependencies change; run a fresh dependency audit
before a release and review the current
[problems and updates log](problems%20and%20updates/problems.md). The project
does not claim a formal penetration test or security certification.
