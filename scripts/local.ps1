$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$frontendPath = (Get-Location).Path
$backendPath = Join-Path $frontendPath 'SIBPR Bckend'
if (-not (Test-Path -LiteralPath (Join-Path $backendPath '.env'))) {
  $legacyBackendPath = Join-Path (Split-Path $frontendPath -Parent) 'SIBPR Bckend'
  if (Test-Path -LiteralPath (Join-Path $legacyBackendPath '.env')) { $backendPath = $legacyBackendPath }
}

function Test-LocalUrl([string]$Url) {
  try { return (Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3).StatusCode -eq 200 }
  catch { return $false }
}

function Wait-LocalUrl([string]$Url, [string]$Name) {
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    if (Test-LocalUrl $Url) { return }
    Start-Sleep -Seconds 2
  }
  throw "$Name did not start. Check .tools/local for the log files."
}

if (-not (Test-Path -LiteralPath $backendPath)) { throw "Missing backend folder: $backendPath" }
if (-not (Test-Path -LiteralPath (Join-Path $backendPath '.env'))) { throw 'Missing backend .env. Copy the backend .env.example to .env and set your local credentials.' }
if (-not (Test-Path -LiteralPath 'node_modules')) { throw 'Dependencies are missing. Run npm ci first.' }
if (-not (Test-Path -LiteralPath (Join-Path $backendPath 'node_modules'))) { throw 'Backend dependencies are missing. Run npm ci in SIBPR Bckend first.' }
New-Item -ItemType Directory -Path '.tools/local' -Force | Out-Null

docker info --format '{{.ServerVersion}}' *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Starting Docker Desktop...'
  docker desktop start | Out-Null
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    docker info --format '{{.ServerVersion}}' *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 2
  }
  if ($LASTEXITCODE -ne 0) { throw 'Docker Desktop did not become ready.' }
}

Write-Host 'Starting MongoDB...'
docker compose -f (Join-Path $backendPath 'compose.local.yaml') --project-directory $backendPath up -d | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'MongoDB could not start.' }

if (-not (Test-LocalUrl 'http://127.0.0.1:3001/api/health')) {
  Write-Host 'Starting SIBPR API...'
  & npm.cmd --prefix $backendPath run build
  if ($LASTEXITCODE -ne 0) { throw 'API build failed.' }
  Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList '--env-file=.env','dist-api/index.js' -WorkingDirectory $backendPath -WindowStyle Hidden -RedirectStandardOutput (Join-Path $backendPath 'api.log') -RedirectStandardError (Join-Path $backendPath 'api-error.log') | Out-Null
  Wait-LocalUrl 'http://127.0.0.1:3001/api/health' 'SIBPR API'
}

if (-not (Test-LocalUrl 'http://localhost:5173/start')) {
  Write-Host 'Starting SIBPR website...'
  Start-Process -FilePath 'C:\Program Files\nodejs\npm.cmd' -ArgumentList 'run','dev','--','--host','127.0.0.1','--port','5173','--strictPort' -WorkingDirectory (Get-Location).Path -WindowStyle Hidden -RedirectStandardOutput '.tools/local/web.log' -RedirectStandardError '.tools/local/web-error.log' | Out-Null
  Wait-LocalUrl 'http://localhost:5173/start' 'SIBPR website'
}

Write-Host ''
Write-Host 'SIBPR localhost is ready:' -ForegroundColor Green
Write-Host '  http://localhost:5173/start' -ForegroundColor Cyan
Write-Host '  Website:    http://localhost:5173/'
Write-Host '  Management: http://localhost:5173/management'
Start-Process 'http://localhost:5173/start'
