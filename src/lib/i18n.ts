import { DEFAULT_LOCALE } from "@/lib/data";
import type { Locale, LocalizedText } from "@/lib/types";

export const LOCALE_STORAGE_KEY = "nte.life.locale";
export const LOCALE_CHANGE_EVENT = "nte:locale-change";

export const dictionary = {
  en: {
    appTag: "Nevermiss to Everdone",
    heroTitle: "Daily Flow. Your control.",
    heroText:
      "A tracker for Neverness to Everness, and community context.",
    guestHint: "Guest mode uses this device only.",
    authPersistent: "synced progress",
    dailyProgress: "Daily Progress",
    weeklyProgress: "Weekly Progress",
    resetIn: "Reset in",
    dailyReset: "Daily reset",
    weeklyReset: "Weekly reset",
    monday: "Every Monday at the selected reset time",
    hub: "Hub",
    dailys: "Dailys",
    weeklys: "Weeklys",
    todos: "ToDo",
    usefulLinks: "Useful Links",
    customTasks: "Custom Tasks",
    addTask: "Add Entry",
    taskPlaceholder: "New custom task",
    customTaskModalTitle: "Add custom task",
    customTaskModalText:
      "Create a checklist entry for this section. It is saved with your checklist but does not affect the Community Pulse.",
    customTaskTitleLabel: "Title",
    customTaskDescriptionLabel: "Description",
    customTaskIconLabel: "Icon",
    customTaskTitlePlaceholder: "For example: Buy stamina pack",
    customTaskDescriptionPlaceholder: "Optional note for this task",
    customTaskPrivateNote: "Custom tasks only change your own checklist progress.",
    customTaskEditModalTitle: "Edit custom task",
    customTaskEditModalText:
      "Update or remove this custom checklist entry. It stays private to your own checklist and never changes the Community Pulse.",
    todoModalText:
      "Create a persistent ToDo entry. It stays on your personal list until you change or delete it, never resets, and does not affect the Community Pulse.",
    todoEditModalText:
      "Update or remove this persistent ToDo entry. It stays private, never resets automatically, and does not affect the Community Pulse.",
    todoEmptyState:
      "No entries yet. Add your own ToDo items. This list never resets.",
    editTask: "Edit",
    updateTask: "Save changes",
    deleteTask: "Delete task",
    customTaskBadge: "Custom",
    dragToSort: "Drag the handle to save your own checklist order.",
    dragHandle: "Drag to reorder checklist item",
    cancel: "Cancel",
    saveTask: "Save task",
    communityTitle: "Community Pulse",
    communityText: "checkmarks have been set globally this cycle.",
    dailyFinishers: "Daily clears",
    weeklyFinishers: "Weekly clears",
    dailyVisitors: "User before daily-reset",
    totalVisitors: "All-time users",
    joinDiscord: "Join Discord",
    discordCommunityTitle: "Janni.fun community",
    discordCommunityText:
      "A Discord for NTE and other projects running under janni.fun.",
    poweredBy: "powered by janni.fun",
    disclaimer: "Unofficial companion for Neverness to Everness.",
    legalHeading: "Legal",
    legalNotice: "Legal Notice",
    privacyPolicy: "Privacy Policy",
    signIn: "Sign in",
    register: "Register",
    signOut: "Sign out",
    name: "Name",
    email: "Email",
    password: "Password",
    continueWithGoogle: "Google",
    googleMissing: "Google disabled",
    authTitle: "Sync your checklist",
    authText:
      "Use credentials or Google OAuth. Authenticated users keep progress across devices.",
    registerSuccess: "Account created. Logging you in...",
    authError: "Auth failed. Check your details and try again.",
    registerError: "Registration failed. Email may already exist.",
    googleAuthError: "Google sign-in failed. Try again.",
    loadError: "The dashboard could not be loaded.",
    starterLoadout: "checklist",
    timeZoneLabel: "Time zone",
    resetTimeLabel: "Reset time",
    timeZoneAuto: "Use a supported reset preset",
    localResetTime: "Selected reset time",
    resetBase: "Reset base",
    timeZoneHint: "Daily resets happen every day at your selected local time. Weekly resets always happen on Monday at the same local time.",
    americaServers: "America Servers",
    europeServers: "Europe Servers",
    asiaServers: "Asia Servers",
    videoFallbackHint: "Drop /public/nte_bg.mp4 to override the fallback video."
  },
  de: {
    appTag: "Nevermiss to Everdone",
    heroTitle: "Daily Flow. Your control.",
    heroText:
      "Ein Tracker für Neverness to Everness, Auto-Resets und Community-Kontext.",
    guestHint: "Gastmodus speichert nur auf diesem Gerät.",
    authPersistent: "Synchroner Fortschritt",
    dailyProgress: "Daily-Fortschritt",
    weeklyProgress: "Weekly-Fortschritt",
    resetIn: "Reset in",
    dailyReset: "Daily-Reset",
    weeklyReset: "Weekly-Reset",
    monday: "Jeden Montag zur gewählten Reset-Zeit",
    hub: "Hub",
    dailys: "Dailys",
    weeklys: "Weeklys",
    todos: "ToDo",
    usefulLinks: "Nützliche Links",
    customTasks: "Eigene Aufgaben",
    addTask: "Eintrag hinzufügen",
    taskPlaceholder: "Neue eigene Aufgabe",
    customTaskModalTitle: "Eigene Aufgabe hinzufügen",
    customTaskModalText:
      "Erstelle einen Checklisten-Eintrag für diesen Bereich. Er wird mit deiner Checkliste gespeichert, beeinflusst aber nicht den Community-Pulse.",
    customTaskTitleLabel: "Titel",
    customTaskDescriptionLabel: "Beschreibung",
    customTaskIconLabel: "Icon",
    customTaskTitlePlaceholder: "Zum Beispiel: Stamina-Paket kaufen",
    customTaskDescriptionPlaceholder: "Optionale Notiz für diese Aufgabe",
    customTaskPrivateNote: "Eigene Aufgaben verändern nur deinen persönlichen Checklisten-Fortschritt.",
    customTaskEditModalTitle: "Eigene Aufgabe bearbeiten",
    customTaskEditModalText:
      "Passe diesen eigenen Checklisten-Eintrag an oder lösche ihn. Er bleibt privat in deiner Checkliste und verändert nie den Community-Pulse.",
    todoModalText:
      "Erstelle einen dauerhaften ToDo-Eintrag. Er bleibt in deiner persönlichen Liste, bis du ihn änderst oder löschst, wird nie automatisch resettet und beeinflusst nicht den Community-Pulse.",
    todoEditModalText:
      "Passe diesen dauerhaften ToDo-Eintrag an oder lösche ihn. Er bleibt privat, wird nie automatisch resettet und verändert nicht den Community-Pulse.",
    todoEmptyState:
      "Noch keine Einträge. Füge deine eigenen ToDo-Punkte hinzu. Diese Liste wird nie resettet.",
    editTask: "Bearbeiten",
    updateTask: "Änderungen speichern",
    deleteTask: "Aufgabe löschen",
    customTaskBadge: "Eigen",
    dragToSort: "Ziehe den Griff, um deine eigene Checklisten-Reihenfolge zu speichern.",
    dragHandle: "Zum Umsortieren ziehen",
    cancel: "Abbrechen",
    saveTask: "Aufgabe speichern",
    communityTitle: "Community-Pulse",
    communityText: "Häkchen wurden in diesem Zyklus von der Community gesetzt.",
    dailyFinishers: "Daily-Clears",
    weeklyFinishers: "Weekly-Clears",
    dailyVisitors: "User vor Daily-Reset",
    totalVisitors: "User gesamt",
    joinDiscord: "Discord beitreten",
    discordCommunityTitle: "Janni.fun Community",
    discordCommunityText:
      "Ein Discord für NTE und weitere Projekte, die unter janni.fun laufen.",
    poweredBy: "powered by janni.fun",
    disclaimer: "Inoffizielle Companion-App für Neverness to Everness.",
    legalHeading: "Rechtliches",
    legalNotice: "Impressum",
    privacyPolicy: "Datenschutz",
    signIn: "Einloggen",
    register: "Registrieren",
    signOut: "Ausloggen",
    name: "Name",
    email: "E-Mail",
    password: "Passwort",
    continueWithGoogle: "Google",
    googleMissing: "Google nicht konfiguriert",
    authTitle: "Checkliste synchronisieren",
    authText:
      "Per Zugangsdaten oder Google OAuth anmelden. Eingeloggte Nutzer behalten Fortschritt geräteübergreifend.",
    registerSuccess: "Account erstellt. Login läuft...",
    authError: "Login fehlgeschlagen. Daten prüfen und erneut versuchen.",
    registerError: "Registrierung fehlgeschlagen. E-Mail existiert eventuell schon.",
    googleAuthError: "Google-Login fehlgeschlagen. Bitte erneut versuchen.",
    loadError: "Das Dashboard konnte nicht geladen werden.",
    starterLoadout: "Checkliste",
    timeZoneLabel: "Zeitzone",
    resetTimeLabel: "Reset-Uhrzeit",
    timeZoneAuto: "Vordefinierte Reset-Zone",
    localResetTime: "Gewählte Reset-Zeit",
    resetBase: "Reset-Basis",
    timeZoneHint: "Daily-Resets passieren jeden Tag zu deiner gewählten lokalen Uhrzeit. Weekly-Resets sind immer montags zur selben lokalen Uhrzeit.",
    americaServers: "Amerika-Server",
    europeServers: "Europa-Server",
    asiaServers: "Asien-Server",
    videoFallbackHint: "Lege /public/nte_bg.mp4 ab, um das Fallback-Video zu ersetzen."
  }
} as const;

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "de";
}

export function getPreferredLocale(value: string | null | undefined) {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function t(locale: Locale, key: keyof (typeof dictionary)["en"]) {
  return dictionary[locale][key] ?? dictionary[DEFAULT_LOCALE][key];
}

export function pickLocalizedText(locale: Locale, value: LocalizedText) {
  return value[locale] ?? value[DEFAULT_LOCALE];
}
