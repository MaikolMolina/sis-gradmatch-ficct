import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sis_gradmatch_mobile/main.dart';
import 'package:sis_gradmatch_mobile/services/auth_service.dart';

void main() {
  testWidgets('SIS-GradMatch Mobile Smoke Test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await AuthService().init();

    // Build our app and trigger a frame.
    await tester.pumpWidget(const SisGradMatchApp());
    await tester.pumpAndSettle();

    // Verify that the login screen renders with SIS-GradMatch title
    expect(find.text('SIS-GradMatch'), findsOneWidget);
    expect(find.text('Ingresar al Sistema'), findsOneWidget);
  });
}
