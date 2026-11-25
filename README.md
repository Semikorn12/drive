# Dr!ve

Dr!ve zeichnet Autofahrten automatisch auf und zeigt Wochenstatistiken, Erfolge und einen Vergleich mit Freunden.
**Datenschutz:** Fahrten, Routen und GPS-Punkte bleiben nur auf dem Handy. An den Server gehen nur Summen
(km/Woche, Anzahl Fahrten, Serie, Erfolge).

Tech-Stack: Expo SDK 58 · React Native · TypeScript · expo-router · Reanimated · react-native-svg · i18next (DE/EN) · zustand.

## Stand

| Phase | Inhalt | Status |
|---|---|---|
| 1 | Projekt, Struktur, Design-Tokens, Navigation, Onboarding (Sprache, Design), Startanimation, EAS | ✅ |
| 2 | Fahrterkennung, SQLite, Simulation, Tests, Diagnose | – |
| 3 | Fahrtenliste, Fahrtdetail mit Karte + Diagramm, Live-Tacho | – |
| 4 | Wochenübersicht, Erfolge, Wochenrückblick | – |
| 5 | Supabase: Konto, Freunde, Rangliste | – |
| 6 | Feinschliff, Texte, Icon, README | – |

---

## 1. Voraussetzungen (Windows)

1. **Node.js LTS** (Version 22 oder neuer) von https://nodejs.org installieren.
2. **Git** von https://git-scm.com installieren.
3. PowerShell öffnen und prüfen:

```powershell
node -v
npm -v
git --version
```

4. Projekt holen und Abhängigkeiten installieren:

```powershell
cd $HOME\Projekte\drive
npm install
```

## 2. Schnell testen mit Expo Go (nur Phase 1, kostenlos)

Phase 1 nutzt nur Module, die in der App **Expo Go** enthalten sind. Damit kannst du sofort testen – ohne Apple-Developer-Konto.

1. Auf dem iPhone **Expo Go** aus dem App Store installieren.
2. PC und iPhone ins gleiche WLAN.
3. In PowerShell:

```powershell
npm run start:go
```

4. Den QR-Code mit der iPhone-**Kamera** scannen → öffnet in Expo Go.

Klappt die Verbindung nicht (Firewall/Firmen-WLAN), nimm den Tunnel:

```powershell
npm run start:go -- --tunnel
```

> Ab Phase 2 (Hintergrund-Standort) reicht Expo Go **nicht** mehr. Dann brauchst du einen Development Build (Abschnitt 3).
> Hinweis: Der native Splash-Screen sieht in Expo Go/Development Builds anders aus als in der fertigen App. Die Logo-Animation selbst siehst du aber überall.

## 3. Eigener Build für dein iPhone mit EAS (Cloud, ohne Mac)

### 3.1 Konten

