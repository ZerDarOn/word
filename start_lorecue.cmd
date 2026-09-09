@echo off
setlocal
cd /d "%~dp0"

rem Prefer the Python launcher because it waits for readiness and cleans up child processes.
where py.exe >nul 2>&1
if not errorlevel 1 (
  py.exe -3 "%~dp0start_lorecue.py"
  exit /b %errorlevel%
)

where python.exe >nul 2>&1
if not errorlevel 1 (
  python.exe "%~dp0start_lorecue.py"
  exit /b %errorlevel%
)

set "BUNDLED_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if exist "%BUNDLED_PYTHON%" (
  "%BUNDLED_PYTHON%" "%~dp0start_lorecue.py"
  exit /b %errorlevel%
)

set "PNPM_COMMAND="
for /f "delims=" %%I in ('where pnpm.cmd 2^>nul') do if not defined PNPM_COMMAND set "PNPM_COMMAND=%%I"
if not defined PNPM_COMMAND set "PNPM_COMMAND=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"

if not exist "%PNPM_COMMAND%" (
  echo [LoreCue] Could not find Python or pnpm.
  echo Install Python 3, or install Node.js 22 and pnpm, then try again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [LoreCue] Installing dependencies for the first launch...
  call "%PNPM_COMMAND%" install
  if errorlevel 1 (
    echo [LoreCue] Dependency installation failed.
    pause
    exit /b 1
  )
)

echo [LoreCue] Starting http://localhost:3000/
start "" "http://localhost:3000/"
echo [LoreCue] Keep this window open. Press Ctrl+C to stop.
call "%PNPM_COMMAND%" exec vinext dev

if errorlevel 1 (
  echo [LoreCue] The development server exited with an error.
  pause
  exit /b 1
)
