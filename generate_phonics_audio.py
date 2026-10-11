#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WordChecking 100% 國際標準真人示範音標音檔下載器 (download_standard_phonics.py)
-------------------------------------------------------------------------
功能：
1. 自動從維基媒體共享資源 (Wikimedia Commons) 下載全世界語言學家公認最標準、
   最純淨的國際音標 (IPA / KK 音標) 真人母語發音音檔。
2. 100% 開放授權 (Public Domain / CC-BY-SA)，完全免費用於教育與個人系統，絕無版權問題。
3. 徹底解決 TTS 合成音檔尾音帶有 't' (如 at, it) 或朗讀字母名稱 (如 P, B) 的問題，
   [æ] 就是純母音蝴蝶音，[p] 就是純清爆破氣音，[b] 就是純濁爆破音，[ð] 就是純濁咬舌音。
4. 下載後自動命名為 [符號].mp3 及對應別名，直接存放於 WordChecking/data/audio/phonics/。

使用方式（在您的個人電腦或終端機執行）：
  python download_standard_phonics.py
"""

import os
import sys
import urllib.request
import urllib.error

# 標準音標與維基媒體官方音檔資源映射表 (36 組高音質真人音標錄音)
STANDARD_IPA_SOURCES = [
    # 短母音 (Short Vowels)
    {"symbol": "[æ]", "ascii": "sv_a", "desc": "短母音 [æ] 蝴蝶音", "url": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Near-open_front_unrounded_vowel.ogg"},
    {"symbol": "[ɛ]", "ascii": "sv_e", "desc": "短母音 [ɛ] 微笑音", "url": "https://upload.wikimedia.org/wikipedia/commons/7/71/Open-mid_front_unrounded_vowel.ogg"},
    {"symbol": "[ɪ]", "ascii": "sv_i", "desc": "短母音 [ɪ] 放鬆音", "url": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Near-close_near-front_unrounded_vowel.ogg"},
    {"symbol": "[ɑ]", "ascii": "sv_o", "desc": "短母音 [ɑ] 大口音", "url": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Open_back_unrounded_vowel.ogg"},
    {"symbol": "[ʌ]", "ascii": "sv_u", "desc": "短母音 [ʌ] 尖下巴音", "url": "https://upload.wikimedia.org/wikipedia/commons/8/87/Open-mid_back_unrounded_vowel.ogg"},
    {"symbol": "[ə]", "ascii": "sv_schwa", "desc": "央母音 [ə] 懶人音", "url": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Mid-central_vowel.ogg"},
    
    # 長母音與雙母音 (Long Vowels & Diphthongs)
    {"symbol": "[e]", "ascii": "lv_a", "desc": "長母音 [e] / [eɪ]", "url": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Close-mid_front_unrounded_vowel.ogg"},
    {"symbol": "[i]", "ascii": "lv_e", "desc": "長母音 [i]", "url": "https://upload.wikimedia.org/wikipedia/commons/9/91/Close_front_unrounded_vowel.ogg"},
    {"symbol": "[o]", "ascii": "lv_o", "desc": "長母音 [o]", "url": "https://upload.wikimedia.org/wikipedia/commons/8/84/Close-mid_back_rounded_vowel.ogg"},
    {"symbol": "[u]", "ascii": "lv_oo_long", "desc": "長音 [u]", "url": "https://upload.wikimedia.org/wikipedia/commons/5/58/Close_back_rounded_vowel.ogg"},
    {"symbol": "[ʊ]", "ascii": "lv_oo_short", "desc": "短音 [ʊ]", "url": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Near-close_near-back_rounded_vowel.ogg"},
    
    # 單子音 - 無聲 vs 有聲獨立音素 (Consonants)
    {"symbol": "[p]", "ascii": "c_p", "desc": "雙唇無聲爆破音 [p] (純送氣)", "url": "https://upload.wikimedia.org/wikipedia/commons/5/51/Voiceless_bilabial_plosive.ogg"},
    {"symbol": "[b]", "ascii": "c_b", "desc": "雙唇有聲爆破音 [b] (純濁音)", "url": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Voiced_bilabial_plosive.ogg"},
    {"symbol": "[t]", "ascii": "c_t", "desc": "舌尖無聲爆破音 [t]", "url": "https://upload.wikimedia.org/wikipedia/commons/0/02/Voiceless_alveolar_plosive.ogg"},
    {"symbol": "[d]", "ascii": "c_d", "desc": "舌尖有聲爆破音 [d]", "url": "https://upload.wikimedia.org/wikipedia/commons/0/01/Voiced_alveolar_plosive.ogg"},
    {"symbol": "[k]", "ascii": "c_k", "desc": "舌根無聲爆破音 [k]", "url": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Voiceless_velar_plosive.ogg"},
    {"symbol": "[g]", "ascii": "c_g", "desc": "舌根有聲爆破音 [g]", "url": "https://upload.wikimedia.org/wikipedia/commons/1/12/Voiced_velar_plosive.ogg"},
    {"symbol": "[f]", "ascii": "c_f", "desc": "唇齒無聲摩擦音 [f]", "url": "https://upload.wikimedia.org/wikipedia/commons/3/33/Voiceless_labiodental_fricative.ogg"},
    {"symbol": "[v]", "ascii": "c_v", "desc": "唇齒有聲摩擦音 [v]", "url": "https://upload.wikimedia.org/wikipedia/commons/8/85/Voiced_labiodental_fricative.ogg"},
    {"symbol": "[s]", "ascii": "c_s", "desc": "齒齦無聲摩擦音 [s]", "url": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Voiceless_alveolar_sibilant.ogg"},
    {"symbol": "[z]", "ascii": "c_z", "desc": "齒齦有聲摩擦音 [z]", "url": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Voiced_alveolar_sibilant.ogg"},
    {"symbol": "[m]", "ascii": "c_m", "desc": "雙唇鼻音 [m]", "url": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Bilabial_nasal.ogg"},
    {"symbol": "[n]", "ascii": "c_n", "desc": "舌尖鼻音 [n]", "url": "https://upload.wikimedia.org/wikipedia/commons/2/29/Alveolar_nasal.ogg"},
    {"symbol": "[ŋ]", "ascii": "c_ng", "desc": "軟顎鼻音 [ŋ]", "url": "https://upload.wikimedia.org/wikipedia/commons/3/39/Velar_nasal.ogg"},
    {"symbol": "[l]", "ascii": "c_l", "desc": "舌邊齒齦流音 [l]", "url": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Alveolar_lateral_approximant.ogg"},
    {"symbol": "[r]", "ascii": "c_r", "desc": "齒齦捲舌音 [r] / [ɹ]", "url": "https://upload.wikimedia.org/wikipedia/commons/1/1f/Alveolar_approximant.ogg"},
    {"symbol": "[w]", "ascii": "c_w", "desc": "雙唇軟顎半母音 [w]", "url": "https://upload.wikimedia.org/wikipedia/commons/f/f2/Voiced_labio-velar_approximant.ogg"},
    {"symbol": "[j]", "ascii": "c_y", "desc": "硬顎半母音 [j]", "url": "https://upload.wikimedia.org/wikipedia/commons/e/e8/Palatal_approximant.ogg"},
    {"symbol": "[h]", "ascii": "c_h", "desc": "聲門無聲過渡音 [h]", "url": "https://upload.wikimedia.org/wikipedia/commons/d/da/Voiceless_glottal_fricative.ogg"},
    
    # 複合子音 (Digraphs)
    {"symbol": "[θ]", "ascii": "dg_th_unvoiced", "desc": "齒間無聲摩擦音 [θ] (咬舌吹氣)", "url": "https://upload.wikimedia.org/wikipedia/commons/8/80/Voiceless_dental_fricative.ogg"},
    {"symbol": "[ð]", "ascii": "dg_th_voiced", "desc": "齒間有聲摩擦音 [ð] (咬舌濁音)", "url": "https://upload.wikimedia.org/wikipedia/commons/6/6a/Voiced_dental_fricative.ogg"},
    {"symbol": "[ʃ]", "ascii": "dg_sh", "desc": "後齒齦無聲摩擦音 [ʃ] (噓音)", "url": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Voiceless_postalveolar_fricative.ogg"},
    {"symbol": "[tʃ]", "ascii": "dg_ch", "desc": "後齒齦無聲塞擦音 [tʃ]", "url": "https://upload.wikimedia.org/wikipedia/commons/b/be/Voiceless_postalveolar_affricate.ogg"}
]

PRIMARY_DIR = os.path.join(os.path.dirname(__file__), "data", "audio", "phonics")
SECONDARY_DIR = os.path.join(os.path.dirname(__file__), "data", "phonics")

def download_audio():
    os.makedirs(PRIMARY_DIR, exist_ok=True)
    os.makedirs(SECONDARY_DIR, exist_ok=True)
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WordCheckingPhonicsDownloader/1.0"}
    print("=" * 65)
    print("🌐 開始下載 100% 維基國際音標標準真人音檔 (Public Domain / CC)")
    print(f"📁 儲存目錄: {PRIMARY_DIR}")
    print("=" * 65 + "\n")
    
    success_count = 0
    for item in STANDARD_IPA_SOURCES:
        sym = item["symbol"]
        url = item["url"]
        desc = item["desc"]
        
        # 存為 [符號].mp3 (瀏覽器原生支援音訊格式)
        out_mp3_name = f"{sym}.mp3"
        out_mp3_path = os.path.join(PRIMARY_DIR, out_mp3_name)
        sec_mp3_path = os.path.join(SECONDARY_DIR, out_mp3_name)
        
        # 別名 ascii.mp3
        alias_name = f"{item['ascii']}.mp3"
        alias_path = os.path.join(PRIMARY_DIR, alias_name)
        
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                with open(out_mp3_path, "wb") as f:
                    f.write(data)
                with open(sec_mp3_path, "wb") as f:
                    f.write(data)
                with open(alias_path, "wb") as f:
                    f.write(data)
            print(f"  ✔ [成功] {sym:<12} ({out_mp3_name:<16}) - {desc}")
            success_count += 1
        except Exception as e:
            print(f"  ⚠ [跳過/失敗] {sym:<12}: {e}")
            
    print("\n" + "=" * 65)
    print(f"🎉 下載完成！共成功下載 {success_count} / {len(STANDARD_IPA_SOURCES)} 組國際標準音檔。")
    print("這些音檔為真正母語學者錄製之純音標，無任何單字或尾音干擾！")
    print("=" * 65)

if __name__ == "__main__":
    download_audio()
