// ignore_for_file: avoid_print
import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:sis_gradmatch_mobile/models/thesis_model.dart';
import 'package:sis_gradmatch_mobile/models/draft_model.dart';

void main() {
  test('ThesisModel serialization roundtrip', () {
    final original = ThesisModel.sampleStudentMolina();
    final jsonMap = original.toJson();
    final jsonStr = jsonEncode(jsonMap);
    final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;
    final restored = ThesisModel.fromJson(decoded);
    expect(restored.chapters.length, equals(original.chapters.length));

    // Test with newly added deliverable
    final newDraft = ChapterDraft(
      id: 999999,
      deliverableType: 'CAPITULO',
      chapterNumber: 3,
      title: 'Capítulo 3 Test',
      version: 1,
      status: 'EN_REVISION',
      mainFileName: 'Test.pdf',
      mainFileSize: '1.0 MB',
      mainFileUrl: '/storage/drafts/Test.pdf',
    );
    final updated = restored.copyWith(chapters: [newDraft, ...restored.chapters]);
    final updatedStr = jsonEncode(updated.toJson());
    final restoredUpdated = ThesisModel.fromJson(jsonDecode(updatedStr));
    expect(restoredUpdated.chapters.first.title, equals('Capítulo 3 Test'));
  });
}
