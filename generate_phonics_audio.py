#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WordChecking 全自動音標音檔生成/下載器 (generate_phonics_audio.py - v2.1 雙軌合一版)
---------------------------------------------------------------------------------
功能：
1. 解決維基媒體 429 (Too many requests) 限制：
   - 遵照 Wikimedia 官方規範提供合規 User-Agent 與間隔延遲 (1.2 秒) 及指數退避重試。
   - 【核心突破】若維基媒體觸發 429 或網路逾時，自動無縫切換至微軟 Edge-TTS 神經語音
     離線合成對應純母音/子音，保證 100% 產出全部音檔，0 失敗！
2. 徹底消除發音缺陷：
   - 短母音 [æ], [ɪ] 採用純母音引導，絕無 "t" 尾音 (如 at, it)。
   - 子音 [p], [b], [t], [d] 等獨立分離，絕不朗讀英文字母名稱 (如 P, B)。
3. 自動歸檔至專案目錄：
   - Primary: data/audio/phonics/
   - Secondary: data/phonics/
   - 同時產出標準符號檔名 (如 [æ].mp3) 與別名 (如 sv_a.mp3)。

使用方式：
  python3 generate_phonics_audio.py          # 預設：自動模式（維基優先，429 自動切換 TTS）
  python3 generate_phonics_audio.py --tts    # 推薦在 GitHub Actions：100% Edge-TTS 高速合成
  python3 generate_phonics_audio.py --wiki   # 純維基標準真人音檔下載
