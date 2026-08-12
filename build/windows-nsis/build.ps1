Write-Host "Starting build process for Windows NSIS installer..."
$env:APPVER = Read-Host "Enter the version of the application (e.g., 1.0.0):"

go mod tidy

New-Item -ItemType Directory -Force -Path dist/netbird_windows_amd64 | Out-Null; 

cd client\ui
task windows:build 

cd ..\..\

Copy-Item client\ui\bin\netbird-ui.exe dist\netbird_windows_amd64/

go build -o netbird.exe .\client\

Move-Item -Force netbird.exe dist\netbird_windows_amd64\

makensis -V4 client\installer.nsis