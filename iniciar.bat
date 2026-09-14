@echo off
if "%~1"=="__run__" goto :run

rem ---- primeira execucao: reinicia a si mesmo capturando TUDO em log ----
cd /d "%~dp0"
call "%~f0" __run__ > "%~dp0orbita-log.txt" 2>&1
echo ==========================================
echo   Log completo de "%~dp0orbita-log.txt":
echo ==========================================
type "%~dp0orbita-log.txt"
echo ==========================================
echo.
echo Se o site nao abriu, copie as mensagens acima (ou o arquivo
echo orbita-log.txt) e mande para quem esta te ajudando.
echo.
pause
exit /b

:run
rem ---- execucao real, com saida 100%% redirecionada para o log ----
cd /d "%~dp0"
echo Orbita - log de execucao - %date% %time%
echo.
echo -- versoes --
where node
where npm
node -v
npm -v
echo.
echo -- npm install --
call npm install
echo.
echo npm install terminou com codigo de saida %errorlevel%
if not "%errorlevel%"=="0" (
  echo FALHOU no npm install, veja mensagens acima.
  exit /b 1
)
echo.
echo -- npm run dev --
echo Abrindo em http://localhost:3000
call npm run dev
echo.
echo npm run dev terminou com codigo de saida %errorlevel%
exit /b
