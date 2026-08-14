Write-Host "Regenerating protobuf Go files"

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location C:\workspace

function Ensure-Protoc {
  $protocCmd = Get-Command protoc -ErrorAction SilentlyContinue
  if ($null -ne $protocCmd) {
    return
  }

  Write-Host "protoc not found. Installing protoc with Chocolatey..."

  if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    throw "protoc is missing and Chocolatey is unavailable in this environment"
  }

  choco install protoc -y --no-progress

  $candidatePaths = @(
    "$env:ChocolateyInstall\\lib\\protoc\\tools\\bin",
    "C:\\ProgramData\\chocolatey\\lib\\protoc\\tools\\bin",
    "C:\\ProgramData\\chocolatey\\bin"
  )

  foreach ($pathEntry in $candidatePaths) {
    if ((Test-Path $pathEntry) -and -not (($env:PATH -split ";") -contains $pathEntry)) {
      $env:PATH = "$env:PATH;$pathEntry"
    }
  }

  if (-not (Get-Command protoc -ErrorAction SilentlyContinue)) {
    throw "protoc is still unavailable after installation"
  }
}

Ensure-Protoc

# Ensure protoc can resolve installed generator plugins.
$goBin = Join-Path $env:GOPATH "bin"
if (-not (($env:PATH -split ";") -contains $goBin)) {
    $env:PATH = "$env:PATH;$goBin"
}

# Match versions used by client/proto/generate.sh.
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.6
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.6.1
go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@v2.26.3

Push-Location client\proto
protoc -I ./ ./daemon.proto `
  --go_out=../ `
  --go-grpc_out=../ `
  --grpc-gateway_out=../ `
  --grpc-gateway_opt=generate_unbound_methods=true `
  --experimental_allow_proto3_optional
Pop-Location

# Match versions used by shared/management/proto/generate.sh and
# shared/signal/proto/generate.sh.
go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.1

Push-Location shared\management\proto
protoc -I ./ ./management.proto --go_out=../ --go-grpc_out=../
protoc -I ./ ./proxy_service.proto --go_out=../ --go-grpc_out=../
Pop-Location

Push-Location shared\signal\proto
protoc -I ./ ./signalexchange.proto --go_out=../ --go-grpc_out=../
Pop-Location

Write-Host "Proto generation completed."
