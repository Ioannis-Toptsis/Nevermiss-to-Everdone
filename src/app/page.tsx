import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { SeoSections } from "@/components/seo-sections";
import { siteConfig, siteUrl } from "@/lib/seo";

const homeTitle = "NTE Dailys, Weeklys, Checklist and Todo Tracker for Neverness to Everness";
const homeDescription =
  "Nevermiss to Everdone is the NTE Dailys, Weeklys, Checklist and todo tracker for Neverness to Everness. Track NTE dailys, NTE weeklys, grouped server reset times, and synced progress in one place.";

const featureList = [
  "Track NTE dailys and weeklys in one dashboard",
  "Choose a grouped server reset preset for daily and Monday weekly resets",
  "Start instantly in guest mode",
  "Open maps, guides, codes, and community links faster"
] as const;

const faqItems = [
  {
    question: "What is Nevermiss to Everdone?",
    answer:
      "Nevermiss to Everdone is an unofficial Neverness to Everness companion that combines an NTE dailys checklist, daily and weekly reset timers, useful links, and optional synced progress."
  },
  {
    question: "Is this the NTE checklist, NTE dailys, NTE weeklys, and NTE todo site?",
    answer:
      "Yes. This homepage is optimized as an NTE checklist and Neverness to Everness todo tracker, with dedicated areas for NTE dailys, NTE weeklys, reset timing, and quick access links."
  },
  {
    question: "How are the reset timers calculated?",
    answer:
      "The app uses selectable reset presets grouped by America, Europe, and Asia. Daily resets follow the selected preset, and weekly resets happen every Monday at the same reset time."
  },
  {
    question: "Do I need an account to use the tracker?",
    answer:
      "No. Guest mode works immediately on the current device. An account is only needed if you want to keep checklist progress synced across devices."
  },
  {
    question: "Is this an official Neverness to Everness website?",
    answer:
      "No. Nevermiss to Everdone is an unofficial hobby companion for Neverness to Everness."
  }
] as const;

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteUrl.toString(),
    description: homeDescription,
    keywords: siteConfig.keywords.join(", "),
    inLanguage: ["en", "de"]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    url: siteUrl.toString(),
    description: homeDescription,
    keywords: siteConfig.keywords.join(", "),
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    featureList: [...featureList],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    author: {
      "@type": "Person",
      name: siteConfig.creator,
      url: "https://janni.fun"
    },
    publisher: {
      "@type": "Person",
      name: siteConfig.creator,
      url: "https://janni.fun"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  }
];

export const metadata: Metadata = {
  title: homeTitle,
  description: homeDescription,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: `${homeTitle} | ${siteConfig.name}`,
    description: homeDescription,
    url: "/"
  },
  twitter: {
    title: `${homeTitle} | ${siteConfig.name}`,
    description: homeDescription
  }
};

export default function HomePage() {
  return (
    <>
      <Dashboard />
      <SeoSections />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
