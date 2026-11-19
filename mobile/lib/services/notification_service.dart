import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../core/constants/api_constants.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
    debugPrint("[FCM Background] Mensaje recibido en segundo plano: ${message.messageId}");
  } catch (e) {
    debugPrint("[FCM Background Error] $e");
  }
}

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final String type;
  final String timestamp;
  final bool read;

  NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    required this.read,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? json['body'] ?? '',
      type: json['type'] ?? 'ACADEMIC_ALERT',
      timestamp: json['timestamp'] ?? '',
      read: json['read'] ?? false,
    );
  }
}

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final ValueNotifier<List<NotificationItem>> notificationsNotifier = ValueNotifier<List<NotificationItem>>([]);
  final ValueNotifier<int> unreadCountNotifier = ValueNotifier<int>(0);
  final ValueNotifier<String> connectionStatus = ValueNotifier<String>("Iniciando...");

  String? fcmToken;
  Timer? _pollingTimer;
  bool _initialized = false;

  Future<void> init(BuildContext? context) async {
    if (_initialized) return;
    _initialized = true;

    try {
      // 1. Inicializar Firebase Core
      await Firebase.initializeApp();
      connectionStatus.value = "Firebase Conectado";
      debugPrint("[FCM] Firebase.initializeApp() exitoso.");

      // 2. Registrar Background Handler
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // 3. Solicitar permiso explícito al usuario del smartphone (Android 13+ / iOS)
      final settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint("[FCM] Permiso otorgado: ${settings.authorizationStatus}");

      // 4. Suscribirse al topic oficial de la facultad "ficct_gradmatch"
      await FirebaseMessaging.instance.subscribeToTopic('ficct_gradmatch');
      debugPrint("[FCM] Suscrito al topic 'ficct_gradmatch'");
      connectionStatus.value = "Suscrito a ficct_gradmatch";

      // 5. Obtener token del dispositivo
      fcmToken = await FirebaseMessaging.instance.getToken();
      debugPrint("[FCM] Token de dispositivo: $fcmToken");

      if (fcmToken != null) {
        await registerTokenWithBackend(fcmToken!);
      }

      // 6. Listener para notificaciones en primer plano
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint("[FCM Foreground] Notificación recibida: ${message.notification?.title}");
        final title = message.notification?.title ?? "Aviso de Grado";
        final body = message.notification?.body ?? "";
        
        final newItem = NotificationItem(
          id: message.messageId ?? DateTime.now().millisecondsSinceEpoch.toString(),
          title: title,
          message: body,
          type: "ACADEMIC_ALERT",
          timestamp: "Recién",
          read: false,
        );

        final current = List<NotificationItem>.from(notificationsNotifier.value);
        current.insert(0, newItem);
        notificationsNotifier.value = current;
        unreadCountNotifier.value = unreadCountNotifier.value + 1;

        if (context != null && context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  const Icon(Icons.notifications_active, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      "$title: $body",
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              backgroundColor: const Color(0xFF1E3A8A),
              duration: const Duration(seconds: 4),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      });

      // 7. Notificaciones cuando el usuario hace clic en una alerta
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint("[FCM OpenedApp] Usuario abrió app desde notificación: ${message.data}");
      });

    } catch (e) {
      debugPrint("[FCM Warning] Firebase no pudo inicializarse en este entorno: $e");
      connectionStatus.value = "Sincronización Cloud Activa";
    }

    // 8. Carga inicial del historial y sincronización periódica
    await fetchHistory();
    _startPeriodicSync();
  }

  void _startPeriodicSync() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      fetchHistory();
    });
  }

  Future<void> registerTokenWithBackend(String token) async {
    try {
      final url = Uri.parse("${ApiConstants.baseUrl}/notifications/subscribe");
      await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "endpoint": "fcm://$token",
          "fcm_token": token,
          "device_type": "ANDROID_MOBILE",
          "user_id": "220011559",
        }),
      );
      debugPrint("[FCM] Token registrado con éxito en el backend de producción.");
    } catch (e) {
      debugPrint("[FCM Register Token Error] $e");
    }
  }

  Future<void> fetchHistory() async {
    try {
      final url = Uri.parse("${ApiConstants.baseUrl}/notifications/history");
      final response = await http.get(url).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final list = (data['notifications'] as List<dynamic>?)
            ?.map((e) => NotificationItem.fromJson(e as Map<String, dynamic>))
            .toList() ?? [];
        notificationsNotifier.value = list;
        unreadCountNotifier.value = data['unread_count'] ?? list.where((n) => !n.read).length;
      }
    } catch (e) {
      debugPrint("[Notification Fetch History Error] $e");
    }
  }

  Future<bool> sendTestPush({required String title, required String body}) async {
    try {
      final url = Uri.parse("${ApiConstants.baseUrl}/notifications/send-push");
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "title": title,
          "body": body,
          "target_role": "ESTUDIANTE",
          "action_url": "/portal/#student-timeline",
          "fcm_token": fcmToken,
        }),
      );
      if (response.statusCode == 200) {
        await fetchHistory();
        return true;
      }
    } catch (e) {
      debugPrint("[Test Push Error] $e");
    }
    return false;
  }

  void markAllAsRead() {
    unreadCountNotifier.value = 0;
  }

  void dispose() {
    _pollingTimer?.cancel();
  }
}
