#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WordChecking 1200 單字高品質類神經自然語音批次生成工具
模型：Microsoft Azure Neural Voice (en-US-JennyNeural)
產出：./data/audio/[word].mp3
"""
import os
import json
import asyncio
import subprocess
import sys

VOICE = "en-US-JennyNeural"  # 專業美語自然女聲（亦可換 en-US-GuyNeural 男聲）
OUTPUT_DIR = os.path.join("./WordChecking", "data", "audio")
VOCAB_FILE = os.path.join("./WordChecking", "data", "vocab-1200.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 自動檢查並安裝 edge-tts 庫
try:
    import edge_tts
except ImportError:
    print("正在安裝 edge-tts 自然語音模組...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "edge-tts"])
    import edge_tts

async def generate_word_audio(word, output_path):
    communicate = edge_tts.Communicate(word, VOICE, rate="+0%")
    await communicate.save(output_path)

async def main():
    vocab_path = VOCAB_FILE if os.path.exists(VOCAB_FILE) else "./vocab-1200.json"
    if not os.path.exists(vocab_path):
        print(f"❌ 錯誤：找不到單字庫檔案 {vocab_path}")
        return

    with open(vocab_path, "r", encoding="utf-8") as f:
        vocab_list = json.load(f)

    total = len(vocab_list)
    print(f"==================================================")
    print(f"🎙️ 開始批次生成 1200 單字高品質自然語音 MP3")
    print(f"  語音音色：{VOICE}")
    print(f"  存放目錄：{OUTPUT_DIR}")
    print(f"  單字總數：{total}")
    print(f"==================================================")

    success_count = 0
    skipped_count = 0

    for idx, item in enumerate(vocab_list, 1):
        word = item.get("word", "").strip()
        if not word:
            continue
        
        # 安全檔名轉換（處理空格與特殊符號）
        clean_name = word.lower().replace("/", "_").replace("\\", "_").replace(" ", "_")
        out_file = os.path.join(OUTPUT_DIR, f"{clean_name}.mp3")

        # 若檔案已存在且大於 500 bytes 則自動跳過，避免重複生成
        if os.path.exists(out_file) and os.path.getsize(out_file) > 500:
            skipped_count += 1
            continue

        for retry in range(3):
            try:
                await generate_word_audio(word, out_file)
                success_count += 1
                if success_count % 50 == 0 or idx == total:
                    print(f"  進度 [{idx}/{total}] 已完成: {word}")
                break
            except Exception as e:
                if retry == 2:
                    print(f"  ⚠️ [{idx}/{total}] 生成失敗 ({word}): {e}")
                await asyncio.sleep(0.5)

    print(f"==================================================")
    print(f"🎉 語音 MP3 生成完畢！")
    print(f"  本次新增生成：{success_count} 首")
    print(f"  已有檔案跳過：{skipped_count} 首")
    print(f"  音檔目錄：{OUTPUT_DIR}/ （總容量約 12 MB）")
    print(f"==================================================")

if __name__ == "__main__":
    asyncio.run(main())
