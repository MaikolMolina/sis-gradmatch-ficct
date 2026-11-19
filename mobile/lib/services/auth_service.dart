import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

/// Servicio de Autenticación y Manejo de Sesión SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony

class AuthService extends ChangeNotifier {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  AppUser? _currentUser;
  String? _token;

  AppUser? get currentUser => _currentUser;
  String? get token => _token;
  bool get isAuthenticated => _currentUser != null;

  static const List<AppUser> demoUsers = [
    AppUser(
      username: 'director.sistemas',
      name: 'M.Sc. Ing. Leonardo Vargas Peña',
      role: UserRole.director,
      email: 'director@ficct.uagrm.edu.bo',
      avatar: 'LV',
      department: 'Dirección de Carrera - Ing. Sistemas',
    ),
    AppUser(
      username: 'docente.martinez',
      name: 'Ing. Rolando Antoni Martínez Canedo',
      role: UserRole.tutor,
      email: 'rmartinez@ficct.uagrm.edu.bo',
      avatar: 'MC',
      department: 'Sistemas Inteligentes & Arquitectura',
    ),
    AppUser(
      username: 'docente.vargas',
      name: 'Lic. Luis Vargas Pérez',
      role: UserRole.tutor,
      email: 'lvargas@ficct.uagrm.edu.bo',
      avatar: 'LV',
      department: 'Bases de Datos & Big Data',
    ),
    AppUser(
      username: 'estudiante.molina',
      name: 'Molina Cortez Maikol Anthony',
      role: UserRole.estudiante,
      email: 'mmolina@ficct.uagrm.edu.bo',
      avatar: 'MM',
      registro: '220011559',
      department: 'Ingeniería en Sistemas',
    ),
  ];

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUsername = prefs.getString('active_user') ?? 'director.sistemas';
    selectDemoUser(savedUsername, save: false);
  }

  void selectDemoUser(String username, {bool save = true}) async {
    final user = demoUsers.firstWhere(
      (u) => u.username == username,
      orElse: () => demoUsers.first,
    );
    _currentUser = user;
    _token = 'jwt_demo_token_${user.username}';
    if (save) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('active_user', username);
    }
    notifyListeners();
  }

  void logout() {
    _currentUser = null;
    _token = null;
    notifyListeners();
  }
}
