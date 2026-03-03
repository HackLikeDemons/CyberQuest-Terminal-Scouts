# Über CyberQuest: Terminal Scouts

CyberQuest: Terminal Scouts ist ein browserbasiertes Lernspiel für 9- bis 12-Jährige, in dem Kinder als Junior-Analysten im Cyber-Labor einer Schule spannende digitale Rätsel lösen. In einer kindgerechten Story rund um den geheimnisvollen Digitalschatten lernen sie Schritt für Schritt wichtige Linux-Terminalbefehle wie ls, cd, cat und grep kennen, stärken ihr Sicherheitsverständnis und erleben, dass Cyber Security vor allem Verantwortung bedeutet.

## Jetzt ausprobieren

- https://hacklikedemons.github.io/CyberQuest-Terminal-Scouts/

## Projektstruktur

- `index.html`: App-Shell und UI-Markup
- `styles.css`: zentrales Styling/Themes
- `src/game.js`: Game-Engine, Commands, UI-Controller
- `src/data/levels.js`: Level- und Missionsdaten
- `src/data/command-info.js`: Hilfetexte pro Befehl
- `src/data/config.js`: App-Konstanten (Themes, Save-Key, Musik-Playlist)
- `assets/music/`: frei lizenzierte Tracks (optional)

## Lokal starten (ohne Deployment)

Da ES-Module genutzt werden, bitte ueber einen lokalen Webserver starten:

```bash
cd /Users/awienes/code/cyberquest
python3 -m http.server 8080
```

Dann im Browser oeffnen:

- `http://localhost:8080`

## Online veroeffentlichen (GitHub Pages)

Das Projekt ist rein statisch (HTML/CSS/JS). Es braucht keinen Build-Schritt.

1. Repository nach GitHub pushen.
2. In GitHub: `Settings` -> `Pages`.
3. Bei `Build and deployment` waehlen:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main` (oder `master`), Ordner `/ (root)`
4. Speichern und 1-3 Minuten warten.
5. Spiel aufrufen unter:
   - `https://<github-user>.github.io/<repo-name>/`

Hinweis: Bei Project-Pages muss die URL immer den Repo-Namen enthalten.

## Musik

Das Spiel nutzt nur frei lizenzierte lokale Tracks aus `assets/music/`.
Die Playlist steht in `src/data/config.js` (`LICENSED_TRACKS`).
Lizenzangaben und Quellen stehen in `assets/music/music-licence.md`.

## Lizenz

Der Quellcode dieses Projekts steht unter der Apache License 2.0.
Siehe `LICENSE`.

Hinweis: Musikdateien in `assets/music/` koennen abweichende Drittanbieter-Lizenzen haben.
Details stehen in `assets/music/music-licence.md`.
