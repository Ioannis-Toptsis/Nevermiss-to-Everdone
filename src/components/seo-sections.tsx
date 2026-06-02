"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DEFAULT_LOCALE } from "@/lib/data";
import { LOCALE_CHANGE_EVENT, LOCALE_STORAGE_KEY, getPreferredLocale, pickLocalizedText } from "@/lib/i18n";
import type { Locale, LocalizedText } from "@/lib/types";

type HighlightCard = {
  eyebrow: LocalizedText;
  title: LocalizedText;
};

type TextCard = {
  title: LocalizedText;
  description: LocalizedText;
};

type FaqItem = {
  question: LocalizedText;
  answer: LocalizedText;
};

const overviewCards: HighlightCard[] = [
  {
    eyebrow: {
      en: "Live focus",
      de: "Live-Fokus"
    },
    title: {
      en: "Daily and weekly progress in one place",
      de: "Tages- und Wochenfortschritt an einem Ort"
    }
  },
  {
    eyebrow: {
      en: "Reset logic",
      de: "Reset-Logik"
    },
    title: {
      en: "Grouped server reset presets for America, Europe, and Asia",
      de: "Gruppierte Server-Reset-Vorgaben für Amerika, Europa und Asien"
    }
  },
  {
    eyebrow: {
      en: "Access",
      de: "Zugriff"
    },
    title: {
      en: "Instant guest mode or synced account progress",
      de: "Sofortiger Gastmodus oder synchronisierter Account-Fortschritt"
    }
  }
];

const intentCards: TextCard[] = [
  {
    title: {
      en: "NTE checklist",
      de: "NTE-Checkliste"
    },
    description: {
      en: "Use the main dashboard as your NTE checklist for daily objectives, weekly tasks, and routine progress tracking.",
      de: "Nutze das Haupt-Dashboard als NTE-Checkliste für tägliche Ziele, Wochenaufgaben und deinen Routine-Fortschritt."
    }
  },
  {
    title: {
      en: "NTE dailys",
      de: "NTE Dailys"
    },
    description: {
      en: "The daily section is built for NTE dailys, with one-click progress tracking and local reset visibility.",
      de: "Der Daily-Bereich ist für NTE Dailys gebaut, mit Fortschritt per Klick und sichtbaren lokalen Reset-Zeiten."
    }
  },
  {
    title: {
      en: "NTE weeklys",
      de: "NTE Weeklys"
    },
    description: {
      en: "The weekly section keeps NTE weeklys visible so longer-cycle tasks are not lost between resets.",
      de: "Der Weekly-Bereich hält NTE Weeklys sichtbar, damit längere Aufgabenzyklen nicht zwischen Resets verloren gehen."
    }
  },
  {
    title: {
      en: "NTE todo",
      de: "NTE Todo"
    },
    description: {
      en: "If you want an NTE todo page, Nevermiss to Everdone works as a lightweight Neverness to Everness todo tracker.",
      de: "Wenn du eine NTE-Todo-Seite suchst, funktioniert Nevermiss to Everdone als leichter Neverness-to-Everness-Todo-Tracker."
    }
  }
];

