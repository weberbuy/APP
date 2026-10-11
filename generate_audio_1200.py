#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WordChecking 七年級一上第一次段考 (Get Ready ~ L2) 專屬 MP3 音檔批量生成工具
-------------------------------------------------------------------------
語音引擎：Microsoft Azure Neural Voice (en-US-JennyNeural)
產出目錄：./data/audio/ 與 ./WordChecking/data/audio/
收錄範圍：Get Ready (4字) + Lesson 1 (37字) + Lesson 2 (38字) = 79 組段考必考字詞
包含 1200 單字庫未收錄之單字（如 fox, rat, ox, dragon, rooster, energetic, strict, lifespan 等）
使用方式：
  pip install edge-tts
  python3 generate_audio_grade7_exam1.py
"""

import os
import sys
import asyncio
import subprocess

VOICE = "en-US-JennyNeural"

TARGET_DIRS = [
    os.path.join(".", "WordChecking", "data", "audio")
    os.path.join(".", "data", "audio"),
]

# 79 組段考字詞清單 (英文字詞與純淨發音文本)
EXAM1_ITEMS = [
    # Get Ready (4)
    {"word": "thank", "speak": "thank"},
    {"word": "name", "speak": "name"},
    {"word": "How old...?", "speak": "How old"},
    {"word": "year(s) old", "speak": "years old"},

    # Lesson 1 (37)
    {"word": "family", "speak": "family"},
    {"word": "husband", "speak": "husband"},
    {"word": "wife", "speak": "wife"},
    {"word": "uncle", "speak": "uncle"},
    {"word": "aunt", "speak": "aunt"},
    {"word": "cousin", "speak": "cousin"},
    {"word": "son", "speak": "son"},
    {"word": "daughter", "speak": "daughter"},
    {"word": "parent", "speak": "parent"},
    {"word": "child", "speak": "child"},
    {"word": "young", "speak": "young"},
    {"word": "man", "speak": "man"},
    {"word": "handsome", "speak": "handsome"},
    {"word": "our", "speak": "our"},
    {"word": "PE", "speak": "P E"},
    {"word": "really", "speak": "really"},
    {"word": "classroom", "speak": "classroom"},
    {"word": "same", "speak": "same"},
    {"word": "class", "speak": "class"},
    {"word": "again", "speak": "again"},
    {"word": "Nice to meet you.", "speak": "Nice to meet you"},
    {"word": "too", "speak": "too"},
    {"word": "news", "speak": "news"},
    {"word": "problem", "speak": "problem"},
    {"word": "strict", "speak": "strict"},
    {"word": "junior high school", "speak": "junior high school"},
    {"word": "warm", "speak": "warm"},
    {"word": "farmer", "speak": "farmer"},
    {"word": "cook", "speak": "cook"},
    {"word": "nurse", "speak": "nurse"},
    {"word": "beautiful", "speak": "beautiful"},
    {"word": "woman", "speak": "woman"},
    {"word": "doctor", "speak": "doctor"},
    {"word": "senior high school", "speak": "senior high school"},
    {"word": "pet", "speak": "pet"},
    {"word": "cute", "speak": "cute"},
    {"word": "nice", "speak": "nice"},

    # Lesson 2 (38)
    {"word": "monkey", "speak": "monkey"},
    {"word": "fox", "speak": "fox"},
    {"word": "sheep", "speak": "sheep"},
    {"word": "tiger", "speak": "tiger"},
    {"word": "zebra", "speak": "zebra"},
    {"word": "lion", "speak": "lion"},
    {"word": "mouse", "speak": "mouse"},
    {"word": "bear", "speak": "bear"},
    {"word": "movie theater", "speak": "movie theater"},
    {"word": "Chinese", "speak": "Chinese"},
    {"word": "animal", "speak": "animal"},
    {"word": "sign", "speak": "sign"},
    {"word": "rat", "speak": "rat"},
    {"word": "ox", "speak": "ox"},
    {"word": "rabbit", "speak": "rabbit"},
    {"word": "dragon", "speak": "dragon"},
    {"word": "snake", "speak": "snake"},
    {"word": "horse", "speak": "horse"},
    {"word": "goat", "speak": "goat"},
    {"word": "rooster", "speak": "rooster"},
    {"word": "smart", "speak": "smart"},
    {"word": "energetic", "speak": "energetic"},
    {"word": "true", "speak": "true"},
    {"word": "no wonder", "speak": "no wonder"},
    {"word": "people", "speak": "people"},
    {"word": "What about...?", "speak": "What about"},
    {"word": "people person", "speak": "people person"},
    {"word": "picture", "speak": "picture"},
    {"word": "elephant", "speak": "elephant"},
    {"word": "or", "speak": "or"},
    {"word": "size", "speak": "size"},
    {"word": "different", "speak": "different"},
    {"word": "very", "speak": "very"},
    {"word": "their", "speak": "their"},
    {"word": "meter", "speak": "meter"},
    {"word": "but", "speak": "but"},
    {"word": "only", "speak": "only"},
    {"word": "lifespan", "speak": "lifespan"}
]

def ensure_dirs():
    for d in TARGET_DIRS:
        os.makedirs(d, exist_ok=True)

async def generate_single(item, edge_tts_mod):
    raw_word = item["word"]
    speak_text = item["speak"]

    # 生成安全檔名
    primary_name = f"{raw_word.lower()}.mp3"
    # 同時提供底線別名 (如 movie_theater.mp3, what_about.mp3)
    alt_name = f"{raw_word.lower().replace(' ', '_').replace('.', '').replace('?', '').replace('(', '').replace(')', '')}.mp3"

    primary_out = os.path.join(TARGET_DIRS[0], primary_name)

    comm = edge_tts_mod.Communicate(speak_text, VOICE, rate="+0%")
    await comm.save(primary_out)

    with open(primary_out, "rb") as f:
        data = f.read()

    # 複製至所有目錄與別名
    for d in TARGET_DIRS:
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, primary_name), "wb") as f:
            f.write(data)
        if alt_name != primary_name:
            with open(os.path.join(d, alt_name), "wb") as f:
                f.write(data)

async def main():
    ensure_dirs()
    try:
        import edge_tts
    except ImportError:
        print("正在自動安裝 edge-tts 模組...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "edge-tts"])
        import edge_tts

    print("=" * 65)
    print("🎙 開始批量生成七年級一上第一次段考 79 組單字 MP3 音檔")
    print(f"  語音音色: {VOICE}")
    print(f"  目標目錄: {TARGET_DIRS[0]}")
    print("=" * 65)

    success_count = 0
    for idx, item in enumerate(EXAM1_ITEMS, 1):
        try:
            await generate_single(item, edge_tts)
            print(f"  ✔ [{idx:02d}/{len(EXAM1_ITEMS)}] {item['word']:<24} ➔ 成功 ({item['speak']})")
            success_count += 1
        except Exception as e:
            print(f"  ❌ [{idx:02d}/{len(EXAM1_ITEMS)}] {item['word']:<24} ➔ 失敗 ({e})")

    print("\n" + "=" * 65)
    print(f"🎉 生成完畢！共成功產出 {success_count} / {len(EXAM1_ITEMS)} 組段考單字音檔。")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(main())
