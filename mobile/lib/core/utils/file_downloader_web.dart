// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html' as html;

/// Web implementation of direct file download and tab opening
void downloadFileWeb(String url, String filename) {
  try {
    final anchor = html.AnchorElement(href: url)
      ..setAttribute('download', filename)
      ..target = '_blank'
      ..style.display = 'none';
    html.document.body?.children.add(anchor);
    anchor.click();
    anchor.remove();
  } catch (e) {
    html.window.open(url, '_blank');
  }
}

void openFileWeb(String url) {
  try {
    html.window.open(url, '_blank');
  } catch (_) {}
}
