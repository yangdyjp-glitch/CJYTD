#requires -Version 5.1
[CmdletBinding()]
param([switch]$Quiet)

$ErrorActionPreference = 'Stop'
$cjytdStateFile = Join-Path $PSScriptRoot '.preview\server.json'
$cjytdMutex = $null
$cjytdLocked = $false
try {
    $cjytdMutex = New-Object System.Threading.Mutex($false, 'Local\CJYTD-Preview-8000')
    try { $cjytdLocked = $cjytdMutex.WaitOne(30000) }
    catch [System.Threading.AbandonedMutexException] { $cjytdLocked = $true }
    if (-not $cjytdLocked) { throw '网站正在启动，请稍后再停止。' }
    if (-not (Test-Path -LiteralPath $cjytdStateFile)) {
        Write-Output '没有由本启动脚本管理的服务。'
        return
    }
    $state = Get-Content -LiteralPath $cjytdStateFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $process = Get-Process -Id ([int]$state.ProcessId) -ErrorAction SilentlyContinue
    if (-not $process) {
        Remove-Item -LiteralPath $cjytdStateFile
        Write-Output '网站已经停止。'
        return
    }
    $expectedDist = Join-Path $PSScriptRoot 'dist'
    if ($process.StartTime.ToUniversalTime().Ticks.ToString() -ne $state.StartedUtcTicks -or $process.Path -ine $state.Executable -or $state.Directory -ine $expectedDist) {
        throw '原服务已变化，停止操作已取消，以免关闭其他程序。可删除 .preview\server.json 后重新启动。'
    }
    $details = Get-CimInstance -ClassName Win32_Process -Filter ("ProcessId = {0}" -f $process.Id)
    $serverScript = Join-Path $PSScriptRoot 'preview-server.ps1'
    $owned = $false
    if ($details.CommandLine) {
        if ($state.ServerScript -ieq $serverScript) {
            $owned = $details.CommandLine.IndexOf(('"{0}"' -f $serverScript), [System.StringComparison]::OrdinalIgnoreCase) -ge 0 -and $details.CommandLine.IndexOf(('"{0}"' -f $expectedDist), [System.StringComparison]::OrdinalIgnoreCase) -ge 0
        } else {
            # Keep support for stopping a Python process recorded by the previous launcher.
            $owned = $details.CommandLine -match '-m http\.server 8000 --bind 127\.0\.0\.1' -and $details.CommandLine.IndexOf($expectedDist, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
        }
    }
    if (-not $owned) { throw '无法确认该进程属于青发协网站，停止操作已取消。' }
    $process.Kill()
    if (-not $process.WaitForExit(5000)) { throw '服务仍在退出中，请稍后重试。' }
    Remove-Item -LiteralPath $cjytdStateFile
    Write-Output '青发协网站已停止。'
} catch {
    if (-not $Quiet) {
        try { $null = (New-Object -ComObject WScript.Shell).Popup($_.Exception.Message, 0, '青发协网站', 16) } catch { }
    }
    throw
} finally {
    if ($cjytdLocked) { $cjytdMutex.ReleaseMutex() }
    if ($cjytdMutex) { $cjytdMutex.Dispose() }
}
