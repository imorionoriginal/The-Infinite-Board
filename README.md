# The Infinite Table

The Infinite Table is a Windows desktop workspace for arranging sticky notes, rich text, images and productivity widgets on an infinite canvas.

The application is built with React, TypeScript, Vite, Tauri 2, Rust, SQLite, Tiptap and tldraw.

## Features

- Infinite canvas with persistent local data
- Sticky notes with drag, layering, colors and rich text editing
- Local image asset storage
- Pomodoro timer, stopwatch and exam countdown widgets
- Dark and light themes
- Windows installer with the project logo

## Requirements

- Windows 10 or Windows 11
- Node.js 20 or newer
- Rust stable toolchain
- Microsoft Edge WebView2 Runtime

## Development

```powershell
npm ci
npm run tauri dev
```

The web-only development server can be started with `npm run dev`.

## Windows Build

Create a production Windows build and copy the NSIS installer into `release/`:

```powershell
npm run build:windows
```

The direct application executable is generated at `src-tauri/target/release/the-infinite-table.exe`. The distributable installer is generated in `release/`.

## GitHub Releases

Push a version tag to build and publish the Windows NSIS `.exe` and `.msi` files automatically:

```powershell
```

The workflow in `.github/workflows/release.yml` creates the GitHub release and uploads the generated Windows bundles.

## SmartScreen

A newly built Windows executable is unsigned by default. Windows SmartScreen can show a warning for unsigned or low-reputation files even when the application is safe. No application setting or GitHub release option can remove that warning reliably.

Warning-free distribution requires an Authenticode code-signing certificate, secure private-key handling and timestamped signing of the executable and installer. The certificate must be supplied by the publisher and configured in the release pipeline; private keys must never be committed to this repository.

## Logo

The application logo is stored in `public/infinite-table-logo.ico` for the interface and `src-tauri/icons/icon.ico` for Windows packaging.

## License

No license has been selected yet. Until a license is added, all rights are reserved by the copyright holder.
