param(
  [string]$TaskName = "Rynki Daily Data Update",
  [string]$RunAt = "07:30"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Python = "python"
$Script = Join-Path $Root "scripts\update_data.py"

$Action = New-ScheduledTaskAction -Execute $Python -Argument "`"$Script`"" -WorkingDirectory $Root
$Trigger = New-ScheduledTaskTrigger -Daily -At $RunAt
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Updates Rynki market data, news, FX and local SQLite cache." -Force

Write-Host "Installed scheduled task: $TaskName at $RunAt"