| Konto | Kosten | Wofür |
|---|---|---|
| Expo-Konto (https://expo.dev/signup) | kostenlos (begrenzte Zahl Cloud-Builds pro Monat, siehe expo.dev/pricing) | Cloud-Builds |
| Apple Developer Program (https://developer.apple.com/programs/) | **99 USD/Jahr** | Pflicht, um eigene Apps auf ein echtes iPhone zu installieren (und später für den App Store) |

Die Freischaltung des Apple-Kontos kann 1–2 Tage dauern.

### 3.2 Bundle-ID festlegen (einmalig)

In `app.config.ts` die Zeile `const BUNDLE_ID = 'com.meinname.drive';` auf deinen Namen ändern, z. B. `com.maxmustermann.drive`
(nur Kleinbuchstaben, Ziffern, Punkte – kein „!“).

### 3.3 EAS einrichten

```powershell
npm install -g eas-cli
```

```powershell
eas login
```

```powershell
eas init
```

`eas init` verknüpft das Projekt mit deinem Expo-Konto und trägt eine `projectId` ein.

### 3.4 iPhone registrieren

```powershell
eas device:create
```

Wähle „Website“, öffne den Link bzw. QR-Code **auf dem iPhone in Safari** und installiere das Profil
(Einstellungen → Allgemein → VPN und Geräteverwaltung). Damit kennt Apple dein Gerät.

### 3.5 Development Build bauen

```powershell
npm run build:dev:ios
```

- Beim ersten Mal fragt EAS nach deinem Apple-Login und erstellt Zertifikat + Provisioning-Profil automatisch („Let EAS handle it“ → Ja).
- Der Build läuft ca. 10–20 Minuten in der Cloud. Am Ende gibt es einen Link/QR-Code.

### 3.6 Installieren

1. Link/QR-Code auf dem iPhone öffnen → **Installieren**.
2. iPhone: **Einstellungen → Datenschutz & Sicherheit → Entwicklermodus** einschalten, neu starten, bestätigen.
3. Auf dem PC den Entwicklungsserver starten:

```powershell
npm start
```

4. Die Dr!ve-App auf dem iPhone öffnen und den Server auswählen bzw. den QR-Code scannen.

Ein neuer Development Build ist nur nötig, wenn sich **native** Teile ändern (neue native Bibliothek, Berechtigungen in `app.config.ts`).
Reine Code-Änderungen kommen per Hot Reload sofort aufs Handy.

### 3.7 Vorschau-Build (wie die echte App, mit echtem Splash)

```powershell
npm run build:preview:ios
```

## 4. Testen & Prüfen

```powershell
npm test
```

```powershell
npm run typecheck
```

```powershell
npm run lint
```

## 5. Projektstruktur

```
src/
  app/                 Bildschirme (expo-router: jede Datei = eine Route)
    _layout.tsx        Wurzel: Theme, Startanimation, Onboarding-Weiche
    onboarding/        Sprache → Design → Konto → Fertig
    (tabs)/            Woche, Fahrten, Vergleich, Erfolge, Einstellungen
  components/
    brand/             Logo-Geometrie, statisches Logo, Startanimation
    ui/                Header, Karten, Buttons, Deko-Linien, Icons
    onboarding/        Onboarding-Layout
    AdBanner.tsx       Platzhalter Werbung (Feature-Flag aus)
  theme/
    tokens.ts          ⭐ Alle Farben, Abstände, Schriftgrößen
    themes.ts          Dunkel/Hell-Zuordnung
  i18n/                i18next + locales/de.json, en.json
  state/               Einstellungen (zustand, gespeichert in AsyncStorage)
  config/              Feature-Flags (Werbung, Abo, Fahrtenbuch … alle aus)
  domain/              Fachlogik (ab Phase 2: Fahrterkennung, Datenmodell)
scripts/generate-icons.ts  App-Icon aus dem Logo-SVG erzeugen
assets/images/         Icon, Android-Icons, icon.svg (Vorlage)
```

## 6. Design anpassen

Alle Farben, Abstände und Schriftgrößen stehen in `src/theme/tokens.ts`. Beispiel: Akzent-Orange ändern → `orange500`.
Welche Farbe wo im Dark-/Light-Mode verwendet wird, steht in `src/theme/themes.ts`.

## 7. Startanimation

- `src/components/brand/logoGeometry.ts` – Schriftzug als SVG-Pfade (eine Quelle für Logo, Animation **und** App-Icon).
- `src/components/brand/IntroAnimation.tsx` – Ablauf: Buchstaben gleiten ein → Pause → „i“ wird „!“ (Feder) → lila Linie + Haptik → Logo fliegt in den Header. Läuft komplett auf dem UI-Thread (Reanimated).
- `src/components/brand/brandLayout.ts` – Zeitplan (max. 1,8 s) und Header-Position.
- Antippen überspringt. Nur beim Kaltstart. „Bewegung reduzieren“ → nur kurzes Einblenden des fertigen Logos.

## 8. App-Icon neu erzeugen (optional)

```powershell
npm install --no-save playwright
```

```powershell
npx playwright install chromium
```

```powershell
npm run icons
```
