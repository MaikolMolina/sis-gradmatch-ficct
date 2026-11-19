# ==============================================================================
# SIS-GradMatch: Script de Lanzamiento Rápido del Sistema Completo
# Modalidad de Graduación: Proyecto de Grado (Malla Curricular 100% Vencida)
# Desarrollador Único: Molina Cortez Maikol Anthony (Reg. 220011559)
# Director de Carrera: M.Sc. Ing. Leonardo Vargas Peña
# Docente Asesor / Tutor: Ing. Rolando Antoni Martínez Canedo
# FICCT - UAGRM | Gestión II-2026
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   🎓 SIS-GradMatch: Gestión de Proyectos de Grado (FICCT UAGRM)" -ForegroundColor Yellow
Write-Host "   Modalidad: Proyecto de Grado • Plan 187-3 (Malla 100% Vencida)" -ForegroundColor White
Write-Host "   Desarrollador Único: Molina Cortez Maikol Anthony (Reg. 220011559)" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Comprobar si el puerto 8000 ya está activo
$portCheck = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if (-not $portCheck) {
    Write-Host "`n[1/3] Iniciando Servidor Backend FastAPI en http://127.0.0.1:8000..." -ForegroundColor Cyan
    $projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    if (-not $projectRoot) { $projectRoot = "C:\Users\Administrator\Documents\Proyecto SW" }
    Start-Process -FilePath "python" -ArgumentList "-m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory $projectRoot -WindowStyle Minimized
    Start-Sleep -Seconds 3
} else {
    Write-Host "`n[1/3] Servidor Backend FastAPI ya se encuentra activo en el puerto 8000." -ForegroundColor Green
}

Write-Host "[2/3] Abriendo Portal Web en el Navegador..." -ForegroundColor Green
Start-Process "http://localhost:8000/portal/"

Write-Host "[3/3] Servicios Web y Móvil Disponibles:" -ForegroundColor Yellow
Write-Host "  • Portal Web SPA:        http://localhost:8000/portal/" -ForegroundColor White
Write-Host "  • App Móvil (Web):       http://localhost:8000/mobile/" -ForegroundColor White
Write-Host "  • Sitio Corporativo:     http://localhost:8000/corporativo/" -ForegroundColor White
Write-Host "  • Archivos Storage:      http://localhost:8000/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf" -ForegroundColor White
Write-Host "  • API Swagger Docs:      http://localhost:8000/docs" -ForegroundColor White
Write-Host "  • API Health Endpoint:   http://localhost:8000/health" -ForegroundColor White
Write-Host "`nPara ejecutar la app móvil de forma independiente en Chrome:" -ForegroundColor Cyan
Write-Host "  cd mobile; flutter run -d chrome" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
