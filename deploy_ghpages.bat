@echo off
echo ==========================================
echo Deploying Aether Console to GitHub Pages...
echo ==========================================
echo.

echo Building Aether Console project...
call npm run build

if not exist dist (
    echo Error: Build failed, dist directory not found.
    pause
    exit /b 1
)

:: Get the remote url of the parent repo if it exists
set REPO_URL=
for /f "tokens=*" %%i in ('git config --get remote.origin.url 2^>nul') do set REPO_URL=%%i

if "%REPO_URL%"=="" (
    echo No Git remote origin found in this repository.
    echo Please enter the GitHub Repository URL to deploy to.
    echo Example: https://github.com/kittyboy06/Aether-Console.git
    set /p REPO_URL="Repository URL: "
)

if "%REPO_URL%"=="" (
    echo Error: Repository URL cannot be empty.
    pause
    exit /b 1
)

echo.
echo Initializing temporary git repo in dist folder...
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy Aether Console to gh-pages"

echo.
echo Deploying to %REPO_URL% on gh-pages branch...
git push -f "%REPO_URL%" gh-pages:gh-pages

echo.
echo Cleaning up deployment folder...
rd /s /q .git
cd ..

echo.
echo ==========================================
echo Done! Aether Console deployed successfully.
echo ==========================================
pause
