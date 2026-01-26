# Fix Unescaped JSX Entities
# This script fixes unescaped quotes and apostrophes in JSX files

$projectRoot = "c:\Users\Lee Kilcoyne\OneDrive\Desktop\vinted26"
$filesFixed = 0
$entitiesFixed = 0

Write-Host "Fixing unescaped JSX entities..." -ForegroundColor Cyan

# Get all TSX files
$files = Get-ChildItem -Path $projectRoot -Include *.tsx -Recurse | 
Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.gemini' }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    
    # Fix common patterns in JSX text content
    # Pattern: text content between > and < that contains unescaped quotes
    
    # Fix: don't -> don&apos;t
    if ($content -match "don't") {
        $content = $content -replace "don't", "don&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: can't -> can&apos;t
    if ($content -match "can't") {
        $content = $content -replace "can't", "can&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: won't -> won&apos;t
    if ($content -match "won't") {
        $content = $content -replace "won't", "won&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: it's -> it&apos;s
    if ($content -match "it's") {
        $content = $content -replace "it's", "it&apos;s"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: you're -> you&apos;re
    if ($content -match "you're") {
        $content = $content -replace "you're", "you&apos;re"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: we're -> we&apos;re
    if ($content -match "we're") {
        $content = $content -replace "we're", "we&apos;re"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: they're -> they&apos;re
    if ($content -match "they're") {
        $content = $content -replace "they're", "they&apos;re"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: I'm -> I&apos;m
    if ($content -match "I'm") {
        $content = $content -replace "I'm", "I&apos;m"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: you've -> you&apos;ve
    if ($content -match "you've") {
        $content = $content -replace "you've", "you&apos;ve"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: we've -> we&apos;ve
    if ($content -match "we've") {
        $content = $content -replace "we've", "we&apos;ve"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: that's -> that&apos;s
    if ($content -match "that's") {
        $content = $content -replace "that's", "that&apos;s"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: what's -> what&apos;s
    if ($content -match "what's") {
        $content = $content -replace "what's", "what&apos;s"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: here's -> here&apos;s
    if ($content -match "here's") {
        $content = $content -replace "here's", "here&apos;s"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: there's -> there&apos;s
    if ($content -match "there's") {
        $content = $content -replace "there's", "there&apos;s"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: let's -> let&apos;s
    if ($content -match "let's") {
        $content = $content -replace "let's", "let&apos;s"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: hasn't -> hasn&apos;t
    if ($content -match "hasn't") {
        $content = $content -replace "hasn't", "hasn&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: haven't -> haven&apos;t
    if ($content -match "haven't") {
        $content = $content -replace "haven't", "haven&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: doesn't -> doesn&apos;t
    if ($content -match "doesn't") {
        $content = $content -replace "doesn't", "doesn&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: didn't -> didn&apos;t
    if ($content -match "didn't") {
        $content = $content -replace "didn't", "didn&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: isn't -> isn&apos;t
    if ($content -match "isn't") {
        $content = $content -replace "isn't", "isn&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: aren't -> aren&apos;t
    if ($content -match "aren't") {
        $content = $content -replace "aren't", "aren&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: wasn't -> wasn&apos;t
    if ($content -match "wasn't") {
        $content = $content -replace "wasn't", "wasn&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    # Fix: weren't -> weren&apos;t
    if ($content -match "weren't") {
        $content = $content -replace "weren't", "weren&apos;t"
        $entitiesFixed++
        $fileChanged = $true
    }
    
    if ($fileChanged -and $content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -NoNewline
        $filesFixed++
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Complete!" -ForegroundColor Cyan
Write-Host "Files Fixed: $filesFixed" -ForegroundColor Yellow
Write-Host "Entities Fixed: $entitiesFixed" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
