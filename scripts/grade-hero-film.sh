#!/bin/bash
# Cuts and grades a homepage hero film (components/hero-film.tsx) from a
# source clip: trims LEN seconds from START, makes it loop without a cut (the
# last second fades into the first), grades it cool and nearly monochrome
# with grain, and writes public/hero/NAME-wide (2.39:1, 1920px) and
# NAME-tall (4:5, 720px), each an .mp4 plus a .jpg poster of its first frame.
# Needs ffmpeg.
#
#   scripts/grade-hero-film.sh <source.mp4|url> <start> <len> <name> [eq] [crf]
#
# The current films (sources are Pexels, free licence):
#   ... https://videos.pexels.com/video-files/11025693/11025693-hd_4096_2160_30fps.mp4 0 6.9 light-tree
#   ... https://videos.pexels.com/video-files/4238473/4238473-hd_1920_1080_30fps.mp4 2 14 light-plant "contrast=1.14:brightness=0.06:gamma=1.08" 26
#   ... https://videos.pexels.com/video-files/4106940/4106940-uhd_3840_2160_25fps.mp4 8 16 light-wood "contrast=1.06:gamma=0.97" 29
set -e
U="$1"; ST="$2"; LEN="$3"; N="$4"; EQ="${5:-contrast=1.06:gamma=0.97}"; CRF="${6:-25}"
OUT="$(dirname "$0")/../public/hero"
mkdir -p "$OUT"
OFF=$(awk "BEGIN{print $LEN-2}")
GRADE="hue=s=0.12,colorbalance=rs=-0.03:bs=0.04:rm=-0.02:bm=0.02,eq=$EQ,vignette=PI/6,noise=alls=7:allf=t"
LOOP="[0:v]split[a][b];[a]trim=start=1,setpts=PTS-STARTPTS[m];[b]trim=end=1,setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=1:offset=$OFF,format=yuv420p"
ffmpeg -loglevel error -y -ss "$ST" -t "$LEN" -i "$U" -an -filter_complex "$LOOP,crop=iw:iw/2.39,scale=1920:-2,$GRADE[v]" -map "[v]" -c:v libx264 -preset slow -crf "$CRF" -pix_fmt yuv420p -movflags +faststart "$OUT/$N-wide.mp4"
ffmpeg -loglevel error -y -ss "$ST" -t "$LEN" -i "$U" -an -filter_complex "$LOOP,crop=ih*4/5:ih,scale=720:-2,$GRADE[v]" -map "[v]" -c:v libx264 -preset slow -crf "$CRF" -pix_fmt yuv420p -movflags +faststart "$OUT/$N-tall.mp4"
ffmpeg -loglevel error -y -i "$OUT/$N-wide.mp4" -frames:v 1 -q:v 4 "$OUT/$N-wide.jpg"
ffmpeg -loglevel error -y -i "$OUT/$N-tall.mp4" -frames:v 1 -q:v 4 "$OUT/$N-tall.jpg"
