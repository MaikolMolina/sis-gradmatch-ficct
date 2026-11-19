/**
 * SIS-GradMatch: Main Web Application Orchestrator
 * Desarrollador Único: Molina Cortez Maikol Anthony
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Initialize State Store (from persistent localStorage or defaults)
        Store.init();

        // 2. Initialize Navbar & Sidebar navigation
        NavbarComponent.init();

        // 3. Main View Renderer Function
        const renderActiveView = async () => {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) return;

            const role = Store.state.activeRole || (Store.state.currentUser ? Store.state.currentUser.role : 'ESTUDIANTE');
            const view = Store.state.activeView || Store.state.currentView || (role === 'ESTUDIANTE' ? 'student-timeline' : (role === 'DOCENTE_TUTOR' ? 'tutor-inbox' : 'director-kpis'));

            try {
                if (role === 'DIRECTOR_CARRERA' || role === 'ADMIN') {
                    await DirectorView.render(view, mainContent);
                } else if (role === 'DOCENTE_TUTOR') {
                    await TutorView.render(view, mainContent);
                } else if (role === 'ESTUDIANTE') {
                    await StudentView.render(view, mainContent);
                }
            } catch (renderError) {
                console.error('Error renderizando vista:', renderError);
                mainContent.innerHTML = `
                    <div class="card" style="margin: 20px 0; border-left: 4px solid var(--accent-red);">
                        <h3 style="color: var(--accent-red); margin-bottom: 8px;">Aviso de Inicialización de Módulo</h3>
                        <p style="color: var(--text-secondary);">${renderError.message}</p>
                        <button class="btn btn-primary btn-sm" style="margin-top: 12px;" onclick="Store.setView(Store.state.activeView)">
                            Reintentar Carga
                        </button>
                    </div>
                `;
            }
        };

        // 4. Subscribe to Store State Changes
        Store.subscribe((state) => {
            NavbarComponent.renderUserMeta();
            NavbarComponent.renderSidebar();
            renderActiveView();
        });

        // 5. Initial View Render immediately (Instant UI Response)
        await renderActiveView();

        // 6. Asynchronous Non-blocking Backend Health Check
        ApiService.checkHealth().catch(err => {
            console.warn('Backend health check async result:', err);
        });

        // 7. Global Keyboard Event Listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ResolutionModal.close();
            }
        });

        console.log('SIS-GradMatch Web App Inicializada Exitosamente. Desarrollador: Molina Cortez Maikol Anthony');
    } catch (globalError) {
        console.error('Fatal initialization error:', globalError);
        const mc = document.getElementById('main-content');
        if (mc) {
            mc.innerHTML = `<div class="card" style="border-left: 4px solid var(--accent-red);"><h3 style="color: var(--accent-red);">Error al inicializar la aplicación</h3><p>${globalError.message}</p></div>`;
        }
    }
});
