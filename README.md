# Guitar Modes Explorer + Chord Explorer + Bass Modes Explorer

A static website (no build step, no internet needed). Works on desktop, phones and iPads.

## Run it

| OS | Command |
|----|---------|
| Windows | double-click `start.bat` (needs [Python 3](https://www.python.org/downloads/), tick "Add to PATH") |
| macOS / Linux / WSL | `./start.sh` |
| Any | `python3 serve.py [--port 9000] [--local]` |

The banner prints two addresses: `localhost` for this PC, and the **Phone / iPad** address to type into
the phone's browser. The phone must be on the same Wi-Fi.

## Deploy to another PC

Copy the folder (everything except `project/`, if present) to the other PC and run the command above.
Fonts and instrument samples are bundled in `fonts/` and `soundfonts/`, so nothing is downloaded at runtime.
Any static host also works (nginx, GitHub Pages, `npx serve`, ...): just serve the folder.

## Phone can't connect?

1. **Windows Firewall.** Windows blocks incoming connections on "Public" Wi-Fi by default.
   In **PowerShell**, run once from this folder:
   `powershell -ExecutionPolicy Bypass -File .\share-to-phone.ps1`
   It opens the port for devices on your local network only, and asks for Administrator.
2. **Server running inside WSL2?** WSL has its own private network, so also add `-Wsl`:
   `powershell -ExecutionPolicy Bypass -File .\share-to-phone.ps1 -Wsl`
   Re-run it after rebooting (WSL's address changes). From WSL you can run:
   `powershell.exe -ExecutionPolicy Bypass -File "$(wslpath -w share-to-phone.ps1)" -Wsl`
3. Undo any time with `-Remove` (plus `-Wsl` if you used it).
4. Some routers have "AP/client isolation" (common on guest Wi-Fi) which blocks phone-to-PC traffic.
   Use the main network.

## Notes

- `serve.py` only serves the site's own file types and never dotfiles, scripts, or `project/`.
- iPhone: sound is muted if the ring/silent switch is on silent.
- The theme and instrument choices are remembered per browser.
- `bass.html` is the Modes explorer for bass: pick a 4-string (E A D G) or 5-string (B E A D G) neck. It shares `script.js` with `index.html` (switched by `<body data-page="bass">`) and has its own bass instruments.
