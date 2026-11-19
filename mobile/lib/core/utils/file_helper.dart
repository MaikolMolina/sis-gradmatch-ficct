import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import 'file_downloader_stub.dart'
    if (dart.library.html) 'file_downloader_web.dart';

/// Utilidades de Manejo y Apertura de Archivos para SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony
/// Modalidad de Graduación: Proyecto de Grado (Plan 187-3)

class FileHelper {
  static String get baseServerUrl {
    if (kIsWeb) {
      final origin = Uri.base.origin;
      if (origin.isNotEmpty && origin != 'null') {
        return origin;
      }
    }
    return defaultTargetPlatform == TargetPlatform.android
        ? 'http://10.0.2.2:8000'
        : 'http://127.0.0.1:8000';
  }

  static String getFullUrl(String url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    final cleanPath = url.startsWith('/') ? url : '/$url';
    return '$baseServerUrl$cleanPath';
  }

  static String getDownloadUrl(String filename) {
    final cleanName = filename.replaceAll(' ', '_');
    return '$baseServerUrl/api/v1/storage/download/$cleanName?name=${Uri.encodeComponent(filename)}';
  }

  static String getViewUrl(String filename) {
    final cleanName = filename.replaceAll(' ', '_');
    return '$baseServerUrl/api/v1/storage/view/$cleanName';
  }

  static Future<bool> openOrDownloadFile(String url, {bool isDownload = false, String? filename}) async {
    final targetUrl = (isDownload && filename != null) ? getDownloadUrl(filename) : getFullUrl(url);

    if (kIsWeb) {
      if (isDownload) {
        downloadFileWeb(targetUrl, filename ?? 'documento.pdf');
        return true;
      } else {
        openFileWeb(targetUrl);
        return true;
      }
    }

    final uri = Uri.parse(targetUrl);
    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      return launched;
    } catch (e) {
      debugPrint('Error abriendo archivo en $targetUrl: $e');
      return false;
    }
  }

  static IconData getIconForType(String type) {
    switch (type.toUpperCase()) {
      case 'PDF':
        return Icons.picture_as_pdf;
      case 'EXCEL':
      case 'XLSX':
      case 'XLS':
        return Icons.table_chart;
      case 'IMAGE':
      case 'PNG':
      case 'JPG':
        return Icons.image;
      case 'ZIP':
      case 'RAR':
      case 'COMPRESSED':
        return Icons.folder_zip;
      case 'SQL':
      case 'CODE':
        return Icons.code;
      case 'DOC':
      case 'DOCX':
        return Icons.description;
      default:
        return Icons.insert_drive_file;
    }
  }

  static Color getColorForType(String type) {
    switch (type.toUpperCase()) {
      case 'PDF':
        return AppTheme.accentRed;
      case 'EXCEL':
      case 'XLSX':
        return const Color(0xFF107C41);
      case 'IMAGE':
      case 'PNG':
        return const Color(0xFF0078D4);
      case 'ZIP':
      case 'RAR':
        return const Color(0xFFD83B01);
      case 'SQL':
      case 'CODE':
        return const Color(0xFF6B21A8);
      default:
        return AppTheme.primaryBlue;
    }
  }
}
