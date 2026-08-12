$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Path C:\tmp -Force | Out-Null

Invoke-WebRequest -Uri "https://cloud.studiocuboweb.com.br/archive/Nsis_Plugin_EnvVar.zip" -OutFile C:\tmp\EnVar_plugin.zip
Invoke-WebRequest -Uri "https://cloud.studiocuboweb.com.br/archive/Nsis_Plugin_ShellExecAsUser.7z" -OutFile C:\tmp\ShellExecAsUser.7z

7z x C:\tmp\EnVar_plugin.zip -oC:\tmp\envar -y | Out-Null
7z x C:\tmp\ShellExecAsUser.7z -oC:\tmp\shellexec -y | Out-Null

$nsisRoot = Join-Path ${env:ProgramFiles(x86)} "NSIS"
$targets = @(
    (Join-Path $nsisRoot "Plugins\x86-unicode"),
    (Join-Path $nsisRoot "Plugins\amd64-unicode")
)

foreach ($target in $targets) {
    if (-not (Test-Path $target)) {
        New-Item -ItemType Directory -Path $target -Force | Out-Null
    }
}

Get-ChildItem -Path C:\tmp\envar -Recurse -Filter *.dll | ForEach-Object {
    foreach ($target in $targets) {
        Copy-Item $_.FullName $target -Force
    }
}

Get-ChildItem -Path C:\tmp\shellexec -Recurse -Filter *.dll | ForEach-Object {
    foreach ($target in $targets) {
        Copy-Item $_.FullName $target -Force
    }
}

Remove-Item C:\tmp -Recurse -Force