const featureBlocks: TextCard[] = [
  {
    title: {
      en: "Track NTE dailys and weeklys in one dashboard",
      de: "NTE Dailys und Weeklys in einem Dashboard tracken"
    },
    description: {
      en: "Keep the current Neverness to Everness routine visible with separate daily and weekly checklist sections, progress meters, and curated reference links.",
      de: "Behalte deine aktuelle Neverness-to-Everness-Routine mit getrennten Daily- und Weekly-Checklisten, Fortschrittsanzeigen und kuratierten Referenzlinks im Blick."
    }
  },
  {
    title: {
      en: "Pick the matching server reset preset",
      de: "Die passende Server-Reset-Vorgabe auswählen"
    },
    description: {
      en: "Choose from grouped America, Europe, and Asia reset presets. The tracker uses that selection for daily resets and the weekly Monday reset without extra manual time math.",
      de: "Wähle aus gruppierten Amerika-, Europa- und Asien-Reset-Vorgaben. Der Tracker nutzt diese Auswahl für Daily-Resets und den Weekly-Reset am Montag ohne zusätzliches manuelles Umrechnen."
    }
  },
  {
    title: {
      en: "Start instantly in guest mode",
      de: "Sofort im Gastmodus starten"
    },
    description: {
      en: "Open the page and use the checklist immediately. If you want synced progress across devices, create an account later without changing the workflow.",
      de: "Öffne die Seite und nutze die Checkliste sofort. Wenn du deinen Fortschritt geräteübergreifend synchronisieren willst, kannst du später einen Account anlegen, ohne deinen Ablauf zu ändern."
    }
  },
  {
    title: {
      en: "Open maps, guides, codes, and community links faster",
      de: "Karten, Guides, Codes und Community-Links schneller öffnen"
    },
    description: {
      en: "The hub combines the checklist with useful Neverness to Everness resources so you can move from routine tracking to build guides and external tools in one jump.",
      de: "Der Hub kombiniert die Checkliste mit nützlichen Neverness-to-Everness-Ressourcen, damit du direkt von deiner Routine zu Build-Guides und externen Tools springen kannst."
    }
  }
];

const faqItems: FaqItem[] = [
  {
    question: {
      en: "What is Nevermiss to Everdone?",
      de: "Was ist Nevermiss to Everdone?"
    },
    answer: {
      en: "Nevermiss to Everdone is an unofficial Neverness to Everness companion that combines an NTE dailys checklist, daily and weekly reset timers, useful links, and optional synced progress.",
      de: "Nevermiss to Everdone ist ein inoffizieller Neverness-to-Everness-Begleiter, der eine NTE-Dailys-Checkliste, tägliche und wöchentliche Reset-Timer, nützliche Links und optional synchronisierten Fortschritt kombiniert."
    }
  },
  {
    question: {
      en: "Is this the NTE checklist, NTE dailys, NTE weeklys, and NTE todo site?",
      de: "Ist das die Seite für NTE-Checkliste, NTE Dailys, NTE Weeklys und NTE Todo?"
    },
    answer: {
      en: "Yes. This homepage is optimized as an NTE checklist and Neverness to Everness todo tracker, with dedicated areas for NTE dailys, NTE weeklys, reset timing, and quick access links.",
      de: "Ja. Diese Startseite ist als NTE-Checkliste und Neverness-to-Everness-Todo-Tracker optimiert, mit eigenen Bereichen für NTE Dailys, NTE Weeklys, Reset-Zeiten und Schnellzugriff-Links."
    }
  },
  {
    question: {
      en: "How are the reset timers calculated?",
      de: "Wie werden die Reset-Timer berechnet?"
    },
    answer: {
      en: "The app uses selectable reset presets grouped by America, Europe, and Asia. Daily resets follow the selected preset, and weekly resets happen every Monday at the same reset time.",
      de: "Die App nutzt auswählbare Reset-Vorgaben für Amerika, Europa und Asien. Daily-Resets folgen der gewählten Vorgabe und Weekly-Resets passieren jeden Montag zur selben Reset-Zeit."
    }
  },
  {
    question: {
      en: "Do I need an account to use the tracker?",
      de: "Brauche ich einen Account, um den Tracker zu nutzen?"
    },
    answer: {
      en: "No. Guest mode works immediately on the current device. An account is only needed if you want to keep checklist progress synced across devices.",
      de: "Nein. Der Gastmodus funktioniert sofort auf dem aktuellen Gerät. Einen Account brauchst du nur, wenn du deinen Checklisten-Fortschritt geräteübergreifend synchron halten willst."
    }
  },
  {
    question: {
      en: "Is this an official Neverness to Everness website?",
      de: "Ist das eine offizielle Neverness-to-Everness-Website?"
    },
    answer: {
      en: "No. Nevermiss to Everdone is an unofficial hobby companion for Neverness to Everness.",
      de: "Nein. Nevermiss to Everdone ist ein inoffizielles Hobby-Projekt für Neverness to Everness."
    }
  }
];

