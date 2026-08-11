# escape=`
# Windows container for building NetBird Windows artifacts and NSIS installer.
# Build this image on a Windows host with Windows container mode enabled.
FROM mcr.microsoft.com/windows/servercore:ltsc2025

SHELL ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command"]

ARG GO_VERSION=1.25.1
ARG NSIS_PLUGIN_ENVAR_URL=https://nsis.sourceforge.io/mediawiki/images/7/7f/EnVar_plugin.zip
ARG NSIS_PLUGIN_SHELLEXEC_URL=https://nsis.sourceforge.io/mediawiki/images/6/68/ShellExecAsUser_amd64-Unicode.7z

ENV GOPATH="C:\go-work"
ENV PATH="C:\go\bin;C:\go-work\bin;C:\Program Files\nodejs;C:\ProgramData\chocolatey\bin;%PATH%"

WORKDIR C:\workspace

RUN Set-ExecutionPolicy Bypass -Scope Process -Force; `
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; `
  iex ((New-Object Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1')); `
  choco feature enable -n allowGlobalConfirmation; `
  choco install git 7zip nsis golang --version=$env:GO_VERSION nodejs-lts; `
  corepack enable; `
  corepack prepare pnpm@latest --activate

RUN go install github.com/wailsapp/wails/v3/cmd/wails3@latest; `
  go install github.com/go-task/task/v3/cmd/task@latest; `
  go version; `
  node --version; `
  pnpm --version; `
  wails3 version; `
  task --version; `
  makensis /VERSION

RUN New-Item -ItemType Directory -Path C:\tmp -Force | Out-Null; `
    Invoke-WebRequest -Uri $env:NSIS_PLUGIN_ENVAR_URL -OutFile C:\tmp\EnVar_plugin.zip; `
    Invoke-WebRequest -Uri $env:NSIS_PLUGIN_SHELLEXEC_URL -OutFile C:\tmp\ShellExecAsUser.7z; `
    7z x C:\tmp\EnVar_plugin.zip -oC:\tmp\envar -y | Out-Null; `
    7z x C:\tmp\ShellExecAsUser.7z -oC:\tmp\shellexec -y | Out-Null; `
    $nsisRoot = "$env:ProgramFiles(x86)\\NSIS"; `
    $targets = @("$nsisRoot\\Plugins\\x86-unicode", "$nsisRoot\\Plugins\\amd64-unicode"); `
    foreach ($target in $targets) { `
      if (!(Test-Path $target)) { `
        New-Item -ItemType Directory -Path $target -Force | Out-Null; `
      } `
    }; `
    Get-ChildItem -Path C:\tmp\envar -Recurse -Filter *.dll | ForEach-Object { `
      foreach ($target in $targets) { `
        Copy-Item $_.FullName $target -Force; `
      } `
    }; `
    Get-ChildItem -Path C:\tmp\shellexec -Recurse -Filter *.dll | ForEach-Object { `
      foreach ($target in $targets) { `
        Copy-Item $_.FullName $target -Force; `
      } `
    }; `
    Remove-Item C:\tmp -Recurse -Force

CMD ["powershell", "-NoLogo"]
