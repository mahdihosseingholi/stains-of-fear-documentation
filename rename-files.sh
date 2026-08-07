#!/usr/bin/env bash
# Stains of Fear — documentation file renaming script
# Run from: /Users/mahdihosseingholi/Desktop/Thesis/documentation/
set -e
ROOT="/Users/mahdihosseingholi/Desktop/Thesis/documentation"

echo "=== Starting rename operations ==="

# ─────────────────────────────────────────────
# 01_Preproduction / 01_Script
# ─────────────────────────────────────────────
SCRIPT="$ROOT/01_Preproduction/01_Script"
echo "[Script]"
mv "$SCRIPT/Stains_of_Fear_Eng_(1).pdf"              "$SCRIPT/script_english.pdf"
mv "$SCRIPT/Stains_of_Fear_-_Swissgerman_(1).pdf"   "$SCRIPT/script_swiss-german.pdf"

# ─────────────────────────────────────────────
# 01_Preproduction / 02_Storyboard
# ─────────────────────────────────────────────
SB="$ROOT/01_Preproduction/02_Storyboard"
echo "[Storyboard]"
mv "$SB/IMG_6033.jpeg" "$SB/storyboard_page-01.jpeg"
mv "$SB/IMG_6034.jpeg" "$SB/storyboard_page-02.jpeg"
mv "$SB/IMG_6035.jpeg" "$SB/storyboard_page-03.jpeg"
mv "$SB/IMG_6037.jpeg" "$SB/storyboard_page-04.jpeg"
mv "$SB/IMG_6038.jpeg" "$SB/storyboard_page-05.jpeg"
mv "$SB/IMG_6039.jpeg" "$SB/storyboard_page-06.jpeg"
mv "$SB/IMG_6040.jpeg" "$SB/storyboard_page-07.jpeg"

# ─────────────────────────────────────────────
# 01_Preproduction / 03_Decoupage
# ─────────────────────────────────────────────
DEC="$ROOT/01_Preproduction/03_Decoupage"
echo "[Decoupage - main PDF]"
mv "$DEC/decopage. .pdf" "$DEC/decoupage_full-document.pdf"

# 02_damage-survey frames
echo "[Decoupage - damage survey frames]"
DS="$DEC/02_damage-survey"
for n in 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55; do
  if [ -f "$DS/${n}.jpg" ]; then
    mv "$DS/${n}.jpg" "$DS/damage-survey_frame-${n}.jpg"
  fi
done

# 03_Mould-paced Decoupage
echo "[Decoupage - mould-paced frames]"
MP="$DEC/03_Mould-paced Decoupage"
for n in 01 02 03 04 05 06 07; do
  if [ -f "$MP/${n}.jpg" ]; then
    mv "$MP/${n}.jpg" "$MP/mould-paced_frame-${n}.jpg"
  fi
done

# DSCF camera files → sequential mould-paced photos
echo "[Decoupage - DSCF camera files]"
counter=1
for f in "$MP"/DSCF*.JPG; do
  [ -f "$f" ] || continue
  padded=$(printf "%02d" $counter)
  mv "$f" "$MP/mould-paced_photo-${padded}.jpg"
  counter=$((counter + 1))
done

# ─────────────────────────────────────────────
# 01_Preproduction / 04_Material Experiment
# ─────────────────────────────────────────────
MAT="$ROOT/01_Preproduction/04_Material Experiment"

# 01_Kodak E100
echo "[Material - Kodak E100]"
E100="$MAT/01_Kodak E100"
for n in $(seq 1 13); do
  padded=$(printf "%02d" $n)
  if [ -f "$E100/Kodak${n}.jpg" ]; then
    mv "$E100/Kodak${n}.jpg" "$E100/e100_test-${padded}.jpg"
  fi
done

# 02_Scala 50
echo "[Material - Scala 50]"
SCALA="$MAT/02_Scala 50"
mv "$SCALA/Adox.01.jpg" "$SCALA/scala50_test-01.jpg"
mv "$SCALA/Adox.02.jpg" "$SCALA/scala50_test-02.jpg"
mv "$SCALA/Adox.03.jpg" "$SCALA/scala50_test-03.jpg"
mv "$SCALA/Adox.04.jpg" "$SCALA/scala50_test-04.jpg"
mv "$SCALA/Adox.05.jpg" "$SCALA/scala50_test-05.jpg"

# 03_Ultramax 400 — print photos (numbered 56–62)
echo "[Material - Ultramax 400 prints]"
ULT="$MAT/03_Ultramax 400"
print_counter=1
for n in 56 57 58 59 60 61 62; do
  padded=$(printf "%02d" $print_counter)
  if [ -f "$ULT/${n}.jpg" ]; then
    mv "$ULT/${n}.jpg" "$ULT/ultramax400_print-${padded}.jpg"
  fi
  print_counter=$((print_counter + 1))
done

# 03_Ultramax 400 — IMG_#### jp2 scans
echo "[Material - Ultramax 400 scans]"
scan_counter=1
for f in "$ULT"/IMG_*.jp2; do
  [ -f "$f" ] || continue
  padded=$(printf "%02d" $scan_counter)
  mv "$f" "$ULT/ultramax400_scan-${padded}.jp2"
  scan_counter=$((scan_counter + 1))
