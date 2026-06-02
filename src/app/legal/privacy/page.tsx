import type { Metadata } from "next";

import { LegalPageFrame, LegalSection } from "@/components/legal-page-frame";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for accounts, guest mode, and browser-stored preferences in Nevermiss to Everdone.",
  alternates: {
    canonical: "/legal/privacy"
  }
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageFrame
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="This policy describes how the Nevermiss to Everdone companion app processes personal data and browser-stored preferences."
      lastUpdated="May 2026"
    >
      <LegalSection title="Data Controller">
        <p>Ioannis Toptsis</p>
        <p>
          Email: <a className="text-white underline decoration-white/30 underline-offset-4" href="mailto:contact@janni.email">contact@janni.email</a>
        </p>
        <p>Hesse, Germany</p>
      </LegalSection>

      <LegalSection title="Data We Process">
        <p>
          This app may process technical request data required to deliver the site, account data submitted during sign-up, and checklist state used to provide the tracker.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-white/72">
          <li>Name, email address, and a hashed password when you register with credentials.</li>
          <li>Name, email address, and optional profile image when you sign in with Google.</li>
          <li>Checklist completion data, selected language, and selected time zone.</li>
          <li>Session token data required to keep you signed in.</li>
          <li>Guest-mode preferences and checklist state stored locally in your browser.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How Data Is Used">
        <p>Data is processed to provide the app, keep accounts secure, sync checklist progress, remember preferences, and operate the sign-in flow.</p>
        <p>
          The legal basis is generally Art. 6(1)(b) GDPR for providing requested functionality and Art. 6(1)(f) GDPR for technical operation, security, and abuse prevention.
          If you choose Google sign-in, the transfer of your profile data is initiated by your login action.
        </p>
      </LegalSection>

      <LegalSection title="Storage and Retention">
        <ul className="list-disc space-y-2 pl-5 text-white/72">
          <li>Authenticated account and checklist data are stored server-side in SQLite for as long as the account remains active or until deletion is requested.</li>
          <li>Session tokens expire after up to 30 days unless you sign out earlier.</li>
          <li>Temporary Google OAuth verification cookies are cleared after the sign-in flow completes or fails.</li>
          <li>Guest-mode checklist data, language selection, and time-zone selection remain in localStorage until you clear your browser data.</li>
          <li>Technical server logs may be retained by the deployment environment for operational and security purposes, subject to that environment's retention settings.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Cookies and Local Storage">
        <p>This app only uses data stores that are technically necessary for its operation.</p>
        <ul className="list-disc space-y-2 pl-5 text-white/72">
          <li>The `nte-session` cookie keeps authenticated users signed in.</li>
          <li>Temporary Google OAuth cookies are used to validate the login callback securely.</li>
          <li>Guest checklist state, language preference, and time-zone preference can be stored in localStorage.</li>
        </ul>
        <p>No advertising, profiling, or analytics cookies are used by this app itself.</p>
      </LegalSection>

      <LegalSection title="Sharing with Third Parties">
        <p>
          Personal data is not sold. Data may be shared only where technically required to provide the service, such as with the deployment provider or Google when you explicitly use Google sign-in.
        </p>
        <p>
          When you follow dashboard links to external websites, those services operate under their own privacy policies.
        </p>
      </LegalSection>

      <LegalSection title="Your Rights">
        <p>Under the GDPR, you may have rights of access, rectification, erasure, restriction, objection, and data portability.</p>
        <p>
          To exercise these rights or request deletion of your account data, contact <a className="text-white underline decoration-white/30 underline-offset-4" href="mailto:contact@janni.email">contact@janni.email</a>.
        </p>
      </LegalSection>

      <LegalSection title="Complaints">
        <p>
          You have the right to lodge a complaint with a supervisory authority if you believe that the processing of your personal data violates applicable data protection law.
        </p>
      </LegalSection>
    </LegalPageFrame>
  );
}