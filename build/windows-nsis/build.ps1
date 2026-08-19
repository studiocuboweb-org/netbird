param(
	[switch]$GenerateProto,
	[string]$AppVer
)

Write-Host "Starting build process for Windows NSIS installer..."

if (-not [string]::IsNullOrWhiteSpace($AppVer)) {
	$env:APPVER = $AppVer
}

if([string]::IsNullOrWhiteSpace($env:APPVER)) {
    $env:APPVER = Read-Host "Enter the version of the application (e.g., 1.0.0.0):"
}

if ($GenerateProto) {
	Write-Host "Regenerating protobuf files before build..."
	$protoScript = Join-Path $PSScriptRoot "generate-proto.ps1"
	if (-not (Test-Path $protoScript)) {
		throw "Proto generation script not found at $protoScript"
	}
	powershell.exe -NoLogo -ExecutionPolicy Bypass -File $protoScript
}

# Docker build contexts may not have a healthy Git metadata state.
# Disable VCS stamping for reproducible, non-interactive container builds.
$existingGoFlags = "$env:GOFLAGS".Trim()
if ([string]::IsNullOrWhiteSpace($existingGoFlags)) {
	$env:GOFLAGS = "-buildvcs=false"
} elseif ($existingGoFlags -notmatch "(^|\s)-buildvcs=false(\s|$)") {
	$env:GOFLAGS = "$existingGoFlags -buildvcs=false"
}

# Ensure Go modules are tidy
go mod tidy

# Build the UI for Windows
Set-Location client\ui
task windows:build 

# Build the Go client for Windows
Set-Location C:\workspace
go build -o netbird.exe .\client\

# Build the NSIS installer
New-Item -ItemType Directory -Force -Path dist/netbird_windows_amd64 | Out-Null; 
Copy-Item client\ui\bin\netbird-ui.exe dist\netbird_windows_amd64/
Move-Item -Force netbird.exe dist\netbird_windows_amd64\

$makeNsisCommand = Get-Command makensis -ErrorAction SilentlyContinue
$makeNsisPath = $null

if ($makeNsisCommand) {
	$makeNsisPath = $makeNsisCommand.Source
} else {
	$candidatePaths = @(
		"C:\ProgramData\chocolatey\bin\makensis.exe",
		"C:\Program Files (x86)\NSIS\makensis.exe",
		"C:\Program Files\NSIS\makensis.exe"
	)

	foreach ($candidate in $candidatePaths) {
		if (Test-Path $candidate) {
			$makeNsisPath = $candidate
			break
		}
	}
}

if (-not $makeNsisPath) {
	throw "makensis.exe was not found. Install NSIS and ensure makensis is on PATH, or available in a standard install location."
}
 
Write-Host "Using NSIS compiler at: $makeNsisPath"
& $makeNsisPath -V4 client\installer.nsis

Move-Item  -Path "C:\workspace\netbird-installer.exe" -Destination dist/netbird_windows_amd64 -Force