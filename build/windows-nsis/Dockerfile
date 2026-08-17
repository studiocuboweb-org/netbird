# escape=`
# Windows container for building NetBird Windows artifacts and NSIS installer.
# Build this image on a Windows host with Windows container mode enabled.
FROM mcr.microsoft.com/windows/servercore:ltsc2022
ENV GOPATH="C:\go-work"

WORKDIR C:\workspace

SHELL ["powershell.exe", "-Command"]
USER ContainerAdministrator

# Install Chocolatey
RUN [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; `
    Invoke-WebRequest https://community.chocolatey.org/install.ps1 -OutFile C:\install.ps1; `
    powershell -NoLogo -ExecutionPolicy Bypass -File C:\install.ps1

# Enable global confirmation and install packages
RUN choco feature enable -n allowGlobalConfirmation; `
    choco install git 7zip nsis golang nodejs-lts protoc; 
    
# Install corepack and enable pnpm
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
COPY build\\windows-nsis\\generate-proto.ps1 C:\scripts\generate-proto.ps1

# -
RUN powershell -NoLogo -ExecutionPolicy Bypass -File C:\scripts\install-nsis-plugins.ps1

# Env variable with the extra bits for the path
ENV ADD_PATH=";C:\go-work\bin"

# Change the path value directly in the registry key by appending the contents to the env variable to the contents of the path
RUN Set-ItemProperty -Path 'Registry::HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\Environment' -Name PATH -Value ((Get-ItemProperty -Path 'Registry::HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\Environment' -Name PATH).path + "$Env:ADD_PATH")

# Verify the path is correct
RUN (Get-ItemProperty -Path 'Registry::HKEY_LOCAL_MACHINE\System\CurrentControlSet\Control\Session Manager\Environment' -Name PATH).path

COPY .\ C:\workspace\

CMD ["powershell.exe", "-NoLogo"]