done

# 04_Illford xp2 → 04_Ilford-XP2 (folder rename + HTML file)
echo "[Material - Ilford XP2]"
ILFORD_OLD="$MAT/04_Illford xp2"
ILFORD_NEW="$MAT/04_Ilford-XP2"
# Rename the HTML file first (while folder still has old name)
HTML_OLD="$ILFORD_OLD/Before Mould 20607180fd92814d9159dda2c4cd5167.html"
if [ -f "$HTML_OLD" ]; then
  mv "$HTML_OLD" "$ILFORD_OLD/ilford-xp2_before-mould.html"
fi
# Also rename the subfolder "Before Mould" dir to match
if [ -d "$ILFORD_OLD/Before Mould" ]; then
  mv "$ILFORD_OLD/Before Mould" "$ILFORD_OLD/before-mould"
fi
# Now rename the parent folder
mv "$ILFORD_OLD" "$ILFORD_NEW"

# ─────────────────────────────────────────────
# 02_Production / 01_Shotlist & BTS
# ─────────────────────────────────────────────
echo "[Production - Shotlist PDF]"
SHOT="$ROOT/02_Production/01_Shotlist & BTS"
mv "$SHOT/Stains Of Fear.xlsx - PRE_SHOTLIST.pdf" "$SHOT/shotlist.pdf"

# BTS photos already well-named — no changes

# ─────────────────────────────────────────────
# 03_Post-production / 01_Visual / 01_16mm Printing
# ─────────────────────────────────────────────
echo "[Post - 16mm Printing]"
P16="$ROOT/03_Post-production/01_Visual/01_16mm Printing"

mv "$P16/IMG_1382.MOV" "$P16/16mm-printing_bts-video-01.mov"
mv "$P16/IMG_1383.MOV" "$P16/16mm-printing_bts-video-02.mov"
mv "$P16/IMG_1745.jp2" "$P16/16mm-printing_scan-01.jp2"
mv "$P16/WhatsApp Image 2026-03-11 at 14.03.57.jpeg"     "$P16/16mm-printing_bts-photo-01.jpeg"
mv "$P16/WhatsApp Image 2026-03-11 at 14.03.57 (1).jpeg" "$P16/16mm-printing_bts-photo-02.jpeg"
mv "$P16/WhatsApp Image 2026-03-11 at 14.03.57 (2).jpeg" "$P16/16mm-printing_bts-photo-03.jpeg"

for n in 1 2 3 4; do
  if [ -f "$P16/putting in enviroment${n}.jp2" ]; then
    padded=$(printf "%02d" $n)
    mv "$P16/putting in enviroment${n}.jp2" "$P16/16mm-printing_placement-${padded}.jp2"
  fi
done

for n in 2 3 4 5 6 7 8 9 10 11; do
  if [ -f "$P16/scan with arriflex${n}.jp2" ]; then
    padded=$(printf "%02d" $n)
    mv "$P16/scan with arriflex${n}.jp2" "$P16/16mm-printing_arriflex-scan-${padded}.jp2"
  fi
done

# ─────────────────────────────────────────────
# 03_Post-production / 01_Visual / 02_Mould Slides Composited
# ─────────────────────────────────────────────
echo "[Post - Mould Slides Composited]"
MSC="$ROOT/03_Post-production/01_Visual/02_Mould Slides Composited"

mv "$MSC/07-03.jpg"   "$MSC/e100-composite_jul03_v1.jpg"
mv "$MSC/07-03_1.jpg" "$MSC/e100-composite_jul03_v2.jpg"
mv "$MSC/07-03_2.jpg" "$MSC/e100-composite_jul03_v3.jpg"
mv "$MSC/07-09.jpg"   "$MSC/e100-composite_jul09_v1.jpg"
mv "$MSC/07-09_1.jpg" "$MSC/e100-composite_jul09_v2.jpg"
mv "$MSC/07-09_2.jpg" "$MSC/e100-composite_jul09_v3.jpg"
mv "$MSC/09-26.jpg"   "$MSC/e100-composite_sep26_v1.jpg"
mv "$MSC/09-26_1.jpg" "$MSC/e100-composite_sep26_v2.jpg"
mv "$MSC/09-26_2.jpg" "$MSC/e100-composite_sep26_v3.jpg"

# ─────────────────────────────────────────────
# 03_Post-production / 01_Visual / 03_Interval Shooting
# ─────────────────────────────────────────────
echo "[Post - Interval Shooting]"
IS="$ROOT/03_Post-production/01_Visual/03_Interval Shooting"

for n in 1 2 3 4 5; do
  if [ -f "$IS/interval shoot${n}.jp2" ]; then
    padded=$(printf "%02d" $n)
    mv "$IS/interval shoot${n}.jp2" "$IS/mould-timelapse_frame-${padded}.jp2"
  fi
done

echo ""
echo "=== All renames complete ==="
