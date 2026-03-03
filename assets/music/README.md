# Hintergrundmusik fuer CyberQuest

Die App spielt nur die Tracks ab, die in `src/data/config.js` unter
`LICENSED_TRACKS` eingetragen sind.

Aktuell vorhandene Dateien:
- `kinetic-revo-main-version-17657-04-16.mp3`
- `1000 Handz - Keep Going.mp3`
- `Lightning Traveler - Awakening.mp3`
- `Lightning Traveler - Tranquility.mp3`

## Neuen Track hinzufuegen

1. MP3-Datei in `assets/music/` ablegen.
2. Eintrag in `src/data/config.js` (`LICENSED_TRACKS`) ergaenzen:
   - `src`: relativer Pfad zur Datei
   - `title`: Titel fuer die Ingame-Anzeige
3. Lizenzangaben in `assets/music/music-licence.md` dokumentieren.

## Lizenz-Hinweis

Nutze nur Musik, die du fuer dein Einsatzszenario verwenden darfst.
Wichtig bei Online-Veroeffentlichung:
- Bei `CC-BY`: korrekte Namensnennung angeben.
- Bei `CC-BY-NC`: nur fuer nicht-kommerzielle Nutzung.
