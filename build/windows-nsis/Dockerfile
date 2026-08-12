# escape=`
# Windows container for building NetBird Windows artifacts and NSIS installer.
# Build this image on a Windows host with Windows container mode enabled.
FROM mcr.microsoft.com/windows/servercore:ltsc2022
ENV GOPATH="C:\go-work"

WORKDIR C:\workspace

SHELL ["powershell.exe", "-Command"]

# Install Chocolatey
RUN [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
    Invoke-WebRequest https://community.chocolatey.org/install.ps1 -OutFile C:\install.ps1; `
    powershell -NoLogo -ExecutionPolicy Bypass -File C:\install.ps1

# Enable global confirmation and install packages
RUN choco feature enable -n allowGlobalConfirmation; `
    choco install git 7zip nsis golang nodejs-lts; 
    
# Install corepack and enable pnpm
#ENV PATH="C:\Program Files\nodejs;C:\Users\ContainerAdministrator\AppData\Roaming\npm;C:\go-work\bin;$env:PATH"

RUN npm install -g corepack; `
  corepack enable; `
  corepack prepare pnpm@latest --activate

RUN go install github.com/wailsapp/wails/v3/cmd/wails3@latest; `
    go install github.com/go-task/task/v3/cmd/task@latest; 

# Verify installations, sanity check 
RUN node --version; `
    npm --version; `
    pnpm --version; `
    go version;

COPY build\\windows-nsis\\install-nsis-plugins.ps1 C:\scripts\install-nsis-plugins.ps1
COPY build\\windows-nsis\\build.ps1 C:\scripts\build.ps1
RUN powershell -NoLogo -ExecutionPolicy Bypass -File C:\scripts\install-nsis-plugins.ps1

CMD ["powershell.exe", "-NoLogo"]
