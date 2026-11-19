/**
 * SIS-GradMatch: Administrative Resolution Modal
 * Formato Oficial de la Dirección de Carrera - FICCT UAGRM
 * Desarrollador Único: Molina Cortez Maikol Anthony
 */

const ResolutionModal = {
    open(numeroResolucion, estudianteNombre, docenteNombre) {
        const modalContainer = document.getElementById('modal-container');
        const modalContent = document.getElementById('modal-content');
        if (!modalContainer || !modalContent) return;

        const fechaHoy = new Date().toLocaleDateString('es-BO', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });

        modalContent.innerHTML = `
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.6rem;">🏛️</span>
                    <div>
                        <h3 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--primary); margin: 0;">
                            Resolución Administrativa de Designación
                        </h3>
                        <span style="font-size: 0.75rem; color: var(--accent-red); font-weight: 700;">
                            DOCUMENTO OFICIAL VALIDADOR
                        </span>
                    </div>
                </div>
                <button class="modal-close-btn" onclick="ResolutionModal.close()">&times;</button>
            </div>

            <!-- Resolution Document Body (Official Template) -->
            <div id="printable-resolution" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 28px; background: #ffffff; font-family: 'Times New Roman', serif; font-size: 0.95rem; line-height: 1.6; color: #0f172a;">
                
                <div style="text-align: center; border-bottom: 2px solid #003366; padding-bottom: 12px; margin-bottom: 18px;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: #003366;">UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO</div>
                    <div style="font-size: 0.85rem; font-weight: 600; color: #c00000;">FACULTAD DE INGENIERÍA EN CIENCIAS DE LA COMPUTACIÓN Y TELECOMUNICACIONES</div>
                    <div style="font-size: 0.8rem; font-weight: 700; color: #475569;">DIRECCIÓN DE CARRERA DE INGENIERÍA EN SISTEMAS</div>
                    <div style="font-family: var(--font-sans); font-size: 0.9rem; font-weight: 800; color: #003366; margin-top: 8px;">
                        RESOLUCIÓN ADMINISTRATIVA N° ${numeroResolucion || 'RA-FICCT-0482/2026'}
                    </div>
                    <div style="font-size: 0.75rem; color: #64748b;">Santa Cruz de la Sierra, ${fechaHoy}</div>
                </div>

                <div style="margin-bottom: 14px; text-align: justify;">
                    <strong>VISTOS:</strong> La solicitud y el perfil de grado presentado por el estudiante postulante <strong>${estudianteNombre || 'Molina Cortez Maikol Anthony'}</strong> con Registro Universitario N° <strong>220011559</strong>, titulado <em>"Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning"</em>, debidamente validado por el Centro de Procesamiento de Datos (CPD) y el motor semántico institucional.
                </div>

                <div style="margin-bottom: 14px; text-align: justify;">
                    <strong>CONSIDERANDO:</strong> Que el Reglamento de Modalidades de Graduación de la FICCT faculta a la Dirección de Carrera a designar al Docente Asesor/Tutor en concordancia con el área de investigación, especialidad técnica demostrada y balanceo equitativo de plazas docentes.
                </div>

                <div style="margin-bottom: 18px; text-align: justify;">
                    <strong>RESUELVE:</strong><br>
                    <strong>ARTÍCULO PRIMERO.-</strong> DESIGNAR formalmente al docente:
                    <div style="text-align: center; font-size: 1.05rem; font-weight: 700; color: #003366; margin: 8px 0; background: #f1f5f9; padding: 8px; border-radius: 6px;">
                        ${docenteNombre || 'Ing. Rolando Antoni Martínez Canedo'}
                    </div>
                    en calidad de <strong>DOCENTE TUTOR / ASESOR</strong> del mencionado proyecto de grado durante el Semestre Académico II-2026.<br><br>
                    <strong>ARTÍCULO SEGUNDO.-</strong> Notificar a las partes interesadas y remitir copia digital al sistema centralizado de la FICCT para el control de avance por capítulos y cronograma de defensa.
                </div>

                <!-- Signatures Block -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; text-align: center; margin-top: 36px; padding-top: 16px;">
                    <div>
                        <div style="border-bottom: 1px dashed #94a3b8; width: 80%; margin: 0 auto 6px auto;"></div>
                        <div style="font-size: 0.85rem; font-weight: 700;">M.Sc. Ing. Leonardo Vargas Peña</div>
                        <div style="font-size: 0.75rem; color: #64748b;">Director Carrera Ing. Sistemas</div>
                        <div style="font-size: 0.7rem; color: #003366; font-family: monospace;">Firma Digital: FICCT-DIR-LEO-2026</div>
                    </div>
                    <div>
                        <div style="border-bottom: 1px dashed #94a3b8; width: 80%; margin: 0 auto 6px auto;"></div>
                        <div style="font-size: 0.85rem; font-weight: 700;">${docenteNombre || 'Ing. Rolando Antoni Martínez Canedo'}</div>
                        <div style="font-size: 0.75rem; color: #64748b;">Docente Tutor Designado</div>
                        <div style="font-size: 0.7rem; color: #003366; font-family: monospace;">Aceptación: DIGITAL-OK-2026</div>
                    </div>
                </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                <button class="btn btn-secondary" onclick="ResolutionModal.close()">Cerrar</button>
                <button class="btn btn-primary" onclick="ResolutionModal.print()">
                    🖨️ Imprimir / Guardar PDF
                </button>
            </div>
        `;

        modalContainer.classList.remove('hidden');
    },

    close() {
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) modalContainer.classList.add('hidden');
    },

    print() {
        window.print();
    }
};

window.ResolutionModal = ResolutionModal;
