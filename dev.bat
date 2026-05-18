@echo off
echo ========================================
echo   识谱大师 - 本地调试服务器
echo ========================================
echo.
echo 本地访问: http://localhost:8080
echo.
echo 调试完成后运行 deploy.bat 部署更新
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8080
