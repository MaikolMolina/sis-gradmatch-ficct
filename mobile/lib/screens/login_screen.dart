import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';
import 'director/director_dashboard_screen.dart';
import 'tutor/tutor_workspace_screen.dart';
import 'student/student_home_screen.dart';

/// Pantalla de Inicio de Sesión y Selector Rápido de Roles Demo
/// Desarrollador Único: Molina Cortez Maikol Anthony
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _auth = AuthService();
  String _selectedUsername = 'director.sistemas';

  void _navigateToDashboard(AppUser user) {
    Widget nextScreen;
    if (user.role == UserRole.director || user.role == UserRole.admin) {
      nextScreen = const DirectorDashboardScreen();
    } else if (user.role == UserRole.tutor) {
      nextScreen = const TutorWorkspaceScreen();
    } else {
      nextScreen = const StudentHomeScreen();
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => nextScreen),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surfaceBg,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // App Icon & Brand
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryLight,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFC7DBE8)),
                    ),
                    child: const Center(
                      child: Text('🎓', style: TextStyle(fontSize: 36)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'SIS-GradMatch',
                    style: Theme.of(context).textTheme.displayMedium?.copyWith(
                          color: AppTheme.primaryBlue,
                        ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Facultad de Ingeniería en Ciencias de la Computación - UAGRM',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.accentRed,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Quick Demo Switch Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'SIMULAR USUARIO DEMO:',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textSecondary,
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ...AuthService.demoUsers.map((user) {
                            final isSelected = _selectedUsername == user.username;
                            return Card(
                              color: isSelected ? AppTheme.primaryLight : Colors.transparent,
                              elevation: 0,
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                                side: BorderSide(
                                  color: isSelected ? AppTheme.primaryBlue : AppTheme.borderColor,
                                  width: isSelected ? 1.5 : 1,
                                ),
                              ),
                              child: ListTile(
                                dense: true,
                                leading: CircleAvatar(
                                  radius: 16,
                                  backgroundColor: isSelected ? AppTheme.primaryBlue : const Color(0xFFE2E8F0),
                                  child: Text(
                                    user.avatar,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: isSelected ? Colors.white : AppTheme.textSecondary,
                                    ),
                                  ),
                                ),
                                title: Text(
                                  user.name,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                                    color: AppTheme.textPrimary,
                                  ),
                                ),
                                subtitle: Text(
                                  user.roleDisplayName,
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isSelected ? AppTheme.accentRed : AppTheme.textMuted,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                trailing: isSelected
                                    ? const Icon(Icons.check_circle, color: AppTheme.primaryBlue, size: 20)
                                    : null,
                                onTap: () {
                                  setState(() {
                                    _selectedUsername = user.username;
                                  });
                                },
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () {
                      _auth.selectDemoUser(_selectedUsername);
                      final user = _auth.currentUser;
                      if (user != null) {
                        _navigateToDashboard(user);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Ingresar al Sistema'),
                        SizedBox(width: 8),
                        Icon(Icons.arrow_forward, size: 18),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),
                  // Sole developer signature
                  const Center(
                    child: Column(
                      children: [
                        Text(
                          'DESARROLLADOR ÚNICO',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primaryBlue,
                            letterSpacing: 1,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Molina Cortez Maikol Anthony',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        Text(
                          'Ingeniería de Software II • II-2026',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
