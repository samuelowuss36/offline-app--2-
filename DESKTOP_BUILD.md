# Building the Desktop App (.exe)

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Development

Run the Electron app in development mode:
```bash
npm run electron-dev
```

This will:
- Start the Next.js dev server on http://localhost:3000
- Launch the Electron app that connects to it

## Building the Executable

### Build the .exe installer:
```bash
npm run electron-build
```

This will create:
- An NSIS installer in `dist/` folder
- A portable .exe file

### Build only the portable executable:
```bash
npm run electron-dist
```

## Output Files

After building, you'll find:
- `dist/Mother Care & Kids POS Setup 1.0.0.exe` - Installer version
- `dist/Mother Care & Kids POS-1.0.0.exe` - Portable version

## Running the App

Users can:
1. Run the installer and install the app
2. Or directly run the portable .exe file without installation

## Data Storage

All app data is stored in:
- Windows: `C:\Users\[YourUsername]\.possystem111\`
- This allows offline operation and data persistence

## Troubleshooting

If you encounter issues:
1. Delete node_modules and reinstall: `rm -r node_modules && npm install`
2. Clear Next.js cache: `rm -r .next`
3. Make sure port 3000 is available for dev mode
