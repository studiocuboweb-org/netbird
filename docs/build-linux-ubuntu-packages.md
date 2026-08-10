# Build NetBird UI Linux Packages on Ubuntu

This guide builds Linux packages for the NetBird desktop UI from Ubuntu using the repository task workflow.

## What this produces

Running the package task creates these artifacts in `client/ui/bin`:

- `netbird-ui` (Linux binary)
- AppImage
- `.deb`
- `.rpm`
- Arch package

## Prerequisites

1. OS
- Ubuntu 22.04+ recommended

2. Core build tools
- Git
- Go 1.25+
- Node.js 20+
- pnpm via Corepack
- Wails v3 CLI (`wails3`)
- Task runner (`task`)

3. Linux UI native dependencies
- `libwebkitgtk-6.0-dev`
- `libgtk-4-dev`
- `libsoup-3.0-dev`
- `build-essential`
- `pkg-config`

4. Optional Docker fallback
- Docker is optional, but useful if no C compiler is available or for cross-architecture Linux builds

## Step-by-step

1. Clone and enter repository

```bash
git clone https://github.com/netbirdio/netbird.git
cd netbird
```

2. Install Ubuntu dependencies

```bash
sudo apt update
sudo apt install -y build-essential pkg-config libwebkitgtk-6.0-dev libgtk-4-dev libsoup-3.0-dev
```

3. Install frontend/build tools

```bash
go mod tidy
corepack enable
corepack prepare pnpm@latest --activate
go install github.com/wailsapp/wails/v3/cmd/wails3@latest
go install github.com/go-task/task/v3/cmd/task@latest
export PATH="$(go env GOPATH)/bin:$PATH"
```

4. Go to UI project directory

```bash
cd client/ui
```

5. Build Linux binary

```bash
task linux:build
```

6. Build all Linux packages

```bash
task linux:package
```

7. Verify artifacts

```bash
ls -lah bin/
```

## Package-specific commands (optional)

If you only want one format:

```bash
task linux:create:deb
task linux:create:rpm
task linux:create:appimage
task linux:create:aur
```

## Docker fallback build (optional)

Use this when native Linux build requirements are not available:

```bash
wails3 task setup:docker
task linux:build
task linux:package
```

## Common issues

- `pnpm` not found: run Corepack commands again.
- `wails3` or `task` not found: ensure `$(go env GOPATH)/bin` is in `PATH`.
- Missing WebKit/GTK headers: re-run apt install for the Linux UI dependencies.
- Docker image `wails-cross` missing: run `wails3 task setup:docker`.

## Build using Docker (Ubuntu image)

1. Build the Ubuntu packages builder image

```bash
docker build -t netbird-ubuntu-packager -f build/ubuntu-packages/Dockerfile .
```

2. Run package build inside the container

```bash
docker run --rm -it \
	-v "$PWD":/workspace \
	-w /workspace \
	netbird-ubuntu-packager \
	bash -lc 'go mod tidy && cd client/ui && task linux:build && task linux:package'
```

3. Verify artifacts on the host

```bash
ls -lah client/ui/bin/
```
