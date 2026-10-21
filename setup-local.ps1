#requires -Version 5.1
[CmdletBinding()]
param([switch]$Remove)

$ErrorActionPreference = 'Stop'
$cjytdRoot = $PSScriptRoot
$cjytdDesktop = [Environment]::GetFolderPath('Desktop')
$cjytdStartup = [Environment]::GetFolderPath('Startup')
$cjytdShell = New-Object -ComObject WScript.Shell
$cjytdPowerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$cjytdLinks = @(
    @{ Path = (Join-Path $cjytdDesktop '青发协网站.lnk'); Script = 'start.ps1'; Extra = ''; Description = '启动青发协网站并在浏览器中打开' },
    @{ Path = (Join-Path $cjytdDesktop '停止青发协网站.lnk'); Script = 'stop.ps1'; Extra = ''; Description = '停止本启动脚本管理的青发协网站服务' },
    @{ Path = (Join-Path $cjytdStartup 'CJYTD Preview.lnk'); Script = 'start.ps1'; Extra = ' -NoBrowser -Quiet'; Description = '登录后在后台启动青发协网站，不自动打开浏览器' }
)

# Only manage shortcuts pointing to this repository; never replace another app's shortcut.
foreach ($item in $cjytdLinks) {
    if (Test-Path -LiteralPath $item.Path) {
        $existing = $cjytdShell.CreateShortcut($item.Path)
        $scriptPath = Join-Path $cjytdRoot $item.Script
        if ($existing.TargetPath -ine $cjytdPowerShell -or $existing.Arguments.IndexOf(('"{0}"' -f $scriptPath), [System.StringComparison]::OrdinalIgnoreCase) -lt 0) {
            throw "同名快捷方式属于其他位置，请先重命名：$($item.Path)"
        }
    }
}

if ($Remove) {
    foreach ($item in $cjytdLinks) {
        if (Test-Path -LiteralPath $item.Path) { Remove-Item -LiteralPath $item.Path }
    }
    & (Join-Path $cjytdRoot 'stop.ps1') -Quiet
    Write-Output '已移除桌面快捷方式和登录启动项，网站源文件保留。'
    return
}

# Verify startup before adding persistent shortcuts. All .ps1 files use UTF-8 BOM.
& (Join-Path $cjytdRoot 'start.ps1') -NoBrowser -Quiet
foreach ($item in $cjytdLinks) {
    $shortcut = $cjytdShell.CreateShortcut($item.Path)
    $shortcut.TargetPath = $cjytdPowerShell
    $shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "{0}"{1}' -f (Join-Path $cjytdRoot $item.Script), $item.Extra
    $shortcut.WorkingDirectory = $cjytdRoot
    $shortcut.WindowStyle = 7
    $shortcut.Description = $item.Description
    $shortcut.Save()
}
Start-Process 'http://127.0.0.1:8000/?v=18#youth'
Write-Output '设置完成。以后双击桌面“青发协网站”即可打开；登录 Windows 后会自动在后台启动服务。'
Write-Output '关闭当前 PowerShell 窗口不会停止网站。双击“停止青发协网站”可停止本次服务。'
