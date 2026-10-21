#requires -Version 5.1
[CmdletBinding()]
param([switch]$NoBrowser, [switch]$Quiet)

$ErrorActionPreference = 'Stop'
$cjytdRoot = $PSScriptRoot
$cjytdDist = Join-Path $cjytdRoot 'dist'
$cjytdState = Join-Path $cjytdRoot '.preview'
$cjytdUrl = 'http://127.0.0.1:8000/?v=18#youth'
$cjytdProcess = $null
$cjytdMutex = $null
$cjytdLocked = $false

function Get-PreviewState {
    $client = New-Object System.Net.Sockets.TcpClient
    try { $client.Connect('127.0.0.1', 8000) }
    catch { return 'free' }
    finally { $client.Close() }

    $response = $null
    $reader = $null
    try {
        $request = [System.Net.HttpWebRequest]::Create('http://127.0.0.1:8000/index.html')
        $request.Proxy = $null
        $request.Timeout = 2000
        $request.ReadWriteTimeout = 2000
        $response = $request.GetResponse()
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream(), [System.Text.Encoding]::UTF8)
        $actual = $reader.ReadToEnd()
        $expected = [System.IO.File]::ReadAllText((Join-Path $cjytdDist 'index.html'), [System.Text.Encoding]::UTF8)
        if ($actual -ceq $expected) { return 'ready' }
    } catch {
        # An occupied port must not be mistaken for our website.
    } finally {
        if ($reader) { $reader.Dispose() }
        if ($response) { $response.Dispose() }
    }
    return 'busy'
}

function Find-PreviewPython {
    $candidates = @()
    foreach ($base in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) {
        if ($base) { $candidates += (Join-Path $base 'LibreOffice\program\python.exe') }
    }
    foreach ($name in @('python.exe', 'python3.exe', 'py.exe')) {
        $command = Get-Command $name -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($command -and $command.Source -notmatch '\\WindowsApps\\') { $candidates += $command.Source }
    }
    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }
        try {
            $pythonArgs = @()
            if ([System.IO.Path]::GetFileName($candidate) -ieq 'py.exe') { $pythonArgs += '-3' }
            $pythonArgs += @('-c', 'import sys, http.server; assert sys.version_info >= (3, 7); print(sys.executable)')
            $detected = @(& $candidate @pythonArgs 2>$null)
            if ($LASTEXITCODE -eq 0 -and $detected.Count -gt 0) {
                $executable = [string]$detected[-1]
                if (Test-Path -LiteralPath $executable -PathType Leaf) { return $executable }
            }
        } catch { continue }
    }
    throw '未找到可用的 Python 3.7+。请安装 Python 3，或确认 LibreOffice 自带的 Python 仍在原位置。'
}

try {
    if (-not (Test-Path -LiteralPath (Join-Path $cjytdDist 'index.html') -PathType Leaf)) {
        throw '找不到 dist\index.html。请将启动脚本保留在 CJYTD 仓库根目录。'
    }
    $null = New-Item -ItemType Directory -Path $cjytdState -Force
    $cjytdMutex = New-Object System.Threading.Mutex($false, 'Local\CJYTD-Preview-8000')
    try { $cjytdLocked = $cjytdMutex.WaitOne(30000) }
    catch [System.Threading.AbandonedMutexException] { $cjytdLocked = $true }
    if (-not $cjytdLocked) { throw '网站正在启动，请稍后再试。' }

    $state = Get-PreviewState
    if ($state -eq 'busy') {
        throw '8000 端口已被其他服务占用，或该端口运行的是另一份网页。请先关闭原服务，再重新打开青发协网站。'
    }
    if ($state -eq 'free') {
        $python = Find-PreviewPython
        $arguments = '-u -m http.server 8000 --bind 127.0.0.1 --directory "{0}"' -f $cjytdDist
        $cjytdProcess = Start-Process -FilePath $python -ArgumentList $arguments -WorkingDirectory $cjytdRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $cjytdState 'server.log') -RedirectStandardError (Join-Path $cjytdState 'server-error.log') -PassThru
        $startedTicks = $cjytdProcess.StartTime.ToUniversalTime().Ticks.ToString()
        $ready = $false
        $deadline = (Get-Date).AddSeconds(15)
        while ((Get-Date) -lt $deadline) {
            if ($cjytdProcess.HasExited) { break }
            if ((Get-PreviewState) -eq 'ready') { $ready = $true; break }
            Start-Sleep -Milliseconds 250
        }
        if (-not $ready -or $cjytdProcess.HasExited) {
            throw '网站未能启动，请查看 .preview\server-error.log。'
        }
        @{
            ProcessId = $cjytdProcess.Id
            StartedUtcTicks = $startedTicks
            Executable = $python
            Directory = $cjytdDist
        } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $cjytdState 'server.json') -Encoding UTF8
        $cjytdProcess = $null
    }

    if (-not $NoBrowser) { Start-Process -FilePath $cjytdUrl }
    Write-Output "网站已就绪：$cjytdUrl"
} catch {
    if ($cjytdProcess -and -not $cjytdProcess.HasExited) { $cjytdProcess.Kill() }
    $message = $_.Exception.Message
    try {
        $null = New-Item -ItemType Directory -Path $cjytdState -Force
        "$(Get-Date -Format s) $message" | Add-Content -LiteralPath (Join-Path $cjytdState 'launcher-error.log') -Encoding UTF8
    } catch { }
    if (-not $Quiet) {
        try { $null = (New-Object -ComObject WScript.Shell).Popup($message, 0, '青发协网站启动失败', 16) } catch { }
    }
    throw
} finally {
    if ($cjytdLocked) { $cjytdMutex.ReleaseMutex() }
    if ($cjytdMutex) { $cjytdMutex.Dispose() }
}