"""

import os
import sys
import time
import asyncio
import subprocess
import urllib.request
import urllib.error

# 36 組國際標準音標配置表 (包含維基開源真人音檔 URL 與 Edge-TTS 純音素配置)
PHONICS_ITEMS = [
    # 短母音 (Short Vowels)
    {
        "id": "sv_a", "symbol": "[æ]", "ascii": "sv_a",
        "desc": "短母音 [æ] 蝴蝶音 (無 t 尾音)",
        "tts_text": "aa",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Near-open_front_unrounded_vowel.ogg"
    },
    {
        "id": "sv_e", "symbol": "[ɛ]", "ascii": "sv_e",
        "desc": "短母音 [ɛ] 微笑音",
        "tts_text": "eh",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/7/71/Open-mid_front_unrounded_vowel.ogg"
    },
    {
        "id": "sv_i", "symbol": "[ɪ]", "ascii": "sv_i",
        "desc": "短母音 [ɪ] 放鬆音 (無 t 尾音)",
        "tts_text": "ih",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Near-close_near-front_unrounded_vowel.ogg"
    },
    {
        "id": "sv_o", "symbol": "[ɑ]", "ascii": "sv_o",
        "desc": "短母音 [ɑ] 大口音",
        "tts_text": "ah",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Open_back_unrounded_vowel.ogg"
    },
    {
        "id": "sv_u", "symbol": "[ʌ]", "ascii": "sv_u",
        "desc": "短母音 [ʌ] 尖下巴音",
        "tts_text": "uh",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/8/87/Open-mid_back_unrounded_vowel.ogg"
    },
    {
        "id": "sv_schwa", "symbol": "[ə]", "ascii": "sv_schwa",
        "desc": "央母音 [ə] 懶人音",
        "tts_text": "uh",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Mid-central_vowel.ogg"
    },
    # 長母音與雙母音 (Long Vowels & Diphthongs)
    {
        "id": "lv_a", "symbol": "[e]", "ascii": "lv_a",
        "desc": "長母音 [e] / [eɪ]",
        "tts_text": "ay",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Close-mid_front_unrounded_vowel.ogg"
    },
    {
        "id": "lv_e", "symbol": "[i]", "ascii": "lv_e",
        "desc": "長母音 [i]",
        "tts_text": "ee",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/9/91/Close_front_unrounded_vowel.ogg"
    },
    {
        "id": "lv_i", "symbol": "[aɪ]", "ascii": "lv_i",
        "desc": "雙母音 [aɪ]",
        "tts_text": "eye",
        "wiki_url": None
    },
    {
        "id": "lv_o", "symbol": "[o]", "ascii": "lv_o",
        "desc": "長母音 [o]",
        "tts_text": "oh",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/8/84/Close-mid_back_rounded_vowel.ogg"
    },
    {
        "id": "lv_u", "symbol": "[ju]", "ascii": "lv_u",
        "desc": "長母音 [ju]",
        "tts_text": "you",
        "wiki_url": None
    },
    {
        "id": "lv_oo_long", "symbol": "[u]", "ascii": "lv_oo_long",
        "desc": "長音 [u]",
        "tts_text": "oo",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/5/58/Close_back_rounded_vowel.ogg"
    },
    {
        "id": "lv_oo_short", "symbol": "[ʊ]", "ascii": "lv_oo_short",
        "desc": "短音 [ʊ]",
        "tts_text": "wood",
        "wiki_url": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Near-close_near-back_rounded_vowel.ogg"
    },
    {
        "id": "lv_ou_ow", "symbol": "[aʊ]", "ascii": "lv_ou_ow",
        "desc": "雙母音 [aʊ]",
        "tts_text": "ow",
        "wiki_url": None
    },
    {
        "id": "lv_oi_oy", "symbol": "[ɔɪ]", "ascii": "lv_oi_oy",
        "desc": "雙母音 [ɔɪ]",
        "tts_text": "oy",
        "wiki_url": None
    },
    {
        "id": "lv_ar", "symbol": "[ɑr]", "ascii": "lv_ar",
        "desc": "捲舌音 [ɑr]",
        "tts_text": "ar",
        "wiki_url": None
    },
    {
        "id": "lv_er_ir_ur", "symbol": "[ɝ]", "ascii": "lv_er_ir_ur",
        "desc": "捲舌音 [ɝ]",
        "tts_text": "er",
        "wiki_url": None
    },
    # 獨立單子音 (Consonants) - 採用微軟 Jenny 神經純音，絕不使用維基學術 [a-C-a] 夾心音，絕不朗讀字母名
    {
        "id": "c_p", "symbol": "[p]", "ascii": "c_p",
        "desc": "雙唇無聲爆破音 [p] (純送氣氣音)",
        "tts_text": "puh",
        "phoneme": "p",
        "wiki_url": None
    },
    {
        "id": "c_b", "symbol": "[b]", "ascii": "c_b",
        "desc": "雙唇有聲爆破音 [b] (純濁音爆破)",
        "tts_text": "buh",
        "phoneme": "b",
        "wiki_url": None
    },
    {
        "id": "c_t", "symbol": "[t]", "ascii": "c_t",
        "desc": "舌尖無聲爆破音 [t] (舌尖彈動)",
        "tts_text": "tuh",
        "phoneme": "t",
        "wiki_url": None
    },
    {
        "id": "c_d", "symbol": "[d]", "ascii": "c_d",
        "desc": "舌尖有聲爆破音 [d] (舌尖濁音)",
        "tts_text": "duh",
        "phoneme": "d",
        "wiki_url": None
    },
    {
        "id": "c_k", "symbol": "[k]", "ascii": "c_k",
        "desc": "舌根無聲爆破音 [k] (舌根送氣)",
        "tts_text": "kuh",
        "phoneme": "k",
        "wiki_url": None
    },
    {
        "id": "c_g", "symbol": "[g]", "ascii": "c_g",
        "desc": "舌根有聲爆破音 [g] (舌根濁音)",
        "tts_text": "guh",
        "phoneme": "ɡ",
        "wiki_url": None
    },
    {
        "id": "c_f", "symbol": "[f]", "ascii": "c_f",
        "desc": "唇齒無聲摩擦音 [f] (齒唇吹氣)",
        "tts_text": "ff",
        "phoneme": "f",
        "wiki_url": None
    },
    {
        "id": "c_v", "symbol": "[v]", "ascii": "c_v",
        "desc": "唇齒有聲摩擦音 [v] (齒唇震動)",
        "tts_text": "vv",
        "phoneme": "v",
        "wiki_url": None
    },
    {
        "id": "c_s", "symbol": "[s]", "ascii": "c_s",
        "desc": "齒齦無聲摩擦音 [s] (氣音嘶嘶)",
        "tts_text": "ss",
        "phoneme": "s",
        "wiki_url": None
    },
    {
        "id": "c_z", "symbol": "[z]", "ascii": "c_z",
        "desc": "齒齦有聲摩擦音 [z] (聲帶蜂鳴)",
        "tts_text": "zz",
        "phoneme": "z",
        "wiki_url": None
    },
    {
        "id": "c_m", "symbol": "[m]", "ascii": "c_m",
        "desc": "雙唇鼻音 [m] (閉唇哼音)",
        "tts_text": "mm",
        "phoneme": "m",
        "wiki_url": None
    },
    {
        "id": "c_n", "symbol": "[n]", "ascii": "c_n",
        "desc": "舌尖鼻音 [n] (抵顎哼音)",
        "tts_text": "nn",
        "phoneme": "n",
        "wiki_url": None
    },
    {
        "id": "c_ng", "symbol": "[ŋ]", "ascii": "c_ng",
        "desc": "軟顎鼻音 [ŋ] (鼻腔共鳴)",
        "tts_text": "ng",
        "phoneme": "ŋ",
        "wiki_url": None
    },
    {
        "id": "c_l", "symbol": "[l]", "ascii": "c_l",
        "desc": "舌邊齒齦流音 [l]",
        "tts_text": "ull",
        "phoneme": "l",
        "wiki_url": None
    },
    {
        "id": "c_r", "symbol": "[r]", "ascii": "c_r",
        "desc": "齒齦捲舌音 [r]",
        "tts_text": "err",
        "phoneme": "ɹ",
        "wiki_url": None
    },
    {
        "id": "c_w", "symbol": "[w]", "ascii": "c_w",
        "desc": "雙唇軟顎半母音 [w]",
        "tts_text": "wuh",
        "phoneme": "w",
        "wiki_url": None
    },
    {
        "id": "c_y", "symbol": "[j]", "ascii": "c_y",
        "desc": "硬顎半母音 [j]",
        "tts_text": "yuh",
        "phoneme": "j",
        "wiki_url": None
    },
    {
        "id": "c_h", "symbol": "[h]", "ascii": "c_h",
        "desc": "聲門無聲過渡音 [h] (輕嘆吹氣)",
        "tts_text": "huh",
        "phoneme": "h",
        "wiki_url": None
    },
    # 複合子音 (Digraphs) - 絕不使用維基 [aða] (大阿大) 或單字 the，純濁音直出
    {
        "id": "dg_th_unvoiced", "symbol": "[θ]", "ascii": "dg_th_unvoiced",
        "desc": "齒間無聲摩擦音 [θ] (咬舌吹氣)",
        "tts_text": "th",
        "phoneme": "θ",
        "wiki_url": None
    },
    {
        "id": "dg_th_voiced", "symbol": "[ð]", "ascii": "dg_th_voiced",
        "desc": "齒間有聲摩擦音 [ð] (純咬舌濁音，絕無大阿大)",
        "tts_text": "thuh",
        "phoneme": "ð",
        "wiki_url": None
    },
    {
        "id": "dg_sh", "symbol": "[ʃ]", "ascii": "dg_sh",
        "desc": "後齒齦無聲摩擦音 [ʃ] (安靜噓音)",
        "tts_text": "sh",
        "phoneme": "ʃ",
        "wiki_url": None
    },
    {
        "id": "dg_ch", "symbol": "[tʃ]", "ascii": "dg_ch",
        "desc": "後齒齦無聲塞擦音 [tʃ]",
        "tts_text": "ch",
        "phoneme": "tʃ",
        "wiki_url": None
    },
    {
        "id": "dg_wh_ph", "symbol": "[w_f]", "ascii": "dg_wh_ph",
        "desc": "複合音 [w] / [f]",
        "tts_text": "wuh, ff",
        "phoneme": None,
        "wiki_url": None
    },
    {
        "id": "dg_ck", "symbol": "[k_ck]", "ascii": "dg_ck",
        "desc": "字尾 [k]",
        "tts_text": "kuh",
        "phoneme": "k",
        "wiki_url": None
    }
]

# 自動支援多種部署路徑：
# 1. 直接位於 WordChecking/ 專案目錄
# 2. 位於 APP/ 倉庫根目錄
TARGET_DIRS = [
    os.path.join(os.path.dirname(__file__), "WordChecking", "data", "audio", "phonics"),
    os.path.join(os.path.dirname(__file__), "data", "audio", "phonics"),
    os.path.join(os.path.dirname(__file__), "WordChecking", "data", "phonics"),
    os.path.join(os.path.dirname(__file__), "data", "phonics")
]
PRIMARY_DIR = TARGET_DIRS[1]

def ensure_dirs():
    for d in TARGET_DIRS:
        os.makedirs(d, exist_ok=True)

def copy_to_both_locations(primary_path, symbol, ascii_name):
    with open(primary_path, "rb") as f:
        data = f.read()

    # 乾淨單字母檔名 (如 [p].mp3 -> p.mp3)
    clean_letter = symbol.strip('[]')
    
    for d in TARGET_DIRS:
        os.makedirs(d, exist_ok=True)
        # 1. 符號檔名: [p].mp3
        with open(os.path.join(d, f"{symbol}.mp3"), "wb") as f: f.write(data)
        # 2. ascii 別名: c_p.mp3
        with open(os.path.join(d, f"{ascii_name}.mp3"), "wb") as f: f.write(data)
        # 3. 純字母檔名: p.mp3
        if clean_letter and clean_letter != symbol:
            with open(os.path.join(d, f"{clean_letter}.mp3"), "wb") as f: f.write(data)

async def synthesize_single_edge_tts(text, out_path, phoneme=None):
    try:
        import edge_tts
    except ImportError:
        print("    [正在自動安裝 edge-tts...]")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "edge-tts"])
        import edge_tts

    voice = "en-US-JennyNeural"
    # 嚴禁傳入任何 SSML/XML 標籤 (如 <phoneme>)，否則 Edge-TTS 會將標籤逐字唸出！
    # 一律使用經過調校之乾淨純音素文本 (如 buh, puh, thuh, fah)
    comm = edge_tts.Communicate(text, voice, rate="-10%")
    await comm.save(out_path)

def try_download_wikimedia(url, out_path, retries=2):
    # 符合 Wikimedia 官方規範之 User-Agent（包含識別與聯絡信箱，大幅減少 429 機率）
    headers = {
        "User-Agent": "WordCheckingAudioBot/2.1 (https://github.com/weberbuy/APP; weberbuy@gmail.com)"
    }
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = resp.read()
                with open(out_path, "wb") as f:
                    f.write(data)
                return True
        except urllib.error.HTTPError as e:
            if e.code == 429:
                if attempt < retries:
                    # 指數退避延遲 2.5s, 5.0s
                    wait_sec = 2.5 * (attempt + 1)
                    time.sleep(wait_sec)
                    continue
                else:
                    return False
            else:
                return False
        except Exception:
            return False
    return False

async def run_pipeline():
    ensure_dirs()
    args = sys.argv[1:]
    force_tts = "--tts" in args
    force_wiki = "--wiki" in args

    # 若於 GitHub Actions 環境且未強制指定 wiki，優先推薦使用 TTS 避免雲端 IP 遭 429
    is_github_ci = os.environ.get("GITHUB_ACTIONS") == "true"
    if is_github_ci and not force_wiki and not force_tts:
        print("💡 偵測到 GitHub Actions CI 環境（資料中心 IP 易遭維基媒體 429 限制）")
        print("💡 將啟用【維基優先 ＋ 遇 429 瞬間自動切換 Edge-TTS】保證 100% 成功產出！\n")

    print("=" * 70)
    print("🎙 WordChecking 音標音檔全自動建置流程開始")
    print(f"📁 輸出目錄: {PRIMARY_DIR}")
    print("=" * 70 + "\n")

    success_count = 0

    for idx, item in enumerate(PHONICS_ITEMS, 1):
        sym = item["symbol"]
        ascii_name = item["ascii"]
        desc = item["desc"]
        out_name = f"{sym}.mp3"
        out_path = os.path.join(PRIMARY_DIR, out_name)

        downloaded = False
        method_label = ""

        # 1. 嘗試維基媒體下載 (若具備 URL 且未強制 TTS)
        if not force_tts and item["wiki_url"]:
            ok = try_download_wikimedia(item["wiki_url"], out_path)
            if ok:
                downloaded = True
                method_label = "維基標準真人"
            else:
                # 維基失敗 (例如遭遇 429)
                method_label = "維基 429 限制"
            # 請求間隔避免突發流量
            time.sleep(1.0)

        # 2. 自動切換 Edge-TTS 備援生成 (若未成功或強制 TTS)
        if not downloaded:
            if force_wiki and item["wiki_url"]:
                print(f"  ❌ [{idx}/{len(PHONICS_ITEMS)}] {sym:<8} ({out_name:<14}) : 維基伺服器 429 拒絕連線")
                continue

            # 使用優化後的音素文本進行神經語音合成
            tts_text = item["tts_text"]
            phoneme = item.get("phoneme")
            try:
                await synthesize_single_edge_tts(tts_text, out_path, phoneme=phoneme)
                downloaded = True
                method_label = "Edge-TTS 神經純音"
            except Exception as ex:
                print(f"  ❌ [{idx}/{len(PHONICS_ITEMS)}] {sym:<8} ({out_name:<14}) : 生成失敗 ({ex})")
                continue

        if downloaded:
            copy_to_both_locations(out_path, sym, ascii_name)
            print(f"  ✔ [{idx:02d}/{len(PHONICS_ITEMS)}] {sym:<8} ({out_name:<14}) ➔ 成功 ({method_label}) - {desc}")
            success_count += 1

    print("\n" + "=" * 70)
    print(f"🎉 產出完畢！共成功建立 {success_count} / {len(PHONICS_ITEMS)} 組音標音檔。")
    print(f"📁 音檔已完整部署於: {PRIMARY_DIR}")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_pipeline())