const copy = {
  overviewEyebrow: {
    en: "NTE Checklist for Neverness to Everness",
    de: "NTE-Checkliste für Neverness to Everness"
  },
  overviewTitle: {
    en: "NTE dailys, checklist, weeklys, and todo tracker",
    de: "NTE Dailys, Checkliste, Weeklys und Todo-Tracker"
  },
  overviewDescriptionPrimary: {
    en: "Nevermiss to Everdone is an unofficial Neverness to Everness checklist and NTE dailys tracker. It keeps NTE dailys and NTE weeklys visible, lets you choose grouped server reset presets for America, Europe, and Asia, and gives you quick access to curated Neverness to Everness links.",
    de: "Nevermiss to Everdone ist eine inoffizielle Neverness-to-Everness-Checkliste und ein NTE-Dailys-Tracker. Die Seite hält NTE Dailys und NTE Weeklys sichtbar, lässt dich gruppierte Server-Reset-Vorgaben für Amerika, Europa und Asien wählen und gibt dir schnellen Zugriff auf kuratierte Neverness-to-Everness-Links."
  },
  overviewDescriptionSecondary: {
    en: "If you search for NTE dailys, Neverness to Everness checklist, Neverness to Everness dailys, Neverness to Everness weeklys, Neverness to Everness todo, or Nevermiss to Everdone, this page is built to be the central hub for that workflow.",
    de: "Wenn du nach NTE Dailys, Neverness-to-Everness-Checkliste, Neverness-to-Everness-Dailys, Neverness-to-Everness-Weeklys, Neverness-to-Everness-Todo oder Nevermiss to Everdone suchst, ist diese Seite als zentraler Hub für genau diesen Ablauf gebaut."
  },
  searchIntentEyebrow: {
    en: "Search intent",
    de: "Suchintention"
  },
  searchIntentTitle: {
    en: "Built for NTE dailys, NTE checklist, NTE weeklys, and NTE todo searches",
    de: "Gebaut für Suchanfragen nach NTE Dailys, NTE-Checkliste, NTE Weeklys und NTE Todo"
  },
  searchIntentDescription: {
    en: "The page is structured so players looking for NTE dailys, an NTE checklist, Neverness to Everness checklist, Neverness to Everness weeklys, or a Neverness to Everness todo page can understand the tool immediately from the first crawlable screen.",
    de: "Die Seite ist so aufgebaut, dass Spieler, die nach NTE Dailys, einer NTE-Checkliste, einer Neverness-to-Everness-Checkliste, Neverness-to-Everness-Weeklys oder einer Neverness-to-Everness-Todo-Seite suchen, das Tool direkt auf dem ersten crawlbaren Screen verstehen."
  },
  featureTitle: {
    en: "Why players use nte.life for NTE dailys",
    de: "Warum Spieler nte.life für NTE Dailys nutzen"
  },
  faqTitle: {
    en: "FAQ",
    de: "FAQ"
  },
  legalPrefix: {
    en: "Legal details are available in the ",
    de: "Rechtliche Hinweise findest du im "
  },
  legalMiddle: {
    en: " and the ",
    de: " und in der "
  },
  legalSuffix: {
    en: ".",
    de: "."
  }
} as const;

function getClientLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  return getPreferredLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
}

export function SeoSections() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const syncLocale = () => {
      setLocale(getClientLocale());
    };

    syncLocale();
    window.addEventListener(LOCALE_CHANGE_EVENT, syncLocale);
    window.addEventListener("storage", syncLocale);

    return () => {
      window.removeEventListener(LOCALE_CHANGE_EVENT, syncLocale);
      window.removeEventListener("storage", syncLocale);
    };
  }, []);

  return (
    <section className="px-4 pb-4 text-ink sm:px-6 sm:pb-6">
      <div className="mx-auto grid max-w-6xl gap-4">
        <section
          aria-labelledby="seo-overview"
          className="rounded-[34px] border border-white/12 bg-black/22 p-6 shadow-glass backdrop-blur-2xl sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.32em] text-white/44">
                {pickLocalizedText(locale, copy.overviewEyebrow)}
              </p>
              <div className="space-y-3">
                <h2
                  id="seo-overview"
                  className="font-[var(--font-heading)] text-3xl uppercase leading-tight tracking-[0.04em] text-white sm:text-4xl"
                >
                  {pickLocalizedText(locale, copy.overviewTitle)}
                </h2>
                <p className="max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
                  {pickLocalizedText(locale, copy.overviewDescriptionPrimary)}
                </p>
                <p className="max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
                  {pickLocalizedText(locale, copy.overviewDescriptionSecondary)}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {overviewCards.map((card) => (
                <article
                  key={pickLocalizedText(DEFAULT_LOCALE, card.title)}
                  className="rounded-[24px] border border-white/12 bg-white/7 p-4 sm:last:col-span-2 lg:last:col-span-1"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-white/42">
                    {pickLocalizedText(locale, card.eyebrow)}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">{pickLocalizedText(locale, card.title)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="seo-intents"
          className="rounded-[34px] border border-white/12 bg-black/22 p-6 shadow-glass backdrop-blur-2xl sm:p-8"
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-white/44">
                {pickLocalizedText(locale, copy.searchIntentEyebrow)}
              </p>
              <h2
                id="seo-intents"
                className="font-[var(--font-heading)] text-2xl uppercase tracking-[0.04em] text-white sm:text-3xl"
              >
                {pickLocalizedText(locale, copy.searchIntentTitle)}
              </h2>
              <p className="max-w-4xl text-sm leading-7 text-white/68 sm:text-base">
                {pickLocalizedText(locale, copy.searchIntentDescription)}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {intentCards.map((intent) => (
                <article
                  key={pickLocalizedText(DEFAULT_LOCALE, intent.title)}
                  className="rounded-[24px] border border-white/10 bg-white/6 p-4"
                >
                  <h3 className="text-lg font-semibold text-white">{pickLocalizedText(locale, intent.title)}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">{pickLocalizedText(locale, intent.description)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <section
            aria-labelledby="seo-features"
            className="rounded-[34px] border border-white/12 bg-black/22 p-6 shadow-glass backdrop-blur-2xl sm:p-8"
          >
            <h2
              id="seo-features"
              className="font-[var(--font-heading)] text-2xl uppercase tracking-[0.04em] text-white sm:text-3xl"
            >
              {pickLocalizedText(locale, copy.featureTitle)}
            </h2>
            <div className="mt-5 grid gap-3">
              {featureBlocks.map((feature) => (
                <article
                  key={pickLocalizedText(DEFAULT_LOCALE, feature.title)}
                  className="rounded-[24px] border border-white/10 bg-white/6 p-4"
                >
                  <h3 className="text-lg font-semibold text-white">{pickLocalizedText(locale, feature.title)}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">{pickLocalizedText(locale, feature.description)}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="seo-faq"
            className="rounded-[34px] border border-white/12 bg-black/22 p-6 shadow-glass backdrop-blur-2xl sm:p-8"
          >
            <h2
              id="seo-faq"
              className="font-[var(--font-heading)] text-2xl uppercase tracking-[0.04em] text-white sm:text-3xl"
            >
              {pickLocalizedText(locale, copy.faqTitle)}
            </h2>
            <div className="mt-5 space-y-3">
              {faqItems.map((item) => (
                <article
                  key={pickLocalizedText(DEFAULT_LOCALE, item.question)}
                  className="rounded-[24px] border border-white/10 bg-white/6 p-4"
                >
                  <h3 className="text-lg font-semibold text-white">{pickLocalizedText(locale, item.question)}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">{pickLocalizedText(locale, item.answer)}</p>
                </article>
              ))}
            </div>

            <p className="mt-5 text-sm leading-7 text-white/58">
              {pickLocalizedText(locale, copy.legalPrefix)}
              <Link className="text-white underline decoration-white/30 underline-offset-4" href="/legal/imprint">
                {locale === "de" ? "Impressum" : "Legal Notice"}
              </Link>
              {pickLocalizedText(locale, copy.legalMiddle)}
              <Link className="text-white underline decoration-white/30 underline-offset-4" href="/legal/privacy">
                {locale === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
              </Link>
              {pickLocalizedText(locale, copy.legalSuffix)}
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}