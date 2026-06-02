import type { Locale, TaskDefinition, UsefulLink } from "@/lib/types";

export const DEFAULT_LOCALE: Locale = "en";

export const CUSTOM_TASK_ICONS = [
  "checklist",
  "event",
  "swords",
  "shopping_bag",
  "stadia_controller",
  "forum",
  "flag",
  "bolt"
] as const;

export const DEFAULT_CUSTOM_TASK_ICON = CUSTOM_TASK_ICONS[0];

export const DAILY_TASKS: TaskDefinition[] = [
  {
    id: "d1",
    schedule: "daily",
    icon: "assignment",
    label: {
      en: "Daily participation tasks",
      de: "Tägliche Teilnahmeaufgaben"
    },
    detail: {
      en: "These Tasks you finding in the Exploration Handbook",
      de: "Diese Aufgaben findest du im Erkundungshandbuch"
    },
    points: 1
  },
  {
    id: "d2",
    schedule: "daily",
    icon: "confirmation_number",
    label: {
      en: "Daily battlepass quests",
      de: "Tägliche Battlepass-Aufgaben"
    },
    detail: {
      en: "Quests from the battlepass that refresh daily.",
      de: "Quests aus dem Battlepass, die täglich aktualisiert werden."
    },
    points: 1
  },
  {
    id: "d3",
    schedule: "daily",
    icon: "event_repeat",
    label: {
      en: "Check Daily Event Rewards",
      de: "Tägliche Event-Belohnungen überprüfen"
    },
    detail: {
      en: "Check the daily event rewards if you have any",
      de: "Überprüfe die täglichen Event-Belohnungen, wenn du welche hast"
    },
    points: 1
  },
  {
    id: "d4",
    schedule: "daily",
    icon: "waves",
    label: {
      en: "Nacupeda's Pool",
      de: "Nacupedas Brunnen"
    },
    detail: {
      en: "Receive a daily blessing from Nacupeda's Pool.",
      de: "Erhalte einen täglichen Segen aus Nacupedas Brunnen."
    },
    points: 1
  },
  {
    id: "d5",
    schedule: "daily",
    icon: "nature",
    label: {
      en: "Fortune Shades tree",
      de: "Wunschbaum"
    },
    detail: {
      en: "Pray at the Fortune Shades tree to increase the bond level of a random character.",
      de: "Am Wunschbaum beten um das Bindungslevel eines zufälligen Charakters zu erhöhen."
    },
    points: 1
  },
  {
    id: "d6",
    schedule: "daily",
    icon: "aq_indoor",
    label: {
      en: "Check Anomaly items in apartments",
      de: "Anomalie-Gegenstände in Apartments überprüfen"
    },
    detail: {
      en: "Check the anomaly items in your apartments",
      de: "Überprüfe die Anomalie-Gegenstände in deinen Apartments"
    },
    points: 1
  },
  {
    id: "d7",
    schedule: "daily",
    icon: "featured_seasonal_and_gifts",
    label: {
      en: "Give gifts to characters",
      de: "Geschenke an Charaktere geben"
    },
    detail: {
      en: "Give gifts to characters to increase their bond level.",
      de: "Gib Geschenke an Charaktere, um deren Bindungslevel zu erhöhen."
    },
    points: 1
  },
  {
    id: "d8",
    schedule: "daily",
    icon: "local_cafe",
    label: {
      en: "Collect cafe earnings",
      de: "Café-Einnahmen sammeln"
    },
    detail: {
      en: "Collect earnings from your café.",
      de: "Sammle die Einnahmen aus deinem Café."
    },
    points: 1
  },
  {
    id: "d9",
    schedule: "daily",
    icon: "wand_stars",
    label: {
      en: "Fortune readings from the Witch",
      de: "Segen von der Hexe"
    },
    detail: {
      en: "Receive fortune readings from the Witch.",
      de: "Erhalte Segen von der Hexe."
    },
    points: 1
  },
  {
    id: "d10",
    schedule: "daily",
    icon: "map_pin_heart",
    label: {
      en: "Go on a Date",
      de: "Geh auf ein Date"
    },
    detail: {
      en: "Go on a date with a character to increase their bond level.",
      de: "Gehe auf ein Date mit einem Charakter, um deren Bindungslevel zu erhöhen."
    },
    points: 1
  },
  {
    id: "d11",
    schedule: "daily",
    icon: "grain",
    label: {
      en: "Spend character pixels (Stamina)",
      de: "Charakter-Pixel ausgeben (Ausdauer)"
    },
    detail: {
      en: "Spend character pixels to enhance your characters.",
      de: "Gib Charakter-Pixel aus, um deine Charaktere zu verbessern."
    },
    points: 1
  },
  {
    id: "d12",
    schedule: "daily",
    icon: "shopping_cart",
    label: {
      en: "Check Shop items",
      de: "Shop-Artikel überprüfen"
    },
    detail: {
      en: "Check the available items in the Shop.",
      de: "Überprüfe die verfügbaren Artikel im Shop."
    },
    points: 1
  }
];

