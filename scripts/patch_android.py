"""Run after `npx cap add android`: injects the widget, permissions, icon and version."""
import json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN = os.path.join(ROOT, "android", "app", "src", "main")
PKG_DIR = os.path.join(MAIN, "java", "com", "attendance", "app")
if not os.path.isdir(PKG_DIR):
    sys.exit("android project not found - run `npx cap add android` first")

# 1) Keep the generated APK version aligned with package.json.
with open(os.path.join(ROOT, "package.json"), encoding="utf8") as f:
    version = json.load(f).get("version", "")
match = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)", version)
if not match:
    sys.exit(f"package.json version must be numeric major.minor.patch, got {version!r}")
major, minor, patch = (int(part) for part in match.groups())
version_code = major * 10000 + minor * 100 + patch
gradle_path = os.path.join(ROOT, "android", "app", "build.gradle")
with open(gradle_path, encoding="utf8") as f:
    gradle = f.read()
gradle, code_count = re.subn(r"(?m)^(\s*versionCode\s+)\d+\s*$", rf"\g<1>{version_code}", gradle, count=1)
gradle, name_count = re.subn(r'(?m)^(\s*versionName\s+")[^"]*("\s*)$', rf"\g<1>{version}\2", gradle, count=1)
if code_count != 1 or name_count != 1:
    sys.exit("could not set Android versionCode and versionName in android/app/build.gradle")

# 2) Use the same Android certificate that Firebase OAuth is configured for.
if "storeFile file('../../keystore/debug.keystore')" not in gradle:
    signing_config = """
    signingConfigs {
        debug {
            storeFile file('../../keystore/debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
"""
    gradle, signing_count = re.subn(
        r"(?m)^android[ \t]*\{[ \t]*$",
        lambda match: match.group(0) + signing_config,
        gradle,
        count=1,
    )
    if signing_count != 1:
        sys.exit("could not set the stable Android debug signing key")
if "signingConfig signingConfigs.debug" not in gradle:
    gradle, build_types_count = re.subn(
        r"(?m)^([ \t]*buildTypes[ \t]*\{)[ \t]*$",
        r"\1\n        debug {\n            signingConfig signingConfigs.debug\n        }",
        gradle,
        count=1,
    )
    if build_types_count != 1:
        sys.exit("could not apply the stable signing key to Android debug builds")
with open(gradle_path, "w", encoding="utf8") as f:
    f.write(gradle)

# 3) Java sources (MainActivity is replaced so it registers the widget plugin)
for f in os.listdir(os.path.join(ROOT, "overlay", "java")):
    shutil.copy(os.path.join(ROOT, "overlay", "java", f), os.path.join(PKG_DIR, f))

# 4) Widget resources
for sub in ("layout", "drawable", "xml"):
    dst = os.path.join(MAIN, "res", sub)
    os.makedirs(dst, exist_ok=True)
    for f in os.listdir(os.path.join(ROOT, "overlay", "res", sub)):
        shutil.copy(os.path.join(ROOT, "overlay", "res", sub, f), os.path.join(dst, f))

# 5) Manifest: widget receiver + notification permission
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

# 6) Launcher icon from icon.png (replaces the default Capacitor icon)
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
except ImportError as error:
    sys.exit(f"Pillow is required to generate the Classmark launcher icon: {error}")
print("patched OK")
