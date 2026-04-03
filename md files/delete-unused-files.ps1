# Delete all unused pages and components from UniConnect frontend

$basePath = "c:\Users\kavit\Downloads\UniConnect-main (2)\UniConnect-main"
$filesToDelete = @(
    # Old App file
    "$basePath\frontend\src\App.js",
    
    # Old pages
    "$basePath\frontend\src\pages\profile_page",
    "$basePath\frontend\src\pages\RequestInvitationManager.jsx",
    
    # Old components and folders
    "$basePath\frontend\src\components\profile_page_components",
    "$basePath\frontend\src\components\sidebar_components",
    "$basePath\frontend\src\components\Header.jsx",
    "$basePath\frontend\src\components\ThemeToggle.jsx"
)

Write-Host "[CLEANUP] Starting cleanup of unused files..." -ForegroundColor Cyan
Write-Host ""

$deletedCount = 0
foreach ($path in $filesToDelete) {
    if (Test-Path $path) {
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "[OK] Deleted: $path" -ForegroundColor Green
            $deletedCount++
        } catch {
            Write-Host "[ERROR] Failed to delete: $path - $_" -ForegroundColor Red
        }
    } else {
        Write-Host "[WARN] Not found: $path" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[COMPLETE] Cleanup complete! Deleted $deletedCount files/folders" -ForegroundColor Green
Write-Host ""
Write-Host "[SUMMARY] Files deleted:" -ForegroundColor Cyan
Write-Host "  - Removed old App.js (was using App.jsx)"
Write-Host "  - Removed profile_page folder (StudentProfile page - unused)"
Write-Host "  - Removed RequestInvitationManager.jsx (never imported)"
Write-Host "  - Removed profile_page_components folder (old components)"
Write-Host "  - Removed sidebar_components folder (old components)"
Write-Host "  - Removed Header.jsx (old header component)"
Write-Host "  - Removed ThemeToggle.jsx (only used in old Header)"
Write-Host ""
Write-Host "[INFO] Kept files:" -ForegroundColor Cyan
Write-Host "  - Toast.jsx (used in UserProfilePage)"
Write-Host "  - studentService.js (used in GroupChat)"
Write-Host "  - All other active pages and components"
