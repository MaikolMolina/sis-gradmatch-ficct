/// Modelo de Usuario SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony
enum UserRole {
  director,
  tutor,
  estudiante,
  admin,
}

class AppUser {
  final String username;
  final String name;
  final UserRole role;
  final String email;
  final String avatar;
  final String? registro;
  final String? department;

  const AppUser({
    required this.username,
    required this.name,
    required this.role,
    required this.email,
    required this.avatar,
    this.registro,
    this.department,
  });

  String get roleDisplayName {
    switch (role) {
      case UserRole.director:
        return 'Director de Carrera';
      case UserRole.tutor:
        return 'Docente Tutor';
      case UserRole.estudiante:
        return 'Estudiante Postulante';
      case UserRole.admin:
        return 'Administrador TI';
    }
  }

  factory AppUser.fromJson(Map<String, dynamic> json) {
    UserRole roleEnum = UserRole.estudiante;
    final r = json['rol'] ?? json['role'] ?? '';
    if (r.toString().toUpperCase().contains('DIRECTOR')) {
      roleEnum = UserRole.director;
    } else if (r.toString().toUpperCase().contains('DOCENTE') || r.toString().toUpperCase().contains('TUTOR')) {
      roleEnum = UserRole.tutor;
    } else if (r.toString().toUpperCase().contains('ADMIN')) {
      roleEnum = UserRole.admin;
    }

    return AppUser(
      username: json['username'] ?? '',
      name: json['nombre_completo'] ?? json['name'] ?? '',
      role: roleEnum,
      email: json['email'] ?? '',
      avatar: json['avatar'] ?? 'US',
      registro: json['registro'],
      department: json['departamento'] ?? json['department'],
    );
  }
}
