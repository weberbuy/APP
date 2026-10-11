#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WordChecking 100% 自主音標音檔離線生成腳本 (generate_phonics_audio.py)
------------------------------------------------------------------
功能：
1. 自動生成國中會考 1200 單字系統「自然發音與 KK 音標」全套 31 組標準音素 MP3 音檔。
2. 採用高音質真人神經語音（Microsoft Edge-TTS），100% 乾淨無外部版權問題。
3. 產出檔案自動歸檔至專案目錄：./data/phonics/
4. 同時建立標準符號檔名（如 [æ].mp3、[ð].mp3）與英數檔名（如 sv_a.mp3、th_voiced.mp3）。
"""

import os
import sys
import asyncio
import subprocess

PHONICS_ITEMS = [
    # 短母音 (Short Vowels)
    {"id": "sv_a", "symbol": "[æ]", "ascii": "sv_a", "text": "at", "desc": "短母音 [æ] 蝴蝶音"},
    {"id": "sv_e", "symbol": "[ɛ]", "ascii": "sv_e", "text": "eh", "desc": "短母音 [ɛ] 微笑音"},
    {"id": "sv_i", "symbol": "[ɪ]", "ascii": "sv_i", "text": "it", "desc": "短母音 [ɪ] 放鬆音"},
    {"id": "sv_o", "symbol": "[ɑ]", "ascii": "sv_o", "text": "ah", "desc": "短母音 [ɑ] 大口音"},
    {"id": "sv_u", "symbol": "[ʌ]", "ascii": "sv_u", "text": "uh", "desc": "短母音 [ʌ] 尖下巴音"},
    {"id": "sv_schwa", "symbol": "[ə]", "ascii": "sv_schwa", "text": "uh", "desc": "央母音 [ə] 懶人音"},
    # 長母音與雙母音 (Long Vowels & Diphthongs)
    {"id": "lv_a", "symbol": "[e]", "ascii": "lv_a", "text": "ay", "desc": "長母音 [e] / [eɪ]"},
    {"id": "lv_e", "symbol": "[i]", "ascii": "lv_e", "text": "ee", "desc": "長母音 [i]"},
    {"id": "lv_i", "symbol": "[aɪ]", "ascii": "lv_i", "text": "eye", "desc": "雙母音 [aɪ]"},
    {"id": "lv_o", "symbol": "[o]", "ascii": "lv_o", "text": "oh", "desc": "長母音 [o]"},
    {"id": "lv_u", "symbol": "[ju]", "ascii": "lv_u", "text": "you", "desc": "長母音 [ju]"},
    {"id": "lv_oo_long", "symbol": "[u]", "ascii": "lv_oo_long", "text": "oo", "desc": "長音 [u]"},
    {"id": "lv_oo_short", "symbol": "[ʊ]", "ascii": "lv_oo_short", "text": "wood", "desc": "短音 [ʊ]"},
    {"id": "lv_ou_ow", "symbol": "[aʊ]", "ascii": "lv_ou_ow", "text": "ow", "desc": "雙母音 [aʊ]"},
    {"id": "lv_oi_oy", "symbol": "[ɔɪ]", "ascii": "lv_oi_oy", "text": "oy", "desc": "雙母音 [ɔɪ]"},
    {"id": "lv_ar", "symbol": "[ɑr]", "ascii": "lv_ar", "text": "ar", "desc": "捲舌音 [ɑr]"},
    {"id": "lv_er_ir_ur", "symbol": "[ɝ]", "ascii": "lv_er_ir_ur", "text": "er", "desc": "捲舌音 [ɝ]"},
    # 單子音 (Consonants)
    {"id": "c_pb", "symbol": "[p]", "ascii": "c_pb", "text": "p, b", "desc": "雙唇音 [p] / [b]"},
    {"id": "c_td", "symbol": "[t]", "ascii": "c_td", "text": "t, d", "desc": "舌尖音 [t] / [d]"},
    {"id": "c_kg", "symbol": "[k]", "ascii": "c_kg", "text": "k, g", "desc": "舌根音 [k] / [g]"},
    {"id": "c_fv", "symbol": "[f]", "ascii": "c_fv", "text": "f, v", "desc": "唇齒音 [f] / [v]"},
    {"id": "c_sz", "symbol": "[s]", "ascii": "c_sz", "text": "s, z", "desc": "摩擦音 [s] / [z]"},
    {"id": "c_mn_ng", "symbol": "[m]", "ascii": "c_mn_ng", "text": "m, n", "desc": "鼻音 [m] / [n]"},
    {"id": "c_lr", "symbol": "[l]", "ascii": "c_lr", "text": "l, r", "desc": "流音捲舌 [l] / [r]"},
    {"id": "c_wyh", "symbol": "[w]", "ascii": "c_wyh", "text": "w, y, h", "desc": "半母音 [w] / [j] / [h]"},
    # 複合子音 (Digraphs)
    {"id": "dg_th_unvoiced", "symbol": "[θ]", "ascii": "dg_th_unvoiced", "text": "think", "desc": "無聲咬舌 [θ]"},
    {"id": "dg_th_voiced", "symbol": "[ð]", "ascii": "dg_th_voiced", "text": "the", "desc": "有聲咬舌 [ð] (純濁摩擦音)"},
    {"id": "dg_sh", "symbol": "[ʃ]", "ascii": "dg_sh", "text": "sh", "desc": "噓音 [ʃ]"},
    {"id": "dg_ch", "symbol": "[tʃ]", "ascii": "dg_ch", "text": "ch", "desc": "塞擦音 [tʃ]"},
    {"id": "dg_wh_ph", "symbol": "[w_f]", "ascii": "dg_wh_ph", "text": "wh, ph", "desc": "複合音 [w] / [f]"},
    {"id": "dg_ck", "symbol": "[k_ck]", "ascii": "dg_ck", "text": "k", "desc": "字尾 [k]"}
]

OUT_DIR = os.path.join(os.path.dirname(__file__), "data", "phonics")

async def generate_with_edge_tts():
    try:
        import edge_tts
    except ImportError:
        print("未安裝 edge-tts，正在嘗試安裝: pip install edge-tts ...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "edge-tts"])
        import edge_tts

    os.makedirs(OUT_DIR, exist_ok=True)
    voice = "en-US-JennyNeural"
    print(f"🎙 開始生成 31 組音素音檔至: {OUT_DIR}")
    print(f"🎙 使用語音引擎: {voice}\n")

    for item in PHONICS_ITEMS:
        text = item["text"]
        primary_name = f"{item['symbol']}.mp3"
        primary_path = os.path.join(OUT_DIR, primary_name)

        alias_name = f"{item['ascii']}.mp3"
        alias_path = os.path.join(OUT_DIR, alias_name)

        communicate = edge_tts.Communicate(text, voice, rate="+0%")
        await communicate.save(primary_path)

        if not os.path.exists(alias_path):
            with open(primary_path, "rb") as src, open(alias_path, "wb") as dst:
                dst.write(src.read())

        print(f"  ✔ 已產出: {primary_name:<16} ({alias_name:<16}) - {item['desc']}")

    print("\n🎉 全數 31 組自主音標音檔生成完畢！")
    print(f"📁 檔案目錄: {OUT_DIR}")

if __name__ == "__main__":
    try:
        asyncio.run(generate_with_edge_tts())
    except Exception as e:
        print(f"生成過程發生錯誤: {e}")
        print("建議手動執行: pip install edge-tts 後重試。")
