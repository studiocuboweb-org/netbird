# Build NetBird Client NSIS Installer on Windows

This guide builds the Windows NSIS installer for the NetBird client using the repository workflow.

## What this produces

- Installer file in repository root: `netbird-installer.exe`
- Staging folder used by NSIS: `dist/netbird_windows_amd64`

## Prerequisites

1. OS and shell
- Windows 10/11
- PowerShell (run as Administrator for the install/test phase)

2. Core toolchain
- Git
- Go 1.25+
- Node.js 20+
- pnpm via Corepack
- Wails v3 CLI (`wails3`)
- Task runner (`task`)

3. NSIS compiler
- Install NSIS from https://nsis.sourceforge.io/Download
- Ensure `makensis` is available in `PATH`

4. NSIS plugins required by this repository installer flow
- EnVar: https://nsis.sourceforge.io/mediawiki/images/7/7f/EnVar_plugin.zip
- ShellExecAsUser: https://nsis.sourceforge.io/mediawiki/images/6/68/ShellExecAsUser_amd64-Unicode.7z
- Extract and copy plugin files into your NSIS Plugins directory (keep Unicode plugin files in the Unicode plugin path)

5. Optional runtime DLL for real install tests
- Wintun: https://www.wintun.net/builds/wintun-0.14.1.zip
- If needed for local test runs, copy `wintun.dll` to the installed app directory or `C:\Windows\System32`

## Step-by-step

1. Open PowerShell and go to the repository root

```powershell
git clone https://github.com/netbirdio/netbird.git
cd netbird
```

2. Install Go modules and frontend/build tooling

```powershell
go mod tidy
corepack enable
corepack prepare pnpm@latest --activate
go install github.com/wailsapp/wails/v3/cmd/wails3@latest
go install github.com/go-task/task/v3/cmd/task@latest
```

3. Ensure Go bin is in PATH for the current shell session

```powershell
$env:PATH += ";$(go env GOPATH)\\bin"
```

4. Prepare installer staging directory

```powershell
New-Item -ItemType Directory -Force -Path dist/netbird_windows_amd64 | Out-Null
```

5. Build the UI executable and place it in the staging directory

```powershell
cd client/ui
task windows:build
cd ../..
Copy-Item client/ui/bin/netbird-ui.exe dist/netbird_windows_amd64/
```

6. Build the NetBird client daemon executable and place it in staging

```powershell
go build -o netbird.exe ./client/
Move-Item -Force netbird.exe dist/netbird_windows_amd64/
```

7. Set installer version and run NSIS

Important: NSIS `VIProductVersion` expects a 4-part numeric version.

```powershell
$env:APPVER = "0.0.0.1"
makensis -V4 client/installer.nsis
```

8. Verify output

```powershell
Get-Item .\netbird-installer.exe
```

## Common issues

- `task` not found: ensure `$(go env GOPATH)\\bin` is in `PATH`.
- `wails3` not found: install with `go install .../wails3@latest` and update `PATH`.
- `makensis` not found: reinstall NSIS and enable PATH integration.
- NSIS plugin errors (`EnVar` or `ShellExecAsUser`): re-check plugin files are copied into the NSIS Plugins directory.
- Missing UI binary in staging: re-run `task windows:build` from `client/ui`.

## Build using Docker (Windows containers)

Important:

- You must run these commands on a Windows host.
- Docker Desktop must be switched to **Windows containers** mode.

1. Build the Windows NSIS builder image

```powershell
docker build -t netbird-windows-nsis -f build/windows-nsis/Dockerfile .
```

2. Build the installer from the repository mounted into the container

```powershell
docker run --rm -it `
	-v ${PWD}:C:\workspace `
	-w C:\workspace `
	netbird-windows-nsis `
	powershell -NoProfile -ExecutionPolicy Bypass -Command "
		go mod tidy; \
		New-Item -ItemType Directory -Force -Path dist/netbird_windows_amd64 | Out-Null; \
		cd client/ui; task windows:build; cd ../..; \
		Copy-Item client/ui/bin/netbird-ui.exe dist/netbird_windows_amd64/; \
		go build -o netbird.exe ./client/; \
		Move-Item -Force netbird.exe dist/netbird_windows_amd64/; \
		`$env:APPVER = '0.0.0.1'; \
		makensis -V4 client/installer.nsis
	"
```

3. Verify output on the host

```powershell
Get-Item .\netbird-installer.exe
```
