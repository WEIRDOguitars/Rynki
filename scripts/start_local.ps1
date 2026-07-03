param(
  [int]$Port = 8765
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Python = "python"

Set-Location $Root

Write-Host "Updating market data..."
& $Python scripts/update_data.py

Write-Host "Starting local app at http://127.0.0.1:$Port/index.html"
& $Python -m http.server $Port --bind 127.0.0.1
