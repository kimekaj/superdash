<#
  One-time Windows setup so phones/tablets on your Wi-Fi can open the site.

  Native Windows (server runs on Windows):   .\share-to-phone.ps1
  Server runs inside WSL2 (Ubuntu etc.):     .\share-to-phone.ps1 -Wsl
  Undo everything:                           .\share-to-phone.ps1 -Remove   (add -Wsl if you used it)

  It (1) opens the port in Windows Firewall for devices on your local network ONLY, and
  (2) with -Wsl, forwards Windows:PORT -> WSL:PORT (WSL2's address changes on reboot, so
  re-run with -Wsl after restarting Windows/WSL). Needs Administrator; it asks for it.
#>
param([int]$Port = 8080, [switch]$Wsl, [switch]$Remove)
$ErrorActionPreference = 'Stop'
$rule = "Guitar Modes site ($Port)"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  $a = @('-NoProfile','-ExecutionPolicy','Bypass','-NoExit','-File',"`"$PSCommandPath`"",'-Port',$Port)
  if ($Wsl) { $a += '-Wsl' }; if ($Remove) { $a += '-Remove' }
  Start-Process powershell -Verb RunAs -ArgumentList $a
  exit
}

Get-NetFirewallRule -DisplayName $rule -ErrorAction SilentlyContinue | Remove-NetFirewallRule
if ($Wsl) { netsh interface portproxy delete v4tov4 listenport=$Port listenaddress=0.0.0.0 2>$null | Out-Null }
if ($Remove) { Write-Host "Removed firewall rule '$rule'$(if ($Wsl) { ' and the WSL port forward' })." -ForegroundColor Green; return }

# LocalSubnet = only devices on your own Wi-Fi/LAN, not the wider internet. Profile Any because
# home Wi-Fi is often classed "Public" by Windows.
New-NetFirewallRule -DisplayName $rule -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port `
  -Profile Any -RemoteAddress LocalSubnet | Out-Null

if ($Wsl) {
  $wslIp = ((wsl.exe hostname -I) -join ' ').Trim().Split(' ')[0]
  if ($wslIp -notmatch '^\d+\.\d+\.\d+\.\d+$') { throw "Could not read the WSL IP (got '$wslIp'). Is WSL running?" }
  netsh interface portproxy add v4tov4 listenport=$Port listenaddress=0.0.0.0 connectport=$Port connectaddress=$wslIp | Out-Null
  Write-Host "Forwarding Windows port $Port -> WSL $wslIp`:$Port"
}

$ip = (Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway } | Select-Object -First 1).IPv4Address.IPAddress
Write-Host "`nDone. Start the server (start.sh / start.bat), then on your phone (same Wi-Fi) open:`n" -ForegroundColor Green
Write-Host "    http://$ip`:$Port`n" -ForegroundColor Cyan
