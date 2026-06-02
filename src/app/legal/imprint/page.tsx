import type { Metadata } from "next";

import { LegalPageFrame, LegalSection } from "@/components/legal-page-frame";

export const metadata: Metadata = {
  title: "Legal Notice",
  description: "Legal notice and operator information for the Nevermiss to Everdone companion app.",
  alternates: {
    canonical: "/legal/imprint"
  }
};

export default function LegalNoticePage() {
  return (
    <LegalPageFrame
      eyebrow="Legal"
      title="Legal Notice"
      subtitle="English legal notice for the Nevermiss to Everdone companion app, using the operator details published on janni.fun."
      lastUpdated="April 2026"
    >
      <LegalSection title="Responsible Person">
        <p>Ioannis Toptsis</p>
        <p>Address on request</p>
        <p>Hesse, Germany</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Email: <a className="text-white underline decoration-white/30 underline-offset-4" href="mailto:contact@janni.email">contact@janni.email</a>
        </p>
        <p>Phone: on request</p>
        <p>
          Discord: <a className="text-white underline decoration-white/30 underline-offset-4" href="https://janni.fun/discord" target="_blank" rel="noreferrer">janni.fun/discord</a>
        </p>
      </LegalSection>

      <LegalSection title="Notice">
        <p>
          Nevermiss to Everdone is an unofficial hobby companion for Neverness to Everness and is operated as a private project by Ioannis Toptsis.
          It is intended as a lightweight checklist and progress helper. No traditional goods or subscription products are sold through this app.
        </p>
        <p>
          Voluntary support for the wider project ecosystem may be accepted through external services connected to janni.fun. Any such support is handled separately from this companion app.
        </p>
      </LegalSection>

      <LegalSection title="Liability for Content">
        <p>
          As the service provider, I am responsible for my own content on these pages in accordance with applicable law. However, I am not obligated to monitor transmitted or stored third-party information or investigate circumstances that indicate unlawful activity unless required by law.
        </p>
        <p>
          If specific legal violations become known, the affected content will be removed without undue delay.
        </p>
      </LegalSection>

      <LegalSection title="Hosting Reference">
        <p>
          The published legal notice for the main website janni.fun lists the following hosting provider for that website: Strato AG, Pascalstraße 10, 10587 Berlin, Germany.
        </p>
        <p>
          If this companion app is deployed in a separate environment, the technical hosting setup for that deployment may differ.
        </p>
      </LegalSection>

      <LegalSection title="Dispute Resolution">
        <p>
          The European Commission provides a platform for online dispute resolution: <a className="text-white underline decoration-white/30 underline-offset-4" href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">https://ec.europa.eu/consumers/odr/</a>
        </p>
        <p>
          I am neither willing nor obligated to participate in dispute resolution proceedings before a consumer arbitration board.
        </p>
      </LegalSection>

      <LegalSection title="Liability for Links">
        <p>
          This app contains links to external third-party websites. I have no influence over the content of those websites and therefore cannot accept liability for them.
          The respective provider or operator is always responsible for the content of linked pages.
        </p>
        <p>
          Linked pages were reviewed for possible legal violations at the time of linking. If infringements become known later, the relevant links will be removed promptly.
        </p>
      </LegalSection>
    </LegalPageFrame>
  );
}