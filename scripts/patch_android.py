"""Run after `npx cap add android`: injects the widget, plugin, permissions and app icon."""
import os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN = os.path.join(ROOT, "android", "app", "src", "main")
PKG_DIR = os.path.join(MAIN, "java", "com", "attendance", "app")
if not os.path.isdir(PKG_DIR):
    sys.exit("android project not found - run `npx cap add android` first")

# 1) Java sources (MainActivity is replaced so it registers the widget plugin)
for f in os.listdir(os.path.join(ROOT, "overlay", "java")):
    shutil.copy(os.path.join(ROOT, "overlay", "java", f), os.path.join(PKG_DIR, f))

# 2) Widget resources
for sub in ("layout", "drawable", "xml"):
    dst = os.path.join(MAIN, "res", sub)
    os.makedirs(dst, exist_ok=True)
    for f in os.listdir(os.path.join(ROOT, "overlay", "res", sub)):
        shutil.copy(os.path.join(ROOT, "overlay", "res", sub, f), os.path.join(dst, f))

# 3) Manifest: widget receiver + notification permission
mpath = os.path.join(MAIN, "AndroidManifest.xml")
m = open(mpath, encoding="utf8").read()
if "AttendanceWidgetProvider" not in m:
    receiver = """
        <receiver android:name=".AttendanceWidgetProvider" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/attendance_widget_info" />
        </receiver>
    """
    m = m.replace("</application>", receiver + "</application>")
for permission in (
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.RECEIVE_BOOT_COMPLETED",
):
    if permission not in m:
        m = m.replace("</manifest>", f'    <uses-permission android:name="{permission}" />\n</manifest>')
open(mpath, "w", encoding="utf8").write(m)

# 4) Launcher icon from icon.png (replaces the default Capacitor icon)
try:
    from PIL import Image
    src = Image.open(os.path.join(ROOT, "icon.png")).convert("RGBA")
    sizes = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
    for d, px in sizes.items():
        folder = os.path.join(MAIN, "res", "mipmap-" + d)
        os.makedirs(folder, exist_ok=True)
        img = src.resize((px, px), Image.LANCZOS)
        for name in ("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"):
            img.save(os.path.join(folder, name))
    shutil.rmtree(os.path.join(MAIN, "res", "mipmap-anydpi-v26"), ignore_errors=True)
except ImportError:
    print("Pillow missing - keeping default icon (pip install pillow)")
print("patched OK")
