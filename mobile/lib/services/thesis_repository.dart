import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/utils/file_helper.dart';
import '../models/draft_model.dart';
import '../models/observation_model.dart';
import '../models/thesis_model.dart';

/// Repositorio Central Reactivo y Persistente SIS-GradMatch
/// Sincroniza en Tiempo Real con el Backend FastAPI (/api/v1/thesis/...) y SharedPreferences
/// Desarrollador Único: Molina Cortez Maikol Anthony (Reg. 220011559)
/// Modalidad de Graduación: Proyecto de Grado (Plan 187-3, 56 materias vencidas)

class ThesisRepository extends ChangeNotifier {
  static final ThesisRepository instance = ThesisRepository._internal();
  ThesisRepository._internal() {
    init();
  }

  static const String _storageKey = 'sis_gradmatch_mobile_thesis_v3';
  late ThesisModel _thesis = ThesisModel.sampleStudentMolina();
  bool _initialized = false;

  ThesisModel get thesis => _thesis;
  bool get isInitialized => _initialized;

  /// Inicializa cargando desde el servidor FastAPI y con respaldo local en SharedPreferences
  Future<void> init() async {
    // 1. Cargar primero de SharedPreferences para respuesta instantánea
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedJson = prefs.getString(_storageKey);
      if (savedJson != null && savedJson.isNotEmpty) {
        final decoded = jsonDecode(savedJson) as Map<String, dynamic>;
        _thesis = ThesisModel.fromJson(decoded);
      }
    } catch (e) {
      debugPrint('Error leyendo SharedPreferences local: $e');
    }

    _initialized = true;
    notifyListeners();

