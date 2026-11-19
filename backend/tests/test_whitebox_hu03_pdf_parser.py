from backend.app.services.pdf_parser_service import process_and_validate_pdf_document

def test_path_1_non_pdf_extension_error():
    """Camino 1: 1 -> 2 -> 3 -> 10. Archivo con extensión distinta a .pdf es rechazado."""
    result = process_and_validate_pdf_document(
        filename="perfil_proyecto.docx",
        file_bytes=b"Document content in docx format",
        max_size_bytes=15 * 1024 * 1024
    )
    assert result.success is False
    assert result.error_code == "ERROR_FORMATO_NO_PDF"
    assert "Formato no permitido" in result.message

def test_path_2_file_size_exceeded_error():
    """Camino 2: 1 -> 2 -> 4 -> 5 -> 10. Archivo que supera el límite de 15 MB es rechazado."""
    large_bytes = b"A" * (16 * 1024 * 1024) # 16 MB
    result = process_and_validate_pdf_document(
        filename="perfil_muy_pesado.pdf",
        file_bytes=large_bytes,
        max_size_bytes=15 * 1024 * 1024
    )
    assert result.success is False
    assert result.error_code == "ERROR_TAMANO_EXCEDIDO"
    assert "excede el tamaño máximo permitido" in result.message

def test_path_3_missing_required_sections_error():
    """Camino 3: 1 -> 2 -> 4 -> 6 -> 7 -> 8 -> 10. Documento válido pero sin sección de objetivos o resumen."""
    incomplete_text = "Universidad Gabriel Rene Moreno. Documento preliminar sin objetivos definidos."
    result = process_and_validate_pdf_document(
        filename="perfil_incompleto.pdf",
        file_bytes=incomplete_text.encode("utf-8"),
        max_size_bytes=15 * 1024 * 1024
    )
    assert result.success is False
    assert result.error_code == "ERROR_ESTRUCTURA_INCOMPLETA"
    assert "estructura metodológica mínima" in result.message

def test_path_4_valid_pdf_with_sections_success():
    """Camino 4: 1 -> 2 -> 4 -> 6 -> 7 -> 9 -> 10. Documento PDF completo con resumen y objetivos genera hash y éxito."""
    valid_text = (
        "UNIVERSIDAD AUTONOMA GABRIEL RENE MORENO\n"
        "RESUMEN EJECUTIVO: Plataforma inteligente de grado mediante IA y NLP.\n"
        "OBJETIVOS ESPECIFICOS: 1. Vectorizar perfiles. 2. Implementar matching semantico."
    )
    result = process_and_validate_pdf_document(
        filename="perfil_aprobado.pdf",
        file_bytes=valid_text.encode("utf-8"),
        max_size_bytes=15 * 1024 * 1024
    )
    assert result.success is True
    assert result.error_code is None
    assert "sha256_hash" in result.data
    assert len(result.data["sha256_hash"]) == 64

def test_path_5_corrupt_or_empty_bytes_error():
    """Camino 5: 1 -> 2 -> 4 -> 6 (excepción) -> 10. Archivo de 0 bytes o dañado es capturado por excepción."""
    result = process_and_validate_pdf_document(
        filename="corrupto.pdf",
        file_bytes=b"",
        max_size_bytes=15 * 1024 * 1024
    )
    assert result.success is False
    assert result.error_code == "ERROR_ARCHIVO_CORRUPTO"
