@echo off
:: 识谱大师 - 版本管理工具
:: 用法:
::   version.bat save <版本号> [说明]   - 保存当前状态为快照
::   version.bat list                   - 列出所有快照
::   version.bat restore <版本号>       - 恢复到指定版本
::   version.bat diff <版本号>          - 对比当前与指定版本差异

cd /d "%~dp0"

if "%1"=="" goto :help
if "%1"=="save" goto :save
if "%1"=="list" goto :list
if "%1"=="restore" goto :restore
if "%1"=="diff" goto :diff
goto :help

:save
if "%2"=="" (
    echo 错误: 请指定版本号，如 version.bat save v3.1.0
    exit /b 1
)
set VER=%2
set MSG=%3
if "%MSG%"=="" set MSG=Snapshot %VER%

mkdir snapshots 2>nul
copy /y js\app.js "snapshots\%VER%-app.js" >nul
copy /y css\style.css "snapshots\%VER%-style.css" >nul
copy /y index.html "snapshots\%VER%-index.html" >nul
copy /y js\stats.js "snapshots\%VER%-stats.js" >nul
copy /y js\plan.js "snapshots\%VER%-plan.js" >nul
copy /y js\renderer.js "snapshots\%VER%-renderer.js" >nul

echo 快照已保存: %VER%
echo 文件:
dir /b snapshots\%VER%-*

:: Git commit + tag
git add -A
git commit -m "%VER%: %MSG%"
git tag -a %VER% -m "%MSG%"
echo Git 标签已创建: %VER%
goto :end

:list
echo === 快照列表 ===
dir /b snapshots\*-app.js 2>nul | sort
echo.
echo === Git 标签 ===
git tag -l "v*"
goto :end

:restore
if "%2"=="" (
    echo 错误: 请指定版本号
    exit /b 1
)
set VER=%2
if not exist "snapshots\%VER%-app.js" (
    echo 错误: 快照 %VER% 不存在
    exit /b 1
)
echo 正在恢复到 %VER% ...
copy /y "snapshots\%VER%-app.js" js\app.js >nul
copy /y "snapshots\%VER%-style.css" css\style.css >nul
copy /y "snapshots\%VER%-index.html" index.html >nul
copy /y "snapshots\%VER%-stats.js" js\stats.js >nul
copy /y "snapshots\%VER%-plan.js" js\plan.js >nul
copy /y "snapshots\%VER%-renderer.js" js\renderer.js >nul
echo 已恢复到 %VER%
goto :end

:diff
if "%2"=="" (
    echo 错误: 请指定版本号
    exit /b 1
)
set VER=%2
echo === 差异: 当前 vs %VER% ===
diff js\app.js "snapshots\%VER%-app.js" 2>nul && echo app.js: 无差异 || echo app.js: 有差异
diff css\style.css "snapshots\%VER%-style.css" 2>nul && echo style.css: 无差异 || echo style.css: 有差异
diff index.html "snapshots\%VER%-index.html" 2>nul && echo index.html: 无差异 || echo index.html: 有差异
goto :end

:help
echo 识谱大师 - 版本管理工具
echo.
echo 用法:
echo   version.bat save ^<版本号^> [说明]   保存当前状态
echo   version.bat list                   列出所有快照
echo   version.bat restore ^<版本号^>       恢复到指定版本
echo   version.bat diff ^<版本号^>          对比差异
echo.
echo 示例:
echo   version.bat save v3.1.0 "新增功能"
echo   version.bat restore v3.0.0

:end