    // 2. Sincronizar de forma asíncrona con el servidor backend central
    await refreshFromServer();
  }

  /// Refresca el estado consultando al backend /api/v1/thesis/current
  Future<void> refreshFromServer() async {
    try {
      final url = Uri.parse('${FileHelper.baseServerUrl}/api/v1/thesis/current');
      final res = await http.get(url).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final decoded = jsonDecode(res.body) as Map<String, dynamic>;
        _thesis = ThesisModel.fromJson(decoded);
        await _saveLocal();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Aviso: Backend offline o timeout al refrescar tesis ($e)');
    }
  }

  Future<void> _saveLocal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = jsonEncode(_thesis.toJson());
      await prefs.setString(_storageKey, encoded);
    } catch (e) {
      debugPrint('Error guardando SharedPreferences: $e');
    }
  }

  /// Sube físicamente un archivo al servidor FastAPI (/api/v1/storage/upload)
  Future<Map<String, dynamic>?> uploadPhysicalFile(Uint8List bytes, String filename) async {
    try {
      final uploadUrl = Uri.parse('${FileHelper.baseServerUrl}/api/v1/storage/upload');
      final request = http.MultipartRequest('POST', uploadUrl);
      request.files.add(
        http.MultipartFile.fromBytes(
          'file',
          bytes,
          filename: filename,
        ),
      );

      final streamedResponse = await request.send();
      if (streamedResponse.statusCode == 200) {
        final resStr = await streamedResponse.stream.bytesToString();
        final data = jsonDecode(resStr) as Map<String, dynamic>;
        return data;
      } else {
        debugPrint('Upload failed with status: ${streamedResponse.statusCode}');
      }
    } catch (e) {
      debugPrint('Error uploading file to server: $e');
    }
    return null;
  }

  /// Agrega un nuevo entregable completo al inicio de la lista y lo sincroniza con el servidor
  Future<void> addDeliverable(ChapterDraft newDraft) async {
    final updatedList = List<ChapterDraft>.from(_thesis.chapters);
    final existingIndex = updatedList.indexWhere((c) => c.id == newDraft.id);
    if (existingIndex >= 0) {
      updatedList[existingIndex] = newDraft;
    } else {
      updatedList.insert(0, newDraft);
    }

    _thesis = _thesis.copyWith(
      chapters: updatedList,
      status: 'EN_REVISION',
    );

    await _saveLocal();
    notifyListeners();

    // Sincronizar con el servidor backend
    try {
      final url = Uri.parse('${FileHelper.baseServerUrl}/api/v1/thesis/deliverable');
      await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(newDraft.toJson()),
      ).timeout(const Duration(seconds: 4));
    } catch (e) {
      debugPrint('Error sincronizando entregable con servidor: $e');
    }
  }

  /// Actualiza rápidamente el archivo principal de un entregable existente
  Future<void> quickUpdateChapterFile(
    int chapterId, {
    required String fileName,
    required String fileSize,
    required String fileUrl,
    List<ComplementaryFile>? compFiles,
  }) async {
    ChapterDraft? updatedDraft;

    final updatedList = _thesis.chapters.map((ch) {
      if (ch.id == chapterId) {
        updatedDraft = ch.copyWith(
          mainFileName: fileName,
          mainFileSize: fileSize,
          mainFileUrl: fileUrl,
          version: ch.version + 1,
          status: 'EN_REVISION',
          complementaryFiles: compFiles ?? ch.complementaryFiles,
        );
        return updatedDraft!;
      }
      return ch;
    }).toList();

    _thesis = _thesis.copyWith(chapters: updatedList, status: 'EN_REVISION');
    await _saveLocal();
    notifyListeners();

    // Sincronizar con el servidor backend
    if (updatedDraft != null) {
      try {
        final url = Uri.parse('${FileHelper.baseServerUrl}/api/v1/thesis/deliverable');
        await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(updatedDraft!.toJson()),
        ).timeout(const Duration(seconds: 4));
      } catch (e) {
        debugPrint('Error sincronizando actualización rápida con servidor: $e');
      }
    }
  }

  /// Actualiza los datos de postulación del perfil (título, resumen, archivo PDF)
  Future<void> updateProfile({
    required String title,
    String? abstract,
    String? fileName,
    String? fileSize,
    Uint8List? fileBytes,
  }) async {
    String? fileUrl;
    if (fileBytes != null && fileName != null) {
      final uploadRes = await uploadPhysicalFile(fileBytes, fileName);
      if (uploadRes != null) {
        fileUrl = uploadRes['url'] as String?;
        fileName = uploadRes['filename'] as String? ?? fileName;
        fileSize = uploadRes['size'] as String? ?? fileSize;
      }
    }

    _thesis = _thesis.copyWith(
      title: title,
    );

    await _saveLocal();
    notifyListeners();

    // Sincronizar con el servidor backend
    try {
      final url = Uri.parse('${FileHelper.baseServerUrl}/api/v1/thesis/profile');
      await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'title': title,
          'abstract': abstract ?? '',
          'fileName': fileName,
          'fileUrl': fileUrl,
          'fileSize': fileSize,
        }),
      ).timeout(const Duration(seconds: 4));
    } catch (e) {
      debugPrint('Error sincronizando perfil con servidor: $e');
    }
  }

  /// Agrega una observación emitida por el tutor
  Future<void> addObservation(int deliverableId, ObservationModel obs) async {
    final updatedList = _thesis.chapters.map((ch) {
      if (ch.id == deliverableId) {
        final updatedObs = List<ObservationModel>.from(ch.observations)..add(obs);
        return ch.copyWith(
          observations: updatedObs,
          status: 'OBSERVADO',
        );
      }
      return ch;
    }).toList();

    final allActiveObs = List<ObservationModel>.from(_thesis.activeObservations)..add(obs);

    _thesis = _thesis.copyWith(
      chapters: updatedList,
      activeObservations: allActiveObs,
      status: 'OBSERVADO',
    );

    await _saveLocal();
    notifyListeners();

    // Sincronizar con el servidor backend
    try {
      final url = Uri.parse('${FileHelper.baseServerUrl}/api/v1/thesis/observation');
      await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'deliverableId': deliverableId,
          'observation': obs.toJson(),
        }),
      ).timeout(const Duration(seconds: 4));
    } catch (e) {
      debugPrint('Error sincronizando observación con servidor: $e');
    }
  }
}
