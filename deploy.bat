@echo off
echo ========================================
echo   识谱大师 - 部署更新到 GitHub Pages
echo ========================================
echo.

cd /d "%~dp0"

:: 更新 index.html（合并所有JS/CSS到单文件）
echo [1/4] 打包资源...
python -c "
import re

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# If already bundled, skip
if '<script src=' not in html:
    print('  已是打包状态，跳过')
else:
    # Read CSS
    with open('css/style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    # Read JS files
    js_files = ['theory.js', 'audio.js', 'stats.js', 'plan.js', 'renderer.js', 'app.js']
    js_content = ''
    for jf in js_files:
        with open(f'js/{jf}', 'r', encoding='utf-8') as f:
            js_content += f'<script>\n{f.read()}\n</script>\n'

    # Build bundled HTML
    bundled = html
    # Replace CSS link
    bundled = re.sub(r'<link rel=\"stylesheet\" href=\"css/style.css\">', f'<style>\n{css}\n</style>', bundled)
    # Replace script tags
    for jf in js_files:
        bundled = bundled.replace(f'<script src=\"js/{jf}\"></script>', '')
    bundled = bundled.replace('</body>', f'{js_content}\n</body>')

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(bundled)
    print('  打包完成')
"

:: Git add and commit
echo [2/4] 提交更改...
git add .
git status --short
for /f %%i in ('git diff --cached --name-only ^| find /c /v ""') do set CHANGES=%%i
if "%CHANGES%"=="0" (
    echo   没有更改需要提交
    goto :end
)
set /p MSG="请输入提交说明 (回车使用默认): "
if "%MSG%"=="" set MSG=update: 更新应用
git commit -m "%MSG%"

:: Push to GitHub
echo [3/4] 推送到 GitHub...
git push origin master

:: Sync gh-pages branch
echo [4/4] 同步 gh-pages 分支...
git checkout gh-pages
git merge master --no-edit
git push origin gh-pages
git checkout master

echo.
echo ========================================
echo   部署完成！
echo   访问: https://muzhaozi1.github.io/sight-reading-app/
echo ========================================

:end
pause
