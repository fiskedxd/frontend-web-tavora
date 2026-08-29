# Script pour corriger le cache des avatars - Version simplifiée
Write-Host "🔄 Modification des fichiers..." -ForegroundColor Cyan

# 1. Modifier WorkspaceSidebar.jsx
$content = Get-Content "src/components/WorkspaceSidebar.jsx" -Raw

# Remplacer la ligne const imageUrl
$content = $content -replace '(const imageUrl = server\?\.avatarUrl;)', 'const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now()); const imageUrl = server?.avatarUrl ? `${server.avatarUrl}?t=${avatarTimestamp}` : "";'

# Remplacer le img
$content = $content -replace '(person\?\.avatarUrl \? <img src={person\.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User size={16} />)', '{person?.avatarUrl ? <img src={`${person.avatarUrl}?t=${avatarTimestamp}`} alt="" className="h-full w-full object-cover" /> : <User size={16} />}'

Set-Content "src/components/WorkspaceSidebar.jsx" -Value $content
Write-Host "✅ WorkspaceSidebar.jsx modifié" -ForegroundColor Green

# 2. Modifier AppHomePage.jsx
$content = Get-Content "src/pages/AppHomePage.jsx" -Raw
$content = $content -replace 'src={server\.avatarUrl}', 'src={`${server.avatarUrl}?t=${avatarTimestamp}`}'
$content = $content -replace 'src={selectedServer\.avatarUrl}', 'src={`${selectedServer.avatarUrl}?t=${avatarTimestamp}`}'
$content = $content -replace 'src={serverDraft\.avatarUrl}', 'src={`${serverDraft.avatarUrl}?t=${avatarTimestamp}`}'

Set-Content "src/pages/AppHomePage.jsx" -Value $content
Write-Host "✅ AppHomePage.jsx modifié" -ForegroundColor Green

Write-Host "✅ Modifications terminées !" -ForegroundColor Green
Write-Host "📌 Vérifie que useState est importé dans les deux fichiers" -ForegroundColor Yellow
Write-Host "📌 Ajoute setAvatarTimestamp(Date.now()) dans les fonctions d'upload" -ForegroundColor Yellow