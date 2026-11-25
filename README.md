# Dr!ve

Dr!ve zeichnet Autofahrten automatisch auf und zeigt Wochenstatistiken, Erfolge und einen Vergleich mit Freunden.
**Datenschutz:** Fahrten, Routen und GPS-Punkte bleiben nur auf dem Handy. An den Server gehen nur Summen
(km/Woche, Anzahl Fahrten, Serie, Erfolge).

Tech-Stack: Expo SDK 58 · React Native · TypeScript · expo-router · Reanimated · react-native-svg · i18next (DE/EN) · zustand.

## Stand

| Phase | Inhalt | Status |
|---|---|---|
| 1 | Projekt, Struktur, Design-Tokens, Navigation, Onboarding (Sprache, Design), Startanimation, EAS | ✅ |
| 2 | Fahrterkennung, SQLite, Simulation, Tests, Diagnose | ✅ |
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

## 2. Schnell testen mit Expo Go (nur Oberfläche)

Die Oberfläche (Onboarding, Design, Startanimation) läuft auch in **Expo Go**. Die Fahrterkennung im Hintergrund
funktioniert dort **nicht** – dafür brauchst du den Development Build aus Abschnitt 3.

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

> Hinweis: Der native Splash-Screen sieht in Expo Go/Development Builds anders aus als in der fertigen App. Die Logo-Animation selbst siehst du aber überall.

## 3. Eigener Build für dein iPhone mit EAS (Cloud, ohne Mac)

### 3.1 Konten

| Konto | Kosten | Wofür |
|---|---|---|
| Expo-Konto (https://expo.dev/signup) | kostenlos (begrenzte Zahl Cloud-Builds pro Monat, siehe expo.dev/pricing) | Cloud-Builds |
| Apple Developer Program (https://developer.apple.com/programs/) | **99 USD/Jahr** | Pflicht, um eigene Apps auf ein echtes iPhone zu installieren (und später für den App Store) |

Die Freischaltung des Apple-Kontos kann 1–2 Tage dauern.

### 3.2 Bundle-ID festlegen (einmalig)

Steht in `app.config.ts`: `com.semion.drive`. Nach der Veröffentlichung im App Store nicht mehr ändern.

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

## 4a. Fahrterkennung testen (Phase 2)

> Wichtig: Nach Phase 2 brauchst du einen **neuen Development Build** (`npm run build:dev:ios`), weil Standort,
> Hintergrundmodus und Berechtigungstexte nativ eingebaut werden.

### Simulation (ohne zu fahren)

1. App öffnen → **Einstellungen** → ganz unten **7× schnell auf die Versionsnummer tippen** → Diagnose öffnet sich.
2. Unter „Simulation“ eine Beispielfahrt wählen, Tempo **30×** oder **Sofort**, dann **Abspielen**.
3. Erwartete Ergebnisse:

| Beispiel | Erwartung |
|---|---|
| Stadtfahrt ~9 km | Fahrt gespeichert (~9 km, Ampelstopps teilen die Fahrt nicht) |
| Kurzstrecke < 500 m | Fahrt verworfen (tooShort) |
| Spaziergang | Keine Fahrt |
| Radtour | Keine Fahrt (iOS meldet „Fahrrad“) |
| Autobahn mit Tunnel | Fahrt gespeichert, 200 s ohne GPS beenden die Fahrt nicht |

4. **Eigene GPX-Datei** (z. B. aus einer anderen App exportiert) über „Eigene GPX-Datei …“ laden.
5. Simulierte Fahrten sind in der Datenbank als `simulation` markiert.

### Echte Fahrt

1. Onboarding: Standort **„Immer erlauben“** und **Bewegung & Fitness** erlauben.
2. Wochenübersicht zeigt „Automatische Erkennung aktiv“ (grüner Punkt).
3. App schließen und losfahren. Nach ca. 150 m merkt iOS, dass du den Parkplatz verlassen hast, Dr!ve prüft kurz per GPS
   und startet die Aufzeichnung nach 1 Minute über 15 km/h (die Strecke ab dem Losfahren wird mitgespeichert).
4. Nach 3 Minuten Stillstand endet die Fahrt. Unter 500 m wird sie verworfen.
5. Danach in der Diagnose → **Protokoll** ansehen bzw. **Teilen** (z. B. an dich selbst schicken).

### Start-/Stopp-Knopf und CarPlay/Bluetooth

iOS meldet einer App im Hintergrund **nicht zuverlässig**, dass sich das iPhone mit dem Auto-Bluetooth oder CarPlay verbindet.
Deshalb gibt es:

- den Knopf **„Fahrt starten“ / „Fahrt beenden“** auf der Wochenübersicht,
- die Links `drive://trip/start` und `drive://trip/stop`. Damit kannst du eine **Kurzbefehle-Automation** bauen:
  Kurzbefehle-App → Automation → **CarPlay** (oder **Bluetooth** → dein Auto) → „Verbindet“ → Aktion **URL öffnen** →
  `drive://trip/start` → „Sofort ausführen“.

### Wie Dr!ve Akku spart

| Zustand | Was läuft | Verbrauch |
|---|---|---|
| Ruhe | nur ein Geofence (Kreis 150 m um den Parkplatz) | praktisch null |
| Prüfen | genaues GPS für max. 4 Minuten nach Verlassen des Kreises + Bewegungserkennung | gering |
| Fahrt | bestes GPS, gebündelt alle 10 s an die App | normal für Navi |

Nach Fehlalarmen (z. B. Spaziergang) wird der Kreis größer (300 → 600 → 1000 m), damit GPS nicht ständig anspringt.
Nach jeder echten Fahrt geht er auf 150 m zurück. Den Akkustand loggt Dr!ve bei jedem Wechsel (Diagnose → Protokoll).

### Bekannte Grenzen (ehrlich)

- Wenn du die App **in der App-Übersicht wegwischst**, weckt iOS sie trotzdem beim Verlassen des Geofence – das ist der
  Grund für diese Architektur. Nach einem **Neustart des iPhones** ist der Geofence erst wieder aktiv, wenn du Dr!ve einmal öffnest.
- iOS meldet das Verlassen des Kreises oft erst nach 100–300 m. Der Anfang der Fahrt kann deshalb wenige hundert Meter fehlen.
- Bus/Bahn erkennt iOS ebenfalls als „Fahrzeug“ – solche Fahrten werden derzeit mit aufgezeichnet.
- Android nutzt für Standort und Bewegungserkennung die Google Play Services (über expo-location).

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
  domain/              Reine Fachlogik ohne Handy-Abhängigkeit (100 % unit-getestet)
    detection/         Zustandsautomat der Fahrterkennung, Statistik, Geo-Rechnung
    recording/         Ereignisse → gespeicherte Fahrten (inkl. 500-m-Regel)
    gpx/               GPX lesen/schreiben, Beispielfahrten
    simulation/        Erkennung über eine ganze Strecke laufen lassen
    trip.ts            Datenmodell Fahrt (inkl. vorbereiteter Fahrtenbuch-Felder)
  data/                SQLite: Schema/Migrationen, Fahrten, Protokoll
  services/
    tracking/          Hintergrund-Tasks, Energiemodi (Geofence/GPS), Engine
    simulation/        GPX-Abspieler für die Diagnose
    permissions.ts     Berechtigungen lesen/anfragen
locales/ios/           Berechtigungstexte für iOS (Deutsch/Englisch)
scripts/generate-icons.ts  App-Icon aus dem Logo-SVG erzeugen
assets/images/         Icon, Android-Icons, icon.svg (Vorlage)
```

## 5a. Datenmodell

- `trips`: eine Zeile pro Fahrt. Felder `category` (privat/geschäftlich/Arbeitsweg), `purpose`, `odometer_*_km` und
  `vehicle_type` sind für das spätere Fahrtenbuch und Motorrad/Fahrrad vorbereitet.
- `trip_changes`: Jede Änderung an einer abgeschlossenen Fahrt wird per Datenbank-Trigger automatisch protokolliert.
- `trip_points`: GPS-Punkte (nur lokal). `detection_log`: Diagnose-Protokoll (max. 3000 Einträge).
- Schema-Änderungen nur als **neue** Migration in `src/data/schema.ts` anhängen.

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
