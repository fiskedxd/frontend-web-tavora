# fix-avatar.ps1 - Version finale et propre
Write-Host "=== CORRECTION DES AVATARS ===" -ForegroundColor Cyan

# Lire les fichiers
$wsContent = Get-Content "src/components/WorkspaceSidebar.jsx" -Raw
$appContent = Get-Content "src/pages/AppHomePage.jsx" -Raw

# === WORKSPACESIDEBAR ===
Write-Host "Modification de WorkspaceSidebar.jsx..." -ForegroundColor Yellow

# Supprimer la déclaration mal placée
$wsContent = $wsContent -replace 'const \[avatarTimestamp, setAvatarTimestamp\] = useState\(Date\.now\(\)\); ', ''

# Ajouter la déclaration au bon endroit
$wsContent = $wsContent -replace '(function WorkspaceSidebar\([^)]*\) {)', '$1
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());'

# Ajouter useState dans l'import si nécessaire
if ($wsContent -notmatch 'import React, {[^}]*useState') {
    $wsContent = $wsContent -replace '(import React, {)', '$1 useState, '
}

Set-Content "src/components/WorkspaceSidebar.jsx" -Value $wsContent
Write-Host "OK WorkspaceSidebar.jsx" -ForegroundColor Green

# === APPHOMEPAGE ===
Write-Host "Modification de AppHomePage.jsx..." -ForegroundColor Yellow

# Ajouter la déclaration au bon endroit
$appContent = $appContent -replace '(function AppHomePage\([^)]*\) {)', '$1
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());'

# Ajouter useState dans l'import si nécessaire
if ($appContent -notmatch 'import React, {[^}]*useState') {
    $appContent = $appContent -replace '(import React, {)', '$1 useState, '
}

Set-Content "src/pages/AppHomePage.jsx" -Value $appContent
Write-Host "OK AppHomePage.jsx" -ForegroundColor Green

Write-Host ""
Write-Host "=== TERMINE ===" -ForegroundColor Green
Write-Host "Redemarre ton frontend : npm run dev" -ForegroundColor Yellow
Write-Host "Puis hard refresh : Ctrl+Shift+R" -ForegroundColor Yellow