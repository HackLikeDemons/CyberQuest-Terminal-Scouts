/*
  Unlock-Regelschema (formalisiert):
  - unlockRule: { type: "allOf" | "anyOf" | "not" | "<atomar>", ... }
  - atomare Typen: dirExists, fileExists, fileMissing, fileContains, modeEquals, flag
  - legacy fallback: unlockRequirements bleibt unterstuetzt und wird intern als allOf behandelt.
*/
export const LEVELS = [
  {
    id: 0,
    title: "Level 1 - Rufname",
    briefing: "Deine Aufgabe: Setze deinen Analystennamen direkt im Terminal.",
    objective: "Nutze <code>setname DEINNAME</code> und bestätige danach mit <code>unlock BEREIT</code>.",
    allowed: ["help", "story", "man", "setname", "clear", "unlock", "hint"],
    learningCommands: ["setname"],
    startCwd: "/",
    successWord: "BEREIT",
    points: 50,
    chapterId: "kapitel-1",
    chapterTitle: "Kapitel 1 - Grundlagen im Schulnetz",
    chapterIntro: "Willkommen im Cyber-Labor der Schule. Frau Weber und Ben zeigen dir die ersten Schritte im Terminal.",
    introText: "Frau Weber sagt: 'Richte zuerst dein Profil ein, dann starten wir die erste Analyse.'",
    successText: "Profil aktiv. Ben nickt: 'Okay, du bist offiziell im Cyber-Labor dabei.'",
    knowledgeCard: {
      title: "Identität im System",
      text: "Mit setname gibst du dir als Analyst einen Namen. In echten Systemen hilft eine klare Identität bei Teamarbeit und Sicherheit.",
      example: "setname Andi"
    },
    unlockRule: {
      type: "allOf",
      requirements: [{ type: "flag", key: "setname" }]
    },
    unlockHint: "Setze zuerst deinen Namen mit setname DEINNAME.",
    hints: ["Beispiel: setname Andi", "Danach: unlock BEREIT"],
    fs: { "/": { type: "dir", children: { "willkommen.txt": { type: "file", content: "Willkommen im Cyber-Labor der Schule!\nFrau Weber: 'Bleib ruhig, arbeite sauber, dann findest du jede Spur.'\nBen: 'Und wenn der Digitalschatten wieder auftaucht, sind wir bereit!'" } } } }
  },
  {
    id: 1,
    title: "Level 2 - Erste Spur",
    briefing: "Deine Aufgabe: Finde die Datei <code>hinweis.txt</code>.",
    objective: "Lies die Datei und gib den Code mit <code>unlock CODE</code> ein.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "clear", "unlock", "hint"],
    learningCommands: ["ls", "cd", "cat"],
    startCwd: "/",
    successWord: "MONDSTEIN",
    points: 100,
    chapterId: "kapitel-1",
    chapterTitle: "Kapitel 1 - Grundlagen im Schulnetz",
    introText: "Eine Datei mit einem Hinweis zur AG-Anmeldung ist verschwunden.",
    successText: "Hinweis gefunden. Frau Weber: 'Sehr gut, du arbeitest strukturiert.'",
    knowledgeCard: {
      title: "Ordner und Dateien",
      text: "Ordner enthalten Dateien und weitere Ordner. Mit cd wechselst du den Ort, mit cat liest du Inhalte.",
      example: "cd ordner1, dann cat hinweis.txt"
    },
    unlockRequirements: [
      { type: "flag", key: "cat", value: "/ordner1/hinweis.txt" }
    ],
    unlockHint: "Lies zuerst die Datei /ordner1/hinweis.txt mit cat.",
    hints: ["Starte mit ls.", "Gehe mit cd in den Ordner ordner1.", "Lies hinweis.txt mit cat."],
    fs: { "/": { type: "dir", children: { ordner1: { type: "dir", children: { "hinweis.txt": { type: "file", content: "CODE: MONDSTEIN" } } }, "start.txt": { type: "file", content: "Willkommen! Schau mal in den Ordner rein oder benutze den Befehl: help" } } } }
  },
  {
    id: 2,
    title: "Level 3 - Ordner-Labyrinth",
    briefing: "Deine Aufgabe: Finde den richtigen Unterordner.",
    objective: "Der Code liegt in <code>basis/raum/karte.txt</code>.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "clear", "unlock", "hint"],
    learningCommands: ["pwd", "cd .."],
    startCwd: "/basis",
    successWord: "KOMET",
    points: 120,
    chapterId: "kapitel-1",
    chapterTitle: "Kapitel 1 - Grundlagen im Schulnetz",
    introText: "Im Schulnetz wurden Ordner verschoben. Finde den richtigen Pfad zur Karte.",
    successText: "Navigation sitzt. Ben: 'Damit kommst du jetzt auch in verschachtelten Ordnern klar.'",
    knowledgeCard: {
      title: "Navigation",
      text: "pwd zeigt deinen aktuellen Pfad. cd .. bringt dich einen Ordner nach oben.",
      example: "pwd / cd .."
    },
    unlockRequirements: [
      { type: "flag", key: "cat", value: "/basis/raum/karte.txt" }
    ],
    unlockHint: "Finde und lies zuerst die Datei /basis/raum/karte.txt.",
    hints: ["pwd zeigt, wo du bist.", "Nutze cd .. für einen Schritt zurück.", "Dann weiter in den Ordner raum."],
    fs: { "/": { type: "dir", children: { basis: { type: "dir", children: { raum: { type: "dir", children: { "karte.txt": { type: "file", content: "CODE: KOMET" } } }, "hinweis.txt": { type: "file", content: "Der Code ist tiefer im System." } } } } } }
  },
  {
    id: 3,
    title: "Level 4 - Code Im Log",
    briefing: "Deine Aufgabe: Finde die Zeile mit <code>CODE:</code>.",
    objective: "Nutze <code>grep</code> in <code>log.txt</code>.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "grep", "clear", "unlock", "hint"],
    learningCommands: ["grep"],
    startCwd: "/",
    successWord: "GLUEHWURM",
    points: 140,
    chapterId: "kapitel-2",
    chapterTitle: "Kapitel 2 - Spuren in Logdateien",
    chapterIntro: "Im Schulnetz mehren sich die Zwischenfälle: Ankündigungen springen, Dateien verschwinden kurz und tauchen wieder auf. Frau Weber ordnet Alarmstufe Gelb für das Cyber-Labor an.",
    introText: "Zwischen normalen Logzeilen blinkt plötzlich eine Nachricht auf: 'Findet mich, wenn ihr könnt. - Digitalschatten'.",
    successText: "Codezeile gesichert. Ben flüstert: 'Das war kein Zufall. Jemand beobachtet unsere Schritte.'",
    knowledgeCard: {
      title: "Suchen mit grep",
      text: "grep filtert Zeilen nach einem Suchwort. So findest du in langen Logs schnell wichtige Hinweise.",
      example: "grep CODE: /logs/log.txt"
    },
    unlockRequirements: [
      { type: "flag", key: "grep-term", value: "/logs/log.txt|CODE:" }
    ],
    unlockHint: "Nutze zuerst grep mit CODE: in /logs/log.txt.",
    hints: ["Befehl: grep CODE: log.txt", "Nur eine Zeile enthält CODE:"],
    fs: { "/": { type: "dir", children: { logs: { type: "dir", children: { "log.txt": { type: "file", content: [
      "08:00:01 INFO Startsequenz beginnt",
      "08:00:02 INFO Modul Auth geladen",
      "08:00:04 INFO Modul Benutzeroberfläche geladen",
      "08:00:07 WARN Sensor A12 instabil",
      "08:00:10 INFO Wiederverbindung Versuch 1",
      "08:00:12 INFO Wiederverbindung Versuch 2",
      "08:00:14 INFO Wiederverbindung erfolgreich",
      "08:00:16 INFO Cache-Aufwärmung startet",
      "08:00:18 INFO Cache-Aufwärmung abgeschlossen",
      "08:00:20 WARN Unbekanntes Paket verworfen",
      "08:00:23 INFO Test-Anmeldung erfolgreich",
      "08:00:25 INFO Admin-Anmeldung abgelehnt",
      "08:00:28 INFO Prüfung läuft",
      "08:00:31 INFO Prüfung abgeschlossen",
      "08:00:33 WARN Aufräumen temp-Dateien verzögert",
      "08:00:36 INFO Aufräumen abgeschlossen",
      "08:00:38 INFO Sicherung Block 1 abgeschlossen",
      "08:00:40 INFO Sicherung Block 2 abgeschlossen",
      "08:00:42 INFO Sicherung Block 3 abgeschlossen",
      "08:00:45 CODE: GLUEHWURM",
      "08:00:47 INFO Überwachung aktiviert",
      "08:00:49 INFO Herzschlag ok",
      "08:00:52 INFO Sitzung beendet"
    ].join("\n") } } } } } }
  },
  {
    id: 4,
    title: "Level 5 - Unsichtbare Datei",
    briefing: "Deine Aufgabe: Finde eine versteckte Datei.",
    objective: "Lies die Datei in <code>/serverraum</code>. Nutze zuerst <code>man ls</code>.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "man", "grep", "clear", "unlock", "hint"],
    learningCommands: ["man ls", "ls -a"],
    startCwd: "/serverraum",
    successWord: "NEBELFALKE",
    points: 160,
    chapterId: "kapitel-2",
    chapterTitle: "Kapitel 2 - Spuren in Logdateien",
    introText: "Im Serverraum ist alles auffällig sauber. Ben tippt auf versteckte Dateien als geheimer Ablageort.",
    successText: "Treffer in der versteckten Datei. Darin steht nur: 'Ihr seid nah dran.'",
    knowledgeCard: {
      title: "Versteckte Dateien",
      text: "Dateien mit Punkt am Anfang sind versteckt. Mit ls -a machst du sie sichtbar.",
      example: "ls -a"
    },
    unlockRequirements: [
      { type: "flag", key: "ls-a", value: "/serverraum" },
      { type: "flag", key: "cat", value: "/serverraum/.code.txt" }
    ],
    unlockHint: "Nutze ls -a in /serverraum und lies dann .code.txt.",
    hints: ["Tippe man ls.", "Dann ls -a.", "Versteckte Dateien starten mit ."],
    fs: { "/": { type: "dir", children: { serverraum: { type: "dir", children: { ".code.txt": { type: "file", content: "CODE: NEBELFALKE" }, "sichtbar.txt": { type: "file", content: "Nicht diese Datei." } } } } } }
  },
  {
    id: 5,
    title: "Level 6 - Lange Logs",
    briefing: "Deine Aufgabe: Lies Anfang und Ende eines Logs.",
    objective: "Finde den Code mit <code>head</code> oder <code>tail</code> in <code>server.log</code>.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "grep", "head", "tail", "man", "clear", "unlock", "hint"],
    learningCommands: ["head", "tail"],
    startCwd: "/logs",
    successWord: "FEUERFLUG",
    points: 170,
    chapterId: "kapitel-2",
    chapterTitle: "Kapitel 2 - Spuren in Logdateien",
    introText: "Die Zwischenfälle folgen einem Muster im Zeitverlauf. Wenn ihr es nicht erkennt, geht die nächste Schulankündigung wieder schief.",
    successText: "Muster erkannt. Frau Weber: 'Gut reagiert. Wir waren nur Minuten von der nächsten Panne entfernt.'",
    knowledgeCard: {
      title: "Lange Logdateien lesen",
      text: "head zeigt den Anfang, tail das Ende einer Datei. Das spart Zeit bei sehr langen Protokollen.",
      example: "tail /logs/server.log"
    },
    unlockRule: {
      type: "allOf",
      requirements: [
        {
          type: "anyOf",
          requirements: [
            { type: "flag", key: "head", value: "/logs/server.log" },
            { type: "flag", key: "tail", value: "/logs/server.log" }
          ]
        }
      ]
    },
    unlockHint: "Schau dir erst mit head oder tail die Datei /logs/server.log an.",
    hints: ["Probier tail server.log.", "Der Code steht fast am Ende."],
    fs: { "/": { type: "dir", children: { logs: { type: "dir", children: { "server.log": { type: "file", content: [
      "00:00 INFO Dienststart",
      "00:02 INFO Konfiguration geladen",
      "00:04 INFO Benutzerliste synchronisiert",
      "00:06 WARN Zeitabweichung erkannt",
      "00:08 INFO Zeitsync erfolgreich",
      "00:10 INFO Cache geleert",
      "00:12 INFO Cache neu aufgebaut",
      "00:14 INFO Login prüfen gestartet",
      "00:16 INFO Login prüfen beendet",
      "00:18 WARN Paketverlust kurzzeitig",
      "00:20 INFO Verbindung stabil",
      "00:22 INFO Sicherung Abschnitt 1 fertig",
      "00:24 INFO Sicherung Abschnitt 2 fertig",
      "00:26 INFO Sicherung Abschnitt 3 fertig",
      "00:28 INFO Sicherung Abschnitt 4 fertig",
      "00:30 INFO Sicherheitsscan gestartet",
      "00:32 INFO Sicherheitsscan abgeschlossen",
      "00:34 WARN Ungewöhnlicher Zugriff blockiert",
      "00:36 INFO Monitoring aktiv",
      "00:38 INFO Temperatur normal",
      "00:40 INFO Speicherprüfung gestartet",
      "00:42 INFO Speicherprüfung abgeschlossen",
      "00:44 INFO Protokollrotation vorbereitet",
      "00:46 INFO Protokollrotation aktiv",
      "00:48 INFO Heartbeat ok",
      "00:50 INFO Heartbeat ok",
      "00:52 INFO Heartbeat ok",
      "00:54 INFO Teamstatus grün",
      "00:56 INFO Letzte Prüfung läuft",
      "00:58 CODE: FEUERFLUG",
      "01:00 INFO Letzte Prüfung abgeschlossen",
      "01:02 INFO Dienst bleibt aktiv"
    ].join("\n") } } } } } }
  },
  {
    id: 6,
    title: "Level 7 - Eigene Dateien",
    briefing: "Deine Aufgabe: Erzeuge einen Ordner und eine Datei.",
    objective: "Erstelle <code>mission/notiz.txt</code>. Der Inhalt steht in <code>auftrag.txt</code>.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "grep", "head", "tail", "mkdir", "touch", "clear", "unlock", "hint"],
    learningCommands: ["mkdir", "touch"],
    startCwd: "/workspace",
    successWord: "KUPFERSTERN",
    points: 190,
    chapterId: "kapitel-3",
    chapterTitle: "Kapitel 3 - Der Digitalschatten testet euch",
    chapterIntro: "Der Digitalschatten meldet sich direkt: 'Wer das Labor schützen will, muss unter Druck sauber arbeiten.' Jetzt startet sein Testparcours.",
    introText: "Auf dem Bildschirm erscheint ein Countdown. Erste Challenge: baue in kurzer Zeit eine saubere Struktur.",
    successText: "Challenge bestanden. Sofort ploppt die nächste Nachricht auf: 'Schnell reicht nicht. Jetzt prüfe ich eure Genauigkeit.'",
    knowledgeCard: {
      title: "Struktur aufbauen",
      text: "mkdir erstellt Ordner, touch erstellt Dateien. Gute Struktur macht Systeme übersichtlich.",
      example: "mkdir mission && touch mission/notiz.txt"
    },
    unlockRule: {
      type: "allOf",
      requirements: [
        { type: "dirExists", path: "/workspace/mission" },
        { type: "fileExists", path: "/workspace/mission/notiz.txt" }
      ]
    },
    unlockHint: "Lege zuerst den Ordner mission und darin die Datei notiz.txt an.",
    hints: ["mkdir mission", "cd mission", "touch notiz.txt und dann cat ../auftrag.txt lesen."],
    fs: { "/": { type: "dir", children: { workspace: { type: "dir", children: { "auftrag.txt": { type: "file", content: "CODE: KUPFERSTERN\nBaue zuerst Ordner und Datei." } } } } } }
  },
  {
    id: 7,
    title: "Level 8 - Kopieren Und Verschieben",
    briefing: "Deine Aufgabe: Bringe den Code-Ordner in Ordnung.",
    objective: "Nutze <code>cp</code> und <code>mv</code> mit den Dateien in <code>/lager</code>.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "mkdir", "touch", "cp", "mv", "clear", "unlock", "hint"],
    learningCommands: ["cp", "mv"],
    startCwd: "/lager",
    successWord: "SILBERKREIS",
    points: 210,
    chapterId: "kapitel-3",
    chapterTitle: "Kapitel 3 - Der Digitalschatten testet euch",
    introText: "Dateien, Namen, Pfade - alles bewusst vertauscht. Ein falscher Move und wichtige Hinweise gehen verloren.",
    successText: "Ordnung wiederhergestellt. Ben atmet aus: 'Okay... das war knapp.'",
    knowledgeCard: {
      title: "Dateien kopieren und verschieben",
      text: "cp erstellt eine Kopie, mv verschiebt oder benennt um. Damit organisierst du Inhalte sauber.",
      example: "cp quelle.txt kopie.txt && mv kopie.txt code.txt"
    },
    unlockRequirements: [
      { type: "fileContains", path: "/lager/code.txt", text: "CODE: SILBERKREIS" }
    ],
    unlockHint: "Erzeuge zuerst code.txt mit dem richtigen Inhalt aus quelle.txt.",
    hints: ["cat quelle.txt", "cp quelle.txt kopie.txt", "mv kopie.txt code.txt und dann cat code.txt"],
    fs: { "/": { type: "dir", children: { lager: { type: "dir", children: { "quelle.txt": { type: "file", content: "CODE: SILBERKREIS" } } } } } }
  },
  {
    id: 8,
    title: "Level 9 - Schreiben Und Aufräumen",
    briefing: "Deine Aufgabe: Schreibe Text in eine Datei und räume auf.",
    objective: "Nutze <code>echo ... > code.txt</code>. Entferne danach <code>muell.txt</code> mit Sicherheitsabfrage.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "echo", "rm", "clear", "unlock", "hint"],
    learningCommands: ["echo >", "rm"],
    startCwd: "/desk",
    successWord: "BLAUWOLF",
    points: 230,
    chapterId: "kapitel-3",
    chapterTitle: "Kapitel 3 - Der Digitalschatten testet euch",
    introText: "Der Digitalschatten zwingt euch zur Entscheidung: Was ist wichtig, was darf weg? Ein Fehler löscht Beweise.",
    successText: "Richtige Entscheidung getroffen. Frau Weber: 'Genau so verhindert man echte Sicherheitschaos-Momente.'",
    knowledgeCard: {
      title: "Schreiben und aufräumen",
      text: "echo > schreibt direkt in eine Datei. Mit rm entfernst du unnötige Dateien gezielt.",
      example: "echo CODE: BLAUWOLF > code.txt"
    },
    unlockRequirements: [
      { type: "fileContains", path: "/desk/code.txt", text: "CODE: BLAUWOLF" },
      { type: "fileMissing", path: "/desk/muell.txt" }
    ],
    unlockHint: "Erstelle zuerst code.txt mit echo und entferne danach muell.txt.",
    hints: ["echo CODE: BLAUWOLF > code.txt", "cat code.txt", "rm muell.txt und bestätigen."],
    fs: { "/": { type: "dir", children: { desk: { type: "dir", children: { "muell.txt": { type: "file", content: "Lösch mich." } } } } } }
  },
  {
    id: 9,
    title: "Level 10 - Rechte Verstehen",
    briefing: "Deine Aufgabe: Warum sind Rechte wichtig? Eine Datei ist gesperrt.",
    objective: "Setze Leserechte mit <code>chmod</code> und lies <code>tresor/code.txt</code>.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "chmod", "clear", "unlock", "hint"],
    learningCommands: ["chmod"],
    startCwd: "/tresor",
    successWord: "NORDLICHT",
    points: 250,
    chapterId: "kapitel-3",
    chapterTitle: "Kapitel 3 - Der Digitalschatten testet euch",
    introText: "Letzte Prüfung vor dem Finale: Rechte setzen unter Druck. Zu offen ist unsicher, zu streng blockiert das Team.",
    successText: "Rechte korrekt. Auf dem Terminal erscheint: 'Treffpunkt Finale. Prozessliste lesen.'",
    knowledgeCard: {
      title: "Rechte verstehen",
      text: "chmod steuert, was mit einer Datei erlaubt ist. Rechte schützen Daten vor ungewolltem Zugriff.",
      example: "chmod 644 /tresor/code.txt"
    },
    unlockRequirements: [
      { type: "modeEquals", path: "/tresor/code.txt", mode: "644" },
      { type: "flag", key: "cat", value: "/tresor/code.txt" }
    ],
    unlockHint: "Setze zuerst chmod 644 auf code.txt und lies die Datei danach.",
    hints: ["cat code.txt geht zuerst nicht.", "chmod 644 code.txt", "Dann nochmal cat code.txt."],
    fs: { "/": { type: "dir", children: { tresor: { type: "dir", children: { "code.txt": { type: "file", mode: "000", content: "CODE: NORDLICHT" } } } } } }
  },
  {
    id: 10,
    title: "Level 11 - Systemblick",
    briefing: "Deine Aufgabe: Schau dir laufende Programme an.",
    objective: "Nutze <code>ps</code> und lies den Prozess mit dem Code.",
    allowed: ["help", "story", "pwd", "ls", "cd", "cat", "ps", "clear", "unlock", "hint"],
    learningCommands: ["ps"],
    startCwd: "/",
    successWord: "STERNENWIND",
    points: 280,
    chapterId: "kapitel-4",
    chapterTitle: "Kapitel 4 - Finale: Der Digitalschatten",
    chapterIntro: "Das ganze Labor ist still. Nur ein System läuft noch. Dort liegt die letzte Spur zum Digitalschatten.",
    introText: "Frau Weber sagt leise: 'Das ist der Moment. Finde heraus, wer hinter allem steckt.'",
    successText: "Auflösung: Der Digitalschatten war ein älterer Schüler und früherer Cyber-Club-Leiter. Er wollte testen, ob ihr Verantwortung übernehmt und nicht Chaos auslöst.",
    knowledgeCard: {
      title: "Prozesse beobachten",
      text: "ps zeigt laufende Programme. In der Praxis hilft das bei Fehlersuche und Sicherheitschecks.",
      example: "ps"
    },
    unlockRequirements: [
      { type: "flag", key: "ps" }
    ],
    unlockHint: "Führe zuerst den Befehl ps aus.",
    hints: ["Tippe ps.", "In einer Zeile steht CODE: ..."],
    processes: [
      "PID  NAME           STATUS",
      "101  game-engine    running",
      "133  guardian       running",
      "144  helper-bot     CODE: STERNENWIND"
    ],
    fs: { "/": { type: "dir", children: { "ende.txt": { type: "file", content: "Fast geschafft!" } } } }
  }
];
