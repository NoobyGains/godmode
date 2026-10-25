# Windows-only: run the hook through cmd.exe, which is how the polyglot
# wrapper's batch half is exercised. The bash half is covered by
# tests/test-hooks.sh under Git Bash.
#
#   pwsh tests/test-hooks-windows.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$env:CLAUDE_PLUGIN_ROOT = $root
$out = & cmd /c "`"$root\hooks\run-hook.cmd`" session-start" 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) { Write-Host "  [FAIL] exit $LASTEXITCODE"; exit 1 }
try {
    $j = $out | ConvertFrom-Json
} catch {
    Write-Host "  [FAIL] cmd branch did not print JSON:`n$($out.Substring(0, [Math]::Min(400, $out.Length)))"
    exit 1
}
if (-not $j.hookSpecificOutput.additionalContext.Contains('godmode:using-godmode')) {
    Write-Host "  [FAIL] bootstrap text missing from additionalContext"; exit 1
}
Write-Host "  [PASS] cmd.exe branch prints the Claude Code shape with the bootstrap"
Write-Host "hooks (windows): all tests passed"
