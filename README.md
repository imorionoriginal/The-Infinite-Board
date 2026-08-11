# The Infinite Table

The Infinite Table is a Windows desktop workspace for arranging sticky notes, rich text, images and productivity widgets on an infinite canvas.

The application is built with React, TypeScript, Vite, Tauri 2, Rust, SQLite, Tiptap and tldraw.

## Features

- Infinite canvas with persistent local data
- Sticky notes with drag, layering, colors and rich text editing
- Local image asset storage
- Multiple languages option
- Dark and light themes
- Windows installer

## Contributions
Many thanks to **Fynndo3d** (@fynndo2d on discord) for making app logo!

you can check Fynndo's discord server: [Fyonndo's Chickun Barn](https://discord.com/invite/YzkKtBaDQ4)

and if you found a bug or you want to give a review you can join to my server!
**[Orion's Dev Network](https://discord.gg/eZ76kUfEP)**
and my other works: **[Portfolio](https://imorion.lol)**

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

## SmartScreen

A newly built Windows executable is unsigned by default. Windows SmartScreen can show a warning for unsigned or low-reputation files even when the application is safe. No application setting or GitHub release option can remove that warning reliably. 

## Logo

The application logo is stored in `public/infinite-table-logo.ico` for the interface and `src-tauri/icons/icon.ico` for Windows packaging.

## License

MIT License, all rights are reserved by ImOrion.