export const WEEKLY_TASKS: TaskDefinition[] = [
  {
    id: "w1",
    schedule: "weekly",
    icon: "money_bag",
    label: {
      en: "Mammon \"Realm of Greed\"",
      de: "Mammon „Reich der Gier“"
    },
    detail: {
      en: "Complete the Mammon \"Realm of Greed\" in apartment 1.",
      de: "Schließe Mammon „Reich der Gier“ in Apartment 1 ab."
    },
    points: 1
  },
  {
    id: "w2",
    schedule: "weekly",
    icon: "confirmation_number",
    label: {
      en: "Weekly battlepass quests",
      de: "Wöchentliche Battlepass-Aufgaben"
    },
    detail: {
      en: "Quests from the battlepass that refresh weekly.",
      de: "Quests aus dem Battlepass, die wöchentlich aktualisiert werden."
    },
    points: 1
  },
  {
    id: "w3",
    schedule: "weekly",
    icon: "delivery_truck_speed",
    label: {
      en: "Complete \"Special Delivery\"",
      de: "Schließe \"Spezielle Lieferung\" ab"
    },
    detail: {
      en: "Complete the \"Special Delivery\" in the second apartment. (need \"Old Mailbox\" in the second apartment)",
      de: "Schließe die \"Spezielle Lieferung\" im zweiten Apartment ab. (benötigt \"Alten Briefkasten\" im zweiten Apartment)"
    },
    points: 1
  },
  {
    id: "w4",
    schedule: "weekly",
    icon: "gavel",
    label: {
      en: "Auction hall items",
      de: "Auktionshalle"
    },
    detail: {
      en: "Check the available items in the auction hall.",
      de: "Überprüfe die verfügbaren Artikel in der Auktionshalle."
    },
    points: 1
  },
  {
    id: "w5",
    schedule: "weekly",
    icon: "swords",
    label: {
      en: "Anomaly pilgrimage bosses",
      de: "Anomalie-Pilger-Bosse"
    },
    detail: {
      en: "Defeat the anomaly pilgrimage bosses three times.",
      de: "Besiege die Anomalie-Pilger-Bosse dreimal."
    },
    points: 1
  },
  {
    id: "w6",
    schedule: "weekly",
    icon: "grain",
    label: {
      en: "Spend City Stamina",
      de: "Stadt-Ausdauer ausgeben"
    },
    detail: {
      en: "Spend your city stamina to earn money (fonds) and increase your city level.",
      de: "Gib deine Stadt-Ausdauer aus, um Geld (Fonds) zu verdienen und dein Stadtlevel zu erhöhen."
    },
    points: 1
  },
  {
    id: "w7",
    schedule: "weekly",
    icon: "account_balance",
    label: {
      en: "Pink Paws Bank HQ Heist",
      de: "Bank der rosa Pfötchen HQ Heist"
    },
    detail: {
      en: "Reach 1 million Fons at the Pink Paws Bank HQ Heist. (resets every 2 weeks)",
      de: "Erreiche 1 Mio. Fonds bei der Bank der rosa Pfötchen HQ Heist. (setzt alle 2 Wochen zurück)"
    },
    points: 1
  },
  {
    id: "w8",
    schedule: "weekly",
    icon: "nest_secure_alarm",
    label: {
      en: "Safe Run",
      de: "Tresor-Run"
    },
    detail: {
      en: "Complete a safe run, which respawns every week.",
      de: "Klapper alle Tresore ab, welche wöchentlich respawnen."
    },
    points: 1
  }
];

