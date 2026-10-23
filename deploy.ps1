# ==========================================
# APP Deploy & Backup Script
# Usage: .\deploy.bat "commit message"
# ==========================================
param (
    [Parameter(Mandatory=$false)]
    [string]$Message = "Update APP files"
)

$ErrorActionPreference = "Stop"

$RepoPath = "D:\weber\APP"

# Find Google Drive APP directory safely without encoding issues
$GdriveApp = $null
if (Test-Path "G:\") {
    $driveDirs = Get-ChildItem -Path "G:\" -Directory -ErrorAction SilentlyContinue
    foreach ($dir in $driveDirs) {
        $candidate = Join-Path $dir.FullName "APP"
        if (Test-Path $candidate) {
            $GdriveApp = $candidate
            break
        }
    }
}

$GdriveBackup = if ($GdriveApp) { Join-Path $GdriveApp "LifeSchedule_Backups" } else { $null }
$LifeScheduleFile = "LifeSchedule\LifeSchedule.html"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting APP deploy and backup process..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Backup to Google Drive
if ($GdriveApp -and (Test-Path $GdriveApp)) {
    try {
        if (!(Test-Path $GdriveBackup)) {
            New-Item -ItemType Directory -Path $GdriveBackup -Force | Out-Null
        }
        $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $BackupFileName = "LifeSchedule-$Timestamp.html"
        $BackupDest = Join-Path $GdriveBackup $BackupFileName
        $CurrentDest = Join-Path $GdriveApp $LifeScheduleFile

        if (Test-Path (Join-Path $RepoPath $LifeScheduleFile)) {
            Copy-Item -Path (Join-Path $RepoPath $LifeScheduleFile) -Destination $BackupDest -Force
            Copy-Item -Path (Join-Path $RepoPath $LifeScheduleFile) -Destination $CurrentDest -Force
            Write-Host "[1/3] Backup to Google Drive succeeded:" -ForegroundColor Green
            Write-Host "      - History file: $BackupFileName" -ForegroundColor Gray
            Write-Host "      - Current sync: $CurrentDest" -ForegroundColor Gray
        } else {
            Write-Host "[1/3] Warning: $LifeScheduleFile not found, skipped backup." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[1/3] Warning: Google Drive backup error: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "[1/3] Warning: Cannot find Google Drive APP directory. Skipped drive backup." -ForegroundColor Yellow
}

# 2. Git Commit & Push
Write-Host "`n[2/3] Committing and pushing to GitHub (main branch)..." -ForegroundColor Cyan
Set-Location $RepoPath

& "C:\Program Files\Git\cmd\git.exe" config core.protectNTFS false
& "C:\Program Files\Git\cmd\git.exe" add LifeSchedule\
& "C:\Program Files\Git\cmd\git.exe" add deploy.bat
& "C:\Program Files\Git\cmd\git.exe" add deploy.ps1

$status = & "C:\Program Files\Git\cmd\git.exe" status --porcelain
if ($status) {
    & "C:\Program Files\Git\cmd\git.exe" commit -m "$Message"
    & "C:\Program Files\Git\cmd\git.exe" push origin main
    Write-Host "[2/3] Git push completed successfully!" -ForegroundColor Green
} else {
    Write-Host "[2/3] No changes detected to commit." -ForegroundColor DarkGray
}

# 3. Cloudflare notice
Write-Host "`n[3/3] Cloudflare Pages is auto-deploying..." -ForegroundColor Cyan
Write-Host "Check live site in ~10-15 seconds:" -ForegroundColor White
Write-Host "URL: https://app.weberbuy.workers.dev/LifeSchedule/LifeSchedule.html" -ForegroundColor Yellow
Write-Host "`nDeploy workflow finished!" -ForegroundColor Green
