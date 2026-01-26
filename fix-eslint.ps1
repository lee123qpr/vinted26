# ESLint Auto-Fix Script
# This script helps batch-fix common ESLint errors

param(
    [switch]$DryRun = $false
)

$projectRoot = "c:\Users\Lee Kilcoyne\OneDrive\Desktop\vinted26"
$filesFixed = 0
$errorsFixed = 0

Write-Host "Starting ESLint Auto-Fix..." -ForegroundColor Cyan
Write-Host "Project Root: $projectRoot" -ForegroundColor Gray
Write-Host "Dry Run: $DryRun" -ForegroundColor Gray
Write-Host ""

# Function to fix catch blocks
function Fix-CatchBlocks {
    param([string]$filePath)
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # Pattern 1: catch (e: any)
    $content = $content -replace 'catch \(e: any\)', 'catch (e: unknown)'
    $content = $content -replace 'alert\(e\.message\)', 'const msg = e instanceof Error ? e.message : ''Failed''; alert(msg)'
    
    # Pattern 2: catch (err: any)
    $content = $content -replace 'catch \(err: any\)', 'catch (err: unknown)'
    
    # Pattern 3: catch (error: any)
    $content = $content -replace 'catch \(error: any\)', 'catch (error: unknown)'
    
    if ($content -ne $originalContent) {
        if (-not $DryRun) {
            Set-Content $filePath -Value $content -NoNewline
        }
        return $true
    }
    return $false
}

# Function to remove unused imports
function Fix-UnusedImports {
    param([string]$filePath)
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    
    # Remove common unused imports
    $content = $content -replace "import \{ Suspense \} from 'react';\r?\n", ""
    $content = $content -replace "import Link from 'next/link';\r?\n(?!.*Link)", ""
    $content = $content -replace "import Image from 'next/image';\r?\n(?!.*Image)", ""
    
    if ($content -ne $originalContent) {
        if (-not $DryRun) {
            Set-Content $filePath -Value $content -NoNewline
        }
        return $true
    }
    return $false
}

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path $projectRoot -Include *.ts,*.tsx -Recurse -File | 
    Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.gemini' }

Write-Host "Found $($files.Count) files to process" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    $fixed = $false
    
    # Fix catch blocks
    if (Fix-CatchBlocks -filePath $file.FullName) {
        $fixed = $true
        $errorsFixed++
        Write-Host "[FIXED] Catch blocks in: $($file.Name)" -ForegroundColor Green
    }
    
    # Fix unused imports
    if (Fix-UnusedImports -filePath $file.FullName) {
        $fixed = $true
        $errorsFixed++
        Write-Host "[FIXED] Unused imports in: $($file.Name)" -ForegroundColor Green
    }
    
    if ($fixed) {
        $filesFixed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Auto-Fix Complete!" -ForegroundColor Cyan
Write-Host "Files Fixed: $filesFixed" -ForegroundColor Yellow
Write-Host "Errors Fixed (estimated): $errorsFixed" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host ""
    Write-Host "This was a DRY RUN. No files were modified." -ForegroundColor Magenta
    Write-Host "Run without -DryRun to apply changes." -ForegroundColor Magenta
}