const buildGuideFallback =
  "https://www.google.com/search?q=Neverness+to+Everness+build+guide";

const mapFallback =
  "https://www.google.com/search?q=Neverness+to+Everness+interactive+map";

const wikiFallback =
  "https://www.google.com/search?q=Neverness+to+Everness+wiki";

export const USEFUL_LINKS: UsefulLink[] = [
  {
    id: "discord",
    icon: "chat",
    href: "https://discord.com/invite/nte",
    title: {
      en: "Official Discord",
      de: "Offizieller Discord"
    },
    detail: {
      en: "Join the Discord community.",
      de: "Tritt der Discord-Community bei."
    }
  },
  {
    id: "patch-notes",
    icon: "news",
    href: "https://game8.co/games/Neverness-to-Everness#hl_1",
    title: {
      en: "News Feed",
      de: "News-Feed"
    },
    detail: {
      en: "Trailer drops, announcements, and patch notes.",
      de: "Trailer, Ankündigungen und Patch-Notes."
    }
  },
  {
    id: "banner",
    icon: "ad",
    href: "https://neverness.gg/neverness-to-everness-banners",
    title: {
      en: "Banners",
      de: "Banner"
    },
    detail: {
      en: "List of All Banners.",
      de: "Liste aller Banner."
    }
  },
  {
    id: "chars",
    icon: "person",
    href: "https://www.prydwen.gg/neverness-to-everness/characters",
    title: {
      en: "Characters and Builds",
      de: "Charaktere und Builds"
    },
    detail: {
      en: "Character list, stats, skills, and progression.",
      de: "Charakterliste, Werte, Fähigkeiten und Fortschritt."
    }
  },
  {
    id: "tierlist",
    icon: "person_celebrate",
    href: "https://www.prydwen.gg/neverness-to-everness/tier-list/",
    title: {
      en: "Tier List",
      de: "Tier-Liste"
    },
    detail: {
      en: "Character rankings and tier information.",
      de: "Charakter-Rankings und Tier-Informationen."
    }
  },
  {
    id: "tierlist-teams",
    icon: "person_play",
    href: "https://www.prydwen.gg/neverness-to-everness/team-tier-list/",
    title: {
      en: "Team Tier List",
      de: "Team Tier-Liste"
    },
    detail: {
      en: "Team composition rankings and synergy insights.",
      de: "Team-Zusammenstellungs-Rankings und Synergie-Einblicke."
    }
  },
  {
    id: "codes",
    icon: "redeem",
    href: "https://www.prydwen.gg/neverness-to-everness/codes/",
    title: {
      en: "Codes",
      de: "Codes"
    },
    detail: {
      en: "Redeemable codes for in-game rewards.",
      de: "Einlösbare Codes für In-Game-Belohnungen."
    }
  },
  {
    id: "guides",
    icon: "explore",
    href: "https://www.prydwen.gg/neverness-to-everness/guides/",
    title: {
      en: "Guides",
      de: "Guides"
    },
    detail: {
      en: "Guides, farming tips, and beginner advice.",
      de: "Guides, Farming-Tipps und Anfängerhinweise."
    }
  },
  {
    id: "map",
    icon: "map",
    href: "https://interactivemap.app/neverness-to-everness/maps/hethereau",
    title: {
      en: "Interactive Map",
      de: "Interaktive Karte"
    },
    detail: {
      en: "Interactive map for navigation and exploration.",
      de: "Interaktive Karte zur Navigation und Erkundung."
    }
  },
  {
    id: "arcs",
    icon: "sword_rose",
    href: "https://www.prydwen.gg/neverness-to-everness/arcs/",
    title: {
      en: "Arcs / Weapons",
      de: "Arcs / Waffen"
    },
    detail: {
      en: "Comprehensive list of Arcs / weapons with stats and locations.",
      de: "Umfassende Liste der Arcs / Waffen mit Werten und Standorten."
    }
  },
  {
    id: "modules",
    icon: "sd_card",
    href: "https://www.prydwen.gg/neverness-to-everness/guides/modules-cartridge/",
    title: {
      en: "Modules / Cartridge",
      de: "Modules / Cartridge"
    },
    detail: {
      en: "Comprehensive list of Modules / cartridge with stats and locations.",
      de: "Umfassende Liste der Modules / Cartridge mit Werten und Standorten."
    }
  }
];
