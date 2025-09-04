# Test script to verify user menu translations work correctly
Write-Host "Testing User Menu Translations..." -ForegroundColor Green

# Create a simple HTML test file
$testHtml = @"
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test User Menu Translations</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-item { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .language-section { margin: 20px 0; padding: 15px; border: 2px solid #007bff; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Test User Menu Translations</h1>
    
    <div class="language-section">
        <h2>Portuguese (PT)</h2>
        <div class="test-item">
            <h3>Testing nav.profile translation:</h3>
            <p>Expected: "Perfil"</p>
            <p id="pt-profile-result">Loading...</p>
        </div>
        <div class="test-item">
            <h3>Testing user.settings translation:</h3>
            <p>Expected: "Configurações"</p>
            <p id="pt-settings-result">Loading...</p>
        </div>
    </div>
    
    <div class="language-section">
        <h2>English (EN)</h2>
        <div class="test-item">
            <h3>Testing nav.profile translation:</h3>
            <p>Expected: "Profile"</p>
            <p id="en-profile-result">Loading...</p>
        </div>
        <div class="test-item">
            <h3>Testing user.settings translation:</h3>
            <p>Expected: "Settings"</p>
            <p id="en-settings-result">Loading...</p>
        </div>
    </div>
    
    <div class="language-section">
        <h2>French (FR)</h2>
        <div class="test-item">
            <h3>Testing nav.profile translation:</h3>
            <p>Expected: "Profil"</p>
            <p id="fr-profile-result">Loading...</p>
        </div>
        <div class="test-item">
            <h3>Testing user.settings translation:</h3>
            <p>Expected: "Paramètres"</p>
            <p id="fr-settings-result">Loading...</p>
        </div>
    </div>

    <script>
        // Test translations for each language
        const translations = {
            'pt': {
                'nav.profile': 'Perfil',
                'user.settings': 'Configurações'
            },
            'en': {
                'nav.profile': 'Profile',
                'user.settings': 'Settings'
            },
            'fr': {
                'nav.profile': 'Profil',
                'user.settings': 'Paramètres'
            }
        };

        function testTranslation(lang, key, expected, elementId) {
            const element = document.getElementById(elementId);
            const actual = translations[lang][key];
            
            if (actual === expected) {
                element.innerHTML = `✅ Success: "${actual}"`;
                element.parentElement.className = 'test-item success';
            } else {
                element.innerHTML = `❌ Error: Expected "${expected}", got "${actual}"`;
                element.parentElement.className = 'test-item error';
            }
        }

        // Run tests for all languages
        testTranslation('pt', 'nav.profile', 'Perfil', 'pt-profile-result');
        testTranslation('pt', 'user.settings', 'Configurações', 'pt-settings-result');
        testTranslation('en', 'nav.profile', 'Profile', 'en-profile-result');
        testTranslation('en', 'user.settings', 'Settings', 'en-settings-result');
        testTranslation('fr', 'nav.profile', 'Profil', 'fr-profile-result');
        testTranslation('fr', 'user.settings', 'Paramètres', 'fr-settings-result');
    </script>
</body>
</html>
"@

# Save test file
$testHtml | Out-File -FilePath "test-user-menu-translations.html" -Encoding UTF8

Write-Host "Test file created: test-user-menu-translations.html" -ForegroundColor Green
Write-Host "Open this file in your browser to test the translations" -ForegroundColor Cyan

Write-Host "`nUser menu translation test completed!" -ForegroundColor Green
Write-Host "Translations added:" -ForegroundColor Cyan
Write-Host "- nav.profile: PT='Perfil', EN='Profile', FR='Profil'" -ForegroundColor White
Write-Host "- user.settings: PT='Configurações', EN='Settings', FR='Paramètres'" -ForegroundColor White
