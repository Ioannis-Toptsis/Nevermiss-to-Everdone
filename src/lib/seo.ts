const fallbackSiteUrl = "https://nte.life";

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || fallbackSiteUrl;

export const siteConfig = {
  name: "Nevermiss to Everdone",
  shortName: "nte.life",
  creator: "Ioannis Toptsis",
  defaultTitle: "NTE Dailys, Weeklys, Checklist, Todo Tracker, and Reset Timer for Neverness to Everness",
  description:
    "Nevermiss to Everdone is the NTE dailys checklist and todo tracker for Neverness to Everness, with NTE dailys, NTE weeklys, reset timers, useful links, and synced progress.",
  keywords: [
    "Neverness to Everness",
    "NTE",
    "Nevermiss to Everdone",
    "nte dailys",
    "NTE checklist",
    "NTE dailys",
    "NTE dailys checklist",
    "NTE dailys tracker",
    "NTE weeklys",
    "NTE todo",
    "Neverness to Everness checklist",
    "Neverness to Everness daily checklist",
    "Neverness to Everness weekly checklist",
    "Neverness to Everness reset timer",
    "Neverness to Everness dailies",
    "Neverness to Everness dailys",
    "Neverness to Everness dailys tracker",
    "Neverness to Everness weeklys",
    "Neverness to Everness todo",
    "Neverness to Everness companion app",
    "Neverness to Everness guide tracker",
    "Neverness to Everness useful links",
    "NTE reset tracker",
    "Neverness to Everness Checkliste"
  ],
  themeColor: "#08111b",
  ogAlt:
    "Nevermiss to Everdone preview card for the Neverness to Everness NTE dailys checklist and reset tracker."
} as const;

export const siteUrl = new URL(rawSiteUrl);

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl);
}