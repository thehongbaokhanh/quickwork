[CmdletBinding()]
param(
    [switch]$NoBuild
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$composeFiles = @(
    '-f', (Join-Path $projectRoot 'compose.yaml'),
    '-f', (Join-Path $projectRoot 'compose.override.yaml'),
    '-f', (Join-Path $projectRoot 'compose.tunnel.yaml')
)

Push-Location $projectRoot
try {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        throw 'Khong tim thay Docker. Hay khoi dong Docker Desktop roi chay lai.'
    }

    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot '.env'))) {
        Copy-Item -LiteralPath (Join-Path $projectRoot '.env.local.example') -Destination (Join-Path $projectRoot '.env')
        Write-Host 'Da tao .env tu .env.local.example.' -ForegroundColor Yellow
    }

    # The browser must call the same public origin. Nitro uses the private Docker
    # hostname for requests rendered on the server.
    $previousPublicApi = $env:NUXT_PUBLIC_API_BASE
    $previousInternalApi = $env:NUXT_API_BASE_INTERNAL
    $env:NUXT_PUBLIC_API_BASE = '/api/v1'
    $env:NUXT_API_BASE_INTERNAL = 'http://backend:8080/api/v1'

    try {
        & docker compose @composeFiles config --quiet
        if ($LASTEXITCODE -ne 0) {
            throw 'Docker Compose config khong hop le.'
        }

        $upArguments = @('compose') + $composeFiles + @('up', '-d')
        if (-not $NoBuild) {
            $upArguments += '--build'
        }
        $upArguments += @('frontend', 'nginx')
        & docker @upArguments
        if ($LASTEXITCODE -ne 0) {
            throw 'Khong the khoi dong frontend va Nginx.'
        }

        # Recreate only cloudflared so each run prints one fresh demo URL.
        & docker compose @composeFiles up -d --force-recreate cloudflared
        if ($LASTEXITCODE -ne 0) {
            throw 'Khong the khoi dong Cloudflare Quick Tunnel.'
        }
    }
    finally {
        if ($null -eq $previousPublicApi) {
            Remove-Item Env:NUXT_PUBLIC_API_BASE -ErrorAction SilentlyContinue
        } else {
            $env:NUXT_PUBLIC_API_BASE = $previousPublicApi
        }
        if ($null -eq $previousInternalApi) {
            Remove-Item Env:NUXT_API_BASE_INTERNAL -ErrorAction SilentlyContinue
        } else {
            $env:NUXT_API_BASE_INTERNAL = $previousInternalApi
        }
    }

    $localApi = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost/api/v1/jobs' -TimeoutSec 20
    if ($localApi.StatusCode -ne 200) {
        throw "API local tra HTTP $($localApi.StatusCode)."
    }

    $tunnelUrl = $null
    $deadline = (Get-Date).AddSeconds(60)
    do {
        Start-Sleep -Seconds 2
        $tunnelLogs = (& docker compose @composeFiles logs --no-color cloudflared 2>&1) | Out-String
        $urlMatch = [regex]::Match($tunnelLogs, 'https://[a-z0-9-]+\.trycloudflare\.com')
        if ($urlMatch.Success) {
            $tunnelUrl = $urlMatch.Value
        }
    } until ($tunnelUrl -or (Get-Date) -ge $deadline)

    if (-not $tunnelUrl) {
        & docker compose @composeFiles logs --tail 80 cloudflared
        throw 'Cloudflare chua cap URL sau 60 giay. Kiem tra ket noi outbound toi cong 7844.'
    }

    # Do not query the system resolver before the random hostname propagates:
    # Windows can cache the first NXDOMAIN and report a false failure afterward.
    $tunnelUri = [Uri]$tunnelUrl
    $publicAddresses = @()
    $deadline = (Get-Date).AddSeconds(60)
    do {
        try {
            $publicAddresses = @(
                Resolve-DnsName -Name $tunnelUri.Host -Server 1.1.1.1 -Type A -DnsOnly -ErrorAction Stop |
                    Select-Object -ExpandProperty IPAddress
            )
        } catch {
            Start-Sleep -Seconds 2
        }
    } until ($publicAddresses.Count -gt 0 -or (Get-Date) -ge $deadline)

    if ($publicAddresses.Count -eq 0) {
        throw "Tunnel da tao nhung DNS chua san sang: $tunnelUrl"
    }

    $publicApiReady = $false
    $deadline = (Get-Date).AddSeconds(60)
    do {
        foreach ($publicAddress in $publicAddresses) {
            $resolveValue = '{0}:443:{1}' -f $tunnelUri.Host, $publicAddress
            & curl.exe --resolve $resolveValue --fail --silent --show-error --output NUL "$tunnelUrl/api/v1/jobs"
            if ($LASTEXITCODE -eq 0) {
                $publicApiReady = $true
                break
            }
        }
        if (-not $publicApiReady) {
            Start-Sleep -Seconds 2
        }
    } until ($publicApiReady -or (Get-Date) -ge $deadline)

    if (-not $publicApiReady) {
        throw "Tunnel da tao nhung API cong khai chua san sang: $tunnelUrl/api/v1/jobs"
    }

    Write-Host ''
    Write-Host 'QuickWork dang duoc chia se tai:' -ForegroundColor Green
    Write-Host $tunnelUrl -ForegroundColor Cyan
    Write-Host ''
    Write-Host "API da kiem tra: $tunnelUrl/api/v1/jobs" -ForegroundColor Green
    Write-Host 'URL se thay doi khi chay lai script. Chay scripts/stop-quick-tunnel.ps1 de tat tunnel.' -ForegroundColor Yellow
}
finally {
    Pop-Location
}
