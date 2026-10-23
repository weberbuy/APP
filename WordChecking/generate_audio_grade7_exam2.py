#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WordChecking 七年級一上第二次段考 (Lesson 3 ~ Lesson 4) 專屬 MP3 音檔批量生成工具
-------------------------------------------------------------------------
語音引擎：Microsoft Azure Neural Voice (en-US-JennyNeural)
產出目錄：./data/audio/
收錄範圍：Lesson 3 (40字) + Lesson 4 (36字) = 76 組段考必考單字與片語
使用方式：
  pip install edge-tts
  python generate_audio_grade7_exam2.py
"""

import os
import sys
import json
import asyncio
import subprocess

VOICE = "en-US-JennyNeural"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET_DIR = os.path.join(BASE_DIR, "data", "audio")
JSON_PATH = os.path.join(BASE_DIR, "data", "vocab-grade7-exam2.json")

# 特殊發音文本處理（去除標點或調整發音）
SPECIAL_SPEAK_MAP = {
    "let's...": "let's",
    "I see.": "I see",
    "Guess what?": "Guess what",
    "the USA": "the U S A",
    "can't": "can't",
}

def clean_speak_text(word):
    if word in SPECIAL_SPEAK_MAP:
        return SPECIAL_SPEAK_MAP[word]
    cleaned = word.replace("...", "").replace("?", "").replace(".", "").strip()
    return cleaned

async def generate_single(item, edge_tts_mod):
    raw_word = item["word"]
    speak_text = clean_speak_text(raw_word)

    primary_name = f"{raw_word.lower()}.mp3"
    alt_name = f"{raw_word.lower().replace(' ', '_').replace('.', '').replace('?', '').replace('...', '').strip()}.mp3"

    primary_out = os.path.join(TARGET_DIR, primary_name)

    comm = edge_tts_mod.Communicate(speak_text, VOICE, rate="+0%")
    await comm.save(primary_out)

    with open(primary_out, "rb") as f:
        data = f.read()

    if alt_name != primary_name:
        with open(os.path.join(TARGET_DIR, alt_name), "wb") as f:
            f.write(data)

async def main():
    os.makedirs(TARGET_DIR, exist_ok=True)
    try:
        import edge_tts
    except ImportError:
        print("正在自動安裝 edge-tts 模組...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "edge-tts"])
        import edge_tts

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        vocab_list = json.load(f)

    print("=" * 65)
    print(f"🎙 開始批量生成七年級一上第二次段考 {len(vocab_list)} 組單字 MP3 音檔")
    print(f"  語音音色: {VOICE}")
    print(f"  目標目錄: {TARGET_DIR}")
    print("=" * 65)

    success_count = 0
    skip_count = 0

    for idx, item in enumerate(vocab_list, 1):
        word = item["word"]
        primary_name = f"{word.lower()}.mp3"
        primary_out = os.path.join(TARGET_DIR, primary_name)

        try:
            await generate_single(item, edge_tts)
            print(f"  ✔ [{idx:02d}/{len(vocab_list)}] {word:<24} ➔ 成功 ({clean_speak_text(word)})")
            success_count += 1
        except Exception as e:
            print(f"  ❌ [{idx:02d}/{len(vocab_list)}] {word:<24} ➔ 失敗 ({e})")

    print("\n" + "=" * 65)
    print(f"🎉 生成完畢！共成功產出 {success_count} 組段考單字音檔。")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(main())
