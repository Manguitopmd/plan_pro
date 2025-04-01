@echo off
title Listado de archivos con extensiones
color 0A

echo Listado de archivos en el directorio actual: > listado_archivos.txt
echo ------------------------------------------ >> listado_archivos.txt
echo. >> listado_archivos.txt

for %%f in (*.*) do (
    echo %%f >> listado_archivos.txt
)

echo.
echo Proceso completado!
echo Se ha creado el archivo "listado_archivos.txt" con todos los nombres.
echo.
pause