import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../core/constants/api_constants.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

const AndroidNotificationChannel ficctChannel = AndroidNotificationChannel(
  'ficct_gradmatch_channel',
  'Notificaciones de Grado FICCT',
  description: 'Canal oficial de alertas, avances y dictámenes de grado FICCT UAGRM',
  importance: Importance.max,
  playSound: true,
  enableVibration: true,
);

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    await Firebase.initializeApp();
    debugPrint("[FCM Background] Mensaje recibido: ${message.messageId}");
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

  final ValueNotifier<List<NotificationItem>> notificationsNotifier =
      ValueNotifier<List<NotificationItem>>([]);
  final ValueNotifier<int> unreadCountNotifier = ValueNotifier<int>(0);
  final ValueNotifier<String> connectionStatus =
      ValueNotifier<String>("Iniciando...");

  String? fcmToken;
  Timer? _pollingTimer;
  bool _initialized = false;

  Future<void> init(BuildContext? context) async {
    if (_initialized) return;
    _initialized = true;

    try {
      // 1. Inicializar canal local de Android para mostrar notificaciones en la barra de estado
      const AndroidInitializationSettings androidSettings =
          AndroidInitializationSettings('@mipmap/ic_launcher');
      const InitializationSettings initSettings =
          InitializationSettings(android: androidSettings);

      await flutterLocalNotificationsPlugin.initialize(
        settings: initSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          debugPrint("[LocalNotif] Notificación tocada en el teléfono: ${response.payload}");
        },
      );

      // Crear canal de alta prioridad en el sistema Android
      final androidPlugin = flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      if (androidPlugin != null) {
        await androidPlugin.createNotificationChannel(ficctChannel);
        await androidPlugin.requestNotificationsPermission();
      }

      // 2. Inicializar Firebase Core
      await Firebase.initializeApp();
      connectionStatus.value = "Firebase Conectado";
      debugPrint("[FCM] Firebase.initializeApp() exitoso.");

      // 3. Registrar Background Handler
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // 4. Solicitar permiso explícito al usuario en Android 13+ y iOS
      final settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );
      debugPrint("[FCM] Permiso de notificaciones: ${settings.authorizationStatus}");

      // 5. Configurar opciones de presentación en primer plano
      await FirebaseMessaging.instance.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // 6. Suscribirse al topic oficial "ficct_gradmatch"
      await FirebaseMessaging.instance.subscribeToTopic('ficct_gradmatch');
      debugPrint("[FCM] Suscrito exitosamente al topic 'ficct_gradmatch'");
      connectionStatus.value = "Suscrito a ficct_gradmatch";

      // 7. Obtener token único de FCM para este celular
      try {
        fcmToken = await FirebaseMessaging.instance.getToken();
        debugPrint("[FCM Token Celular] $fcmToken");
        if (fcmToken != null) {
          await registerTokenWithBackend(fcmToken!);
        }
      } catch (tokenErr) {
        debugPrint("[FCM Token Error] $tokenErr");
      }

      // 8. Escuchar mensajes que llegan mientras la app está abierta (Primer Plano)
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint("[FCM Foreground] Mensaje recibido: ${message.notification?.title}");
        final title = message.notification?.title ?? message.data['title'] ?? "Aviso de Grado FICCT";
        final body = message.notification?.body ?? message.data['body'] ?? "Tienes una actualización en tu expediente.";

        // Mostrar notificación nativa en la barra superior del celular
        showNativeSystemNotification(
          id: message.hashCode,
          title: title,
          body: body,
        );

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
      });

      // 9. Manejar toque de notificación cuando la app estaba en segundo plano
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint("[FCM Opened] Notificación tocada en segundo plano: ${message.data}");
      });

    } catch (e) {
      debugPrint("[FCM Init Warning] $e");
      connectionStatus.value = "Sincronización Cloud Activa";
    }

    // 10. Cargar historial y mantener sondeo en segundo plano
    await fetchHistory();
    _startPeriodicSync();
  }

  /// Dispara una notificación nativa visible en la barra de estado del teléfono
  Future<void> showNativeSystemNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    try {
      final androidDetails = AndroidNotificationDetails(
        ficctChannel.id,
        ficctChannel.name,
        channelDescription: ficctChannel.description,
        icon: '@mipmap/ic_launcher',
        importance: Importance.max,
        priority: Priority.high,
        playSound: true,
        enableVibration: true,
        styleInformation: BigTextStyleInformation(body),
      );

      final platformDetails = NotificationDetails(android: androidDetails);
      await flutterLocalNotificationsPlugin.show(
        id: id,
        title: title,
        body: body,
        notificationDetails: platformDetails,
      );
    } catch (e) {
      debugPrint("[Native System Notification Error] $e");
    }
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
      debugPrint("[FCM] Token registrado exitosamente en el backend.");
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
        unreadCountNotifier.value =
            data['unread_count'] ?? list.where((n) => !n.read).length;
      }
    } catch (e) {
      debugPrint("[Notification Fetch History Error] $e");
    }
  }

  Future<bool> sendTestPush({required String title, required String body}) async {
    try {
      // Disparar inmediatamente notificación en la barra del teléfono para comprobación visual
      await showNativeSystemNotification(
        id: DateTime.now().millisecondsSinceEpoch % 100000,
        title: title,
        body: body,
      );

      // Despachar a FCM en la nube
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
