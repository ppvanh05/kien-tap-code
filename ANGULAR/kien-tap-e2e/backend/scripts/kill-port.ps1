param([int]$port = 3000)
Write-Output "Freeing port $port if occupied..."

try {
    $lines = netstat -ano -p tcp | Select-String ":$port\b"
} catch {
    Write-Output "netstat failed: $_"
    exit 0
}

if (-not $lines) {
    Write-Output "No process is listening on port $port."
    exit 0
}

foreach ($line in $lines) {
    $text = $line.ToString() -replace '\s{2,}', ' '
    $parts = $text.Trim() -split ' '
    $killPid = $parts[-1]
    if ($killPid -match '^[0-9]+$') {
        Write-Output "Killing PID $killPid (port $port)"
        try {
            taskkill /PID $killPid /F | Out-Null
            Write-Output "PID $killPid terminated."
        } catch {
            Write-Output ("Failed to kill PID {0}: {1}" -f $killPid, $_)
        }
    }
}

exit 0
