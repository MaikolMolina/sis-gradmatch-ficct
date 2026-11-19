import hashlib
from typing import Dict, Any, Optional

class PDFProcessingResult:
    def __init__(self, success: bool, error_code: Optional[str], message: str, data: Optional[Dict[str, Any]] = None):
        self.success = success
        self.error_code = error_code
        self.message = message
        self.data = data or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "error_code": self.error_code,
            "message": self.message,
            "data": self.data
        }

def process_and_validate_pdf_document(
    filename: str,
    file_bytes: bytes,
    max_size_bytes: int = 15 * 1024 * 1024 # 15 MB
) -> PDFProcessingResult:
    """
    HU-03: Procesamiento, Extracción y Validación de Perfil PDF.
    Complexity: V(G) = 5 (McCabe)
    
    Nodes:
    1: Recibir archivo binario y nombre
    2: ¿Extensión == .pdf?
    3: Error: Formato no permitido (Path 1)
    4: ¿Tamaño <= 15 MB?
    5: Error: Tamaño excede límite (Path 2)
    6: Extraer texto estructurado del documento
    7: ¿Contiene secciones requeridas (Resumen y Objetivos)?
    8: Error: Estructura Incompleta (Path 3)
    9: Guardar y calcular Hash criptográfico SHA-256 (Path 4 - Éxito)
    10: Fin del Procesamiento (Manejo de archivo dañado/corrupto - Path 5)
    """
    # Node 1: Recibir Archivo
    # Node 2: ¿Extensión == .pdf?
    if not filename.lower().endswith(".pdf"):
        # Node 3: Error formato
        return PDFProcessingResult(
            success=False,
            error_code="ERROR_FORMATO_NO_PDF",
            message=f"Formato no permitido: '{filename}'. El documento debe ser un archivo .pdf válido."
        )

    # Node 4: ¿Tamaño <= 15 MB?
    size_bytes = len(file_bytes)
    if size_bytes > max_size_bytes:
        # Node 5: Error peso
        return PDFProcessingResult(
            success=False,
            error_code="ERROR_TAMANO_EXCEDIDO",
            message=f"El archivo excede el tamaño máximo permitido de 15 MB (Tamaño recibido: {round(size_bytes / (1024*1024), 2)} MB)."
        )

    # Node 6: Extraer texto estructurado (Manejo de excepciones por archivo vacío o dañado)
    try:
        if size_bytes == 0:
            raise ValueError("El archivo se encuentra vacío (0 bytes).")
            
        # Parse text (simulate PDF text extraction)
        text_content = file_bytes.decode("utf-8", errors="ignore")
        if not text_content or len(text_content.strip()) < 20:
            raise ValueError("No se pudo extraer texto digital seleccionable del PDF.")
            
    except Exception as e:
        # Path 5: Archivo corrupto o no procesable
        return PDFProcessingResult(
            success=False,
            error_code="ERROR_ARCHIVO_CORRUPTO",
            message=f"Error durante el parseo digital del documento: {str(e)}"
        )

    # Node 7: ¿Tiene secciones obligatorias? (Resumen y Objetivos)
    text_lower = text_content.lower()
    has_resumen = "resumen" in text_lower or "introducción" in text_lower or "antecedentes" in text_lower
    has_objetivos = "objetivo" in text_lower or "propósito" in text_lower or "alcance" in text_lower

    if not (has_resumen and has_objetivos):
        # Node 8: Error estructura
        missing = []
        if not has_resumen: missing.append("Resumen / Introducción")
        if not has_objetivos: missing.append("Objetivos / Alcance")
        return PDFProcessingResult(
            success=False,
            error_code="ERROR_ESTRUCTURA_INCOMPLETA",
            message=f"El perfil no cumple con la estructura metodológica mínima. Faltan: {', '.join(missing)}."
        )

    # Node 9: Guardar y Generar Hash SHA-256 (Éxito)
    sha256_hash = hashlib.sha256(file_bytes).hexdigest()
    
    return PDFProcessingResult(
        success=True,
        error_code=None,
        message="Documento PDF validado y procesado exitosamente.",
        data={
            "filename": filename,
            "size_bytes": size_bytes,
            "sha256_hash": sha256_hash,
            "extracted_chars": len(text_content),
            "has_resumen": has_resumen,
            "has_objetivos": has_objetivos,
            "text_preview": text_content[:300]
        }
    )
