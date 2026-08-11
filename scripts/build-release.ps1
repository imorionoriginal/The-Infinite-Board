$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Push-Location $root

try {
    npm.cmd ci
    npm.cmd run tauri build

    $bundleDirectory = Join-Path $root "src-tauri\target\release\bundle\nsis"
    $releaseDirectory = Join-Path $root "release"
    $installer = Get-ChildItem -LiteralPath $bundleDirectory -Filter "*.exe" -File | Sort-Object LastWriteTime -Descending | ForEach-Object { $_ } | Select-Object -Index 0

    if ($null -eq $installer) {
        throw "The Windows installer was not created."
    }

    New-Item -ItemType Directory -Path $releaseDirectory -Force | Out-Null
    Copy-Item -LiteralPath $installer.FullName -Destination (Join-Path $releaseDirectory $installer.Name) -Force
    Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $releaseDirectory $installer.Name)
}
finally {
    Pop-Location
}
