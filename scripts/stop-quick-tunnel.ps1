[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$composeFiles = @(
    '-f', (Join-Path $projectRoot 'compose.yaml'),
    '-f', (Join-Path $projectRoot 'compose.override.yaml'),
    '-f', (Join-Path $projectRoot 'compose.tunnel.yaml')
)

Push-Location $projectRoot
try {
    & docker compose @composeFiles stop cloudflared
    if ($LASTEXITCODE -ne 0) {
        throw 'Khong the dung container cloudflared.'
    }
    Write-Host 'Da dung Cloudflare Quick Tunnel. Cac service QuickWork local van tiep tuc chay.' -ForegroundColor Green
}
finally {
    Pop-Location
}
