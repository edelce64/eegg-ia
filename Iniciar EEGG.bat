@echo off
title Agencia de IA EEGG
cd /d "%~dp0"
echo ==========================================================
echo   Agencia de IA EEGG - Lic. Edelce Gomez Gomez
echo   Servidor local:  http://localhost:3000
echo   Cierre esta ventana para detener el servidor.
echo ==========================================================
start "" http://localhost:3000
node server.js
pause