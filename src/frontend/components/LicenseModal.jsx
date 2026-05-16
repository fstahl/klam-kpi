// License text is intentionally hardcoded here rather than read from the
// LICENSE file at runtime, so that editing the file on disk has no effect
// on what is shown to the user.
const LICENSE_TEXT = `Copyright (c) 2026 Fredrik Ståhl

PROPRIETARY SOFTWARE — RESTRICTED USE

Permission is granted to companies within the Addtech AB group to use,
install, and run this software for internal business purposes only.

The following are NOT permitted without prior written consent from the
copyright holder:

  - Redistribution of the source code or compiled binaries outside the
    Addtech AB group
  - Sublicensing, selling, or offering the software as a service to
    third parties
  - Publishing the source code in any public repository or forum

DISCLAIMER

This software is provided "as is", without warranty of any kind, express
or implied. The author makes no representations or guarantees regarding
the accuracy, completeness, or timeliness of any data, calculations, or
KPI figures produced or displayed by this software.

In no event shall the author be liable for any claim, damages, or other
liability — whether in contract, tort, or otherwise — arising from or in
connection with the software or the use of information it displays,
including but not limited to any business decisions made on the basis of
figures shown in the dashboard.

Use of this software constitutes acceptance of these terms.`;

export function LicenseModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--license" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="License">

        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 className="license__title">License</h2>
        <pre className="license__text">{LICENSE_TEXT}</pre>

      </div>
    </div>
  );
}
