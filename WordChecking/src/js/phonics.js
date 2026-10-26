(function(window) {
  'use strict';
  const PHONICS_CATEGORIES = [
    { key: 'all', label: '🌟 全部音素', icon: '✨' },
    { key: 'shortVowels', label: '🍎 短母音', icon: '🅰️' },
    { key: 'longVowels', label: '👑 長母音與雙母音', icon: '👑' },
    { key: 'consonants', label: '🔔 單子音 (無聲/有聲)', icon: '🔔' },
    { key: 'digraphs', label: '🧩 複合子音', icon: '🧩' }
  ];
  const PHONICS_DATA = [
    {
      id: 'sv_a',
      category: 'shortVowels',
      symbol: 'a',
      kk: '[æ]',
      name: '蝴蝶音 / 扁唇短母音',
      tip: '嘴巴張大（上下可容兩指），嘴角向兩邊拉平，舌尖抵住下齒齦，聲音短促清脆。',
      soundText: 'a',
      words: [
        { word: 'cat', kk: '[kæt]', zh: '貓', highlight: 'a' },
        { word: 'apple', kk: '[ˋæp!]', zh: '蘋果', highlight: 'a' },
        { word: 'bag', kk: '[bæg]', zh: '提袋', highlight: 'a' },
        { word: 'map', kk: '[mæp]', zh: '地圖', highlight: 'a' }
      ]
    },
    {
      id: 'sv_e',
      category: 'shortVowels',
      symbol: 'e',
      kk: '[ɛ]',
      name: '微笑短母音',
      tip: '嘴巴微張約一指寬，嘴角放鬆微帶微笑，舌前部微微抬起，音調自然平穩。',
      soundText: 'eh',
      words: [
        { word: 'bed', kk: '[bɛd]', zh: '床', highlight: 'e' },
        { word: 'egg', kk: '[ɛg]', zh: '蛋', highlight: 'e' },
        { word: 'pen', kk: '[pɛn]', zh: '原子筆', highlight: 'e' },
        { word: 'red', kk: '[rɛd]', zh: '紅色', highlight: 'e' }
      ]
    },
    {
      id: 'sv_i',
      category: 'shortVowels',
      symbol: 'i',
      kk: '[ɪ]',
      name: '放鬆短母音',
      tip: '嘴角放鬆微開，舌身放鬆微抬，快速發出介於「一」與「ㄝ」之間的短促音。',
      soundText: 'ih',
      words: [
        { word: 'pig', kk: '[pɪg]', zh: '豬', highlight: 'i' },
        { word: 'fish', kk: '[fɪʃ]', zh: '魚', highlight: 'i' },
        { word: 'big', kk: '[bɪg]', zh: '大的', highlight: 'i' },
        { word: 'sit', kk: '[sɪt]', zh: '坐下', highlight: 'i' }
      ]
    },
    {
      id: 'sv_o',
      category: 'shortVowels',
      symbol: 'o',
      kk: '[ɑ]',
      name: '大口短母音',
      tip: '下巴垂直往下放鬆大開，舌頭放平在口腔底部，發出宏亮的「啊」音。',
      soundText: 'ah',
      words: [
        { word: 'hot', kk: '[hɑt]', zh: '熱的', highlight: 'o' },
        { word: 'dog', kk: '[dɑg]', zh: '狗', highlight: 'o' },
        { word: 'box', kk: '[bɑks]', zh: '盒子', highlight: 'o' },
        { word: 'fox', kk: '[fɑks]', zh: '狐狸', highlight: 'o' }
      ]
    },
    {
      id: 'sv_u',
      category: 'shortVowels',
      symbol: 'u',
      kk: '[ʌ]',
      name: '短促頓音 / 尖下巴音',
      tip: '嘴型半開放鬆，下巴微開，舌身平放中央，短促有力地自喉部彈出「阿」音。',
      soundText: 'uh',
      words: [
        { word: 'cup', kk: '[kʌp]', zh: '杯子', highlight: 'u' },
        { word: 'sun', kk: '[sʌn]', zh: '太陽', highlight: 'u' },
        { word: 'bus', kk: '[bʌs]', zh: '公車', highlight: 'u' },
        { word: 'duck', kk: '[dʌk]', zh: '鴨子', highlight: 'u' }
      ]
    },
    {
      id: 'sv_schwa',
      category: 'shortVowels',
      symbol: 'a / o / u (非重音)',
      kk: '[ə]',
      name: '央母音 / 懶人音 (Schwa)',
      tip: '英語中最常見的非重音母音！口腔、舌頭完全放鬆不用力，極輕微短促發聲。',
      soundText: 'uh',
      words: [
        { word: 'banana', kk: '[bəˋnænə]', zh: '香蕉', highlight: 'a' },
        { word: 'about', kk: '[əˋbaʊt]', zh: '關於', highlight: 'a' },
        { word: 'sofa', kk: '[ˋsofə]', zh: '沙發', highlight: 'a' },
        { word: 'lemon', kk: '[ˋlɛmən]', zh: '檸檬', highlight: 'o' }
      ]
    },
    {
      id: 'lv_a',
      category: 'longVowels',
      symbol: 'a_e / ai / ay',
      kk: '[e]',
      name: '長母音 A (滑音 [eɪ])',
      tip: '口形由半開平唇 [e] 自然滑向微閉 [ɪ]，嘴角向兩側拉開，聲音飽滿延伸。',
      soundText: 'ay',
      words: [
        { word: 'cake', kk: '[kek]', zh: '蛋糕', highlight: 'a_e' },
        { word: 'rain', kk: '[ren]', zh: '下雨', highlight: 'ai' },
        { word: 'day', kk: '[de]', zh: '白天/日子', highlight: 'ay' },
        { word: 'game', kk: '[gem]', zh: '遊戲', highlight: 'a_e' }
      ]
    },
    {
      id: 'lv_e',
      category: 'longVowels',
      symbol: 'ee / ea / e_e',
      kk: '[i]',
      name: '長母音 E (微笑長音)',
      tip: '嘴角向兩旁拉至最緊呈現燦爛微笑狀，舌面前部貼近硬顎，發出清晰拉長的「衣」音。',
      soundText: 'ee',
      words: [
        { word: 'bee', kk: '[bi]', zh: '蜜蜂', highlight: 'ee' },
        { word: 'tea', kk: '[ti]', zh: '茶', highlight: 'ea' },
        { word: 'tree', kk: '[tri]', zh: '樹木', highlight: 'ee' },
        { word: 'meat', kk: '[mit]', zh: '肉類', highlight: 'ea' }
      ]
    },
    {
      id: 'lv_i',
      category: 'longVowels',
      symbol: 'i_e / igh / y',
      kk: '[aɪ]',
      name: '長母音 I (雙母音)',
      tip: '嘴巴由大開 [ɑ] 迅速滑向扁唇微閉 [ɪ]，前長後短、聲音流暢過渡。',
      soundText: 'eye',
      words: [
        { word: 'bike', kk: '[baɪk]', zh: '腳踏車', highlight: 'i_e' },
        { word: 'fly', kk: '[flaɪ]', zh: '飛行', highlight: 'y' },
        { word: 'light', kk: '[laɪt]', zh: '光線', highlight: 'igh' },
        { word: 'time', kk: '[taɪm]', zh: '時間', highlight: 'i_e' }
      ]
    },
    {
      id: 'lv_o',
      category: 'longVowels',
      symbol: 'o_e / oa / ow',
      kk: '[o]',
      name: '長母音 O (圓唇滑音 [oʊ])',
      tip: '雙唇由半圓 [o] 逐漸縮成小圓圈 [ʊ]，聲音圓潤飽滿。',
      soundText: 'oh',
      words: [
        { word: 'nose', kk: '[noz]', zh: '鼻子', highlight: 'o_e' },
        { word: 'boat', kk: '[bot]', zh: '小船', highlight: 'oa' },
        { word: 'snow', kk: '[sno]', zh: '雪', highlight: 'ow' },
        { word: 'home', kk: '[hom]', zh: '家', highlight: 'o_e' }
      ]
    },
    {
      id: 'lv_u',
      category: 'longVowels',
      symbol: 'u_e / ew',
      kk: '[ju]',
      name: '長母音 U',
      tip: '由半母音 [j] 迅速滑向雙唇緊縮的圓唇長音 [u]，聽起來像「優～」。',
      soundText: 'you',
      words: [
        { word: 'cute', kk: '[kjut]', zh: '可愛的', highlight: 'u_e' },
        { word: 'new', kk: '[nju]', zh: '新的', highlight: 'ew' },
        { word: 'music', kk: '[ˋmjuzɪk]', zh: '音樂', highlight: 'u' },
        { word: 'few', kk: '[fju]', zh: '很少數', highlight: 'ew' }
      ]
    },
    {
      id: 'lv_oo_long',
      category: 'longVowels',
      symbol: 'oo (長音)',
      kk: '[u]',
      name: '長嗚音',
      tip: '雙唇向前突出用力縮成小圓孔，舌後部高抬，發出深沉平穩的「屋～」長音。',
      soundText: 'oo',
      words: [
        { word: 'moon', kk: '[mun]', zh: '月亮', highlight: 'oo' },
        { word: 'food', kk: '[fud]', zh: '食物', highlight: 'oo' },
        { word: 'zoo', kk: '[zu]', zh: '動物園', highlight: 'oo' },
        { word: 'cool', kk: '[kul]', zh: '涼爽/酷', highlight: 'oo' }
      ]
    },
    {
      id: 'lv_oo_short',
      category: 'longVowels',
      symbol: 'oo (短音)',
      kk: '[ʊ]',
      name: '短圓唇音',
      tip: '雙唇微圓微向前凸但保持放鬆，舌後部微抬，發出短促的「屋」音。',
      soundText: 'uh',
      words: [
        { word: 'book', kk: '[bʊk]', zh: '書本', highlight: 'oo' },
        { word: 'look', kk: '[lʊk]', zh: '看', highlight: 'oo' },
        { word: 'foot', kk: '[fʊt]', zh: '腳', highlight: 'oo' },
        { word: 'good', kk: '[gʊd]', zh: '好的', highlight: 'oo' }
      ]
    },
    {
      id: 'lv_ou_ow',
      category: 'longVowels',
      symbol: 'ou / ow',
      kk: '[aʊ]',
      name: '驚嘆雙母音 (嗷)',
      tip: '嘴巴張大發 [ɑ]，隨後雙唇快速收圓滑向 [ʊ]，就像被捏一下喊出「嗷～」。',
      soundText: 'ow',
      words: [
        { word: 'house', kk: '[haʊs]', zh: '房子', highlight: 'ou' },
        { word: 'cow', kk: '[kaʊ]', zh: '母牛', highlight: 'ow' },
        { word: 'mouse', kk: '[maʊs]', zh: '老鼠', highlight: 'ou' },
        { word: 'brown', kk: '[braʊn]', zh: '棕色', highlight: 'ow' }
      ]
    },
    {
      id: 'lv_oi_oy',
      category: 'longVowels',
      symbol: 'oi / oy',
      kk: '[ɔɪ]',
      name: '雙母音 OI',
      tip: '由圓唇的 [ɔ] 滑向嘴角拉平的 [ɪ]，口型由圓變扁。',
      soundText: 'oy',
      words: [
        { word: 'boy', kk: '[bɔɪ]', zh: '男孩', highlight: 'oy' },
        { word: 'toy', kk: '[tɔɪ]', zh: '玩具', highlight: 'oy' },
        { word: 'coin', kk: '[kɔɪn]', zh: '硬幣', highlight: 'oi' },
        { word: 'oil', kk: '[ɔɪl]', zh: '油', highlight: 'oi' }
      ]
    },
    {
      id: 'lv_ar',
      category: 'longVowels',
      symbol: 'ar',
      kk: '[ɑr]',
      name: '捲舌母音 AR',
      tip: '嘴巴張大發 [ɑ]，發音同時舌尖迅速向上向後捲起，帶出飽滿捲舌音。',
      soundText: 'ar',
      words: [
        { word: 'car', kk: '[kɑr]', zh: '汽車', highlight: 'ar' },
        { word: 'star', kk: '[stɑr]', zh: '星星', highlight: 'ar' },
        { word: 'park', kk: '[pɑrk]', zh: '公園', highlight: 'ar' },
        { word: 'farm', kk: '[fɑrm]', zh: '農場', highlight: 'ar' }
      ]
    },
    {
      id: 'lv_er_ir_ur',
      category: 'longVowels',
      symbol: 'er / ir / ur',
      kk: '[ɝ / ɚ]',
      name: '中央捲舌母音',
      tip: '雙唇微開，舌身平抬中央，舌尖向後捲起，聲帶強力振動發出持續捲舌音。',
      soundText: 'er',
      words: [
        { word: 'bird', kk: '[bɝd]', zh: '鳥', highlight: 'ir' },
        { word: 'girl', kk: '[gɝl]', zh: '女孩', highlight: 'ir' },
        { word: 'nurse', kk: '[nɝs]', zh: '護士', highlight: 'ur' },
        { word: 'teacher', kk: '[ˋtitʃɚ]', zh: '老師', highlight: 'er' }
      ]
    },
    {
      id: 'c_p',
      category: 'consonants',
      symbol: 'p',
      kk: '[p]',
      name: '雙唇無聲爆破音',
      tip: '雙唇緊閉阻擋氣流後突然爆破！僅送出強烈氣流，聲帶完全不振動。',
      soundText: 'puh',
      words: [
        { word: 'pig', kk: '[pɪg]', zh: '豬', highlight: 'p' },
        { word: 'pen', kk: '[pɛn]', zh: '原子筆', highlight: 'p' },
        { word: 'pet', kk: '[pɛt]', zh: '寵物', highlight: 'p' },
        { word: 'cup', kk: '[kʌp]', zh: '杯子', highlight: 'p' }
      ]
    },
    {
      id: 'c_b',
      category: 'consonants',
      symbol: 'b',
      kk: '[b]',
      name: '雙唇有聲爆破音',
      tip: '雙唇緊閉阻擋氣流後突然彈開，聲帶強力振動發出濁音。',
      soundText: 'buh',
      words: [
        { word: 'big', kk: '[bɪg]', zh: '大的', highlight: 'b' },
        { word: 'bed', kk: '[bɛd]', zh: '床', highlight: 'b' },
        { word: 'bag', kk: '[bæg]', zh: '提袋', highlight: 'b' },
        { word: 'bus', kk: '[bʌs]', zh: '公車', highlight: 'b' }
      ]
    },
    {
      id: 'c_t',
      category: 'consonants',
      symbol: 't',
      kk: '[t]',
      name: '舌尖無聲爆破音',
      tip: '舌尖緊貼上齒齦阻擋氣流後彈開，氣流彈出，聲帶不振動。',
      soundText: 'tuh',
      words: [
        { word: 'ten', kk: '[tɛn]', zh: '十', highlight: 't' },
        { word: 'tea', kk: '[ti]', zh: '茶', highlight: 't' },
        { word: 'top', kk: '[tɑp]', zh: '頂端', highlight: 't' },
        { word: 'cat', kk: '[kæt]', zh: '貓', highlight: 't' }
      ]
    },
    {
      id: 'c_d',
      category: 'consonants',
      symbol: 'd',
      kk: '[d]',
      name: '舌尖有聲爆破音',
      tip: '舌尖緊貼上齒齦阻擋氣流後彈開，聲帶強力振動發出濁音。',
      soundText: 'duh',
      words: [
        { word: 'dog', kk: '[dɑg]', zh: '狗', highlight: 'd' },
        { word: 'desk', kk: '[dɛsk]', zh: '書桌', highlight: 'd' },
        { word: 'red', kk: '[rɛd]', zh: '紅色', highlight: 'd' },
        { word: 'dad', kk: '[dæd]', zh: '爸爸', highlight: 'd' }
      ]
    },
    {
      id: 'c_k',
      category: 'consonants',
      symbol: 'k / c',
      kk: '[k]',
      name: '舌根無聲爆破音',
      tip: '舌後部緊貼軟顎形成阻礙後突然釋放！送氣爆破，聲帶不振動。',
      soundText: 'kuh',
      words: [
        { word: 'cat', kk: '[kæt]', zh: '貓', highlight: 'c' },
        { word: 'king', kk: '[kɪŋ]', zh: '國王', highlight: 'k' },
        { word: 'cup', kk: '[kʌp]', zh: '杯子', highlight: 'c' },
        { word: 'duck', kk: '[dʌk]', zh: '鴨子', highlight: 'ck' }
      ]
    },
    {
      id: 'c_g',
      category: 'consonants',
      symbol: 'g',
      kk: '[g]',
      name: '舌根有聲爆破音',
      tip: '舌後部緊貼軟顎阻礙氣流後彈開，喉部聲帶重重振動發聲。',
      soundText: 'guh',
      words: [
        { word: 'girl', kk: '[gɝl]', zh: '女孩', highlight: 'g' },
        { word: 'game', kk: '[gem]', zh: '遊戲', highlight: 'g' },
        { word: 'big', kk: '[bɪg]', zh: '大的', highlight: 'g' },
        { word: 'pig', kk: '[pɪg]', zh: '豬', highlight: 'g' }
      ]
    },
    {
      id: 'c_f',
      category: 'consonants',
      symbol: 'f',
      kk: '[f]',
      name: '唇齒無聲摩擦音',
      tip: '上門牙輕觸下嘴唇內緣，氣流自齒縫擠出！呼氣摩擦，聲帶不振動。',
      soundText: 'f',
      words: [
        { word: 'fish', kk: '[fɪʃ]', zh: '魚', highlight: 'f' },
        { word: 'fan', kk: '[fæn]', zh: '風扇', highlight: 'f' },
        { word: 'fox', kk: '[fɑks]', zh: '狐狸', highlight: 'f' },
        { word: 'fat', kk: '[fæt]', zh: '胖的', highlight: 'f' }
      ]
    },
    {
      id: 'c_v',
      category: 'consonants',
      symbol: 'v',
      kk: '[v]',
      name: '唇齒有聲摩擦音',
      tip: '上門牙輕觸下嘴唇內緣，氣流自齒縫擠出並同時強力震動聲帶。',
      soundText: 'v',
      words: [
        { word: 'van', kk: '[væn]', zh: '廂型車', highlight: 'v' },
        { word: 'five', kk: '[faɪv]', zh: '五', highlight: 'v' },
        { word: 'vest', kk: '[vɛst]', zh: '背心', highlight: 'v' },
        { word: 'vet', kk: '[vɛt]', zh: '獸醫', highlight: 'v' }
      ]
    },
    {
      id: 'c_s',
      category: 'consonants',
      symbol: 's',
      kk: '[s]',
      name: '齒齦無聲摩擦音',
      tip: '舌尖微貼近上齒齦留下狹縫，氣流摩擦逸出發出嘶嘶聲，聲帶不振動。',
      soundText: 's',
      words: [
        { word: 'sun', kk: '[sʌn]', zh: '太陽', highlight: 's' },
        { word: 'sit', kk: '[sɪt]', zh: '坐下', highlight: 's' },
        { word: 'six', kk: '[sɪks]', zh: '六', highlight: 's' },
        { word: 'bus', kk: '[bʌs]', zh: '公車', highlight: 's' }
      ]
    },
    {
      id: 'c_z',
      category: 'consonants',
      symbol: 'z',
      kk: '[z]',
      name: '齒齦有聲摩擦音',
      tip: '舌尖微貼近上齒齦，氣流摩擦並強力震動聲帶，發出蜜蜂嗡鳴聲。',
      soundText: 'z',
      words: [
        { word: 'zoo', kk: '[zu]', zh: '動物園', highlight: 'z' },
        { word: 'zero', kk: '[ˋzɪro]', zh: '零', highlight: 'z' },
        { word: 'zip', kk: '[zɪp]', zh: '拉鍊', highlight: 'z' },
        { word: 'size', kk: '[saɪz]', zh: '尺寸', highlight: 'z' }
      ]
    },
    {
      id: 'c_m',
      category: 'consonants',
      symbol: 'm',
      kk: '[m]',
      name: '雙唇鼻音',
      tip: '雙唇緊閉，軟顎下垂，氣流自鼻腔共鳴逸出，聲帶振動。',
      soundText: 'm',
      words: [
        { word: 'map', kk: '[mæp]', zh: '地圖', highlight: 'm' },
        { word: 'man', kk: '[mæn]', zh: '男人', highlight: 'm' },
        { word: 'mom', kk: '[mɑm]', zh: '媽媽', highlight: 'm' },
        { word: 'milk', kk: '[mɪlk]', zh: '牛奶', highlight: 'm' }
      ]
    },
    {
      id: 'c_n',
      category: 'consonants',
      symbol: 'n',
      kk: '[n]',
      name: '舌尖齒齦鼻音',
      tip: '舌尖緊貼上齒齦，氣流完全自鼻腔震動逸出，聲帶振動。',
      soundText: 'n',
      words: [
        { word: 'nose', kk: '[noz]', zh: '鼻子', highlight: 'n' },
        { word: 'net', kk: '[nɛt]', zh: '網子', highlight: 'n' },
        { word: 'nut', kk: '[nʌt]', zh: '堅果', highlight: 'n' },
        { word: 'sun', kk: '[sʌn]', zh: '太陽', highlight: 'n' }
      ]
    },
    {
      id: 'c_ng',
      category: 'consonants',
      symbol: 'ng',
      kk: '[ŋ]',
      name: '軟顎鼻音',
      tip: '舌後部緊貼軟顎阻斷口腔，氣流由鼻腔共鳴發出「嗯/昂」鼻音。',
      soundText: 'ng',
      words: [
        { word: 'sing', kk: '[sɪŋ]', zh: '唱歌', highlight: 'ng' },
        { word: 'ring', kk: '[rɪŋ]', zh: '戒指', highlight: 'ng' },
        { word: 'king', kk: '[kɪŋ]', zh: '國王', highlight: 'ng' },
        { word: 'song', kk: '[sɔŋ]', zh: '歌曲', highlight: 'ng' }
      ]
    },
    {
      id: 'c_l',
      category: 'consonants',
      symbol: 'l',
      kk: '[l]',
      name: '舌邊齒齦流音',
      tip: '舌尖緊頂上齒齦，聲帶振動，氣流由舌頭兩側流出。',
      soundText: 'ull',
      words: [
        { word: 'leg', kk: '[lɛg]', zh: '腿', highlight: 'l' },
        { word: 'light', kk: '[laɪt]', zh: '光線', highlight: 'l' },
        { word: 'lip', kk: '[lɪp]', zh: '嘴唇', highlight: 'l' },
        { word: 'bell', kk: '[bɛl]', zh: '鈴鐺', highlight: 'll' }
      ]
    },
    {
      id: 'c_r',
      category: 'consonants',
      symbol: 'r',
      kk: '[r]',
      name: '齒齦捲舌音',
      tip: '舌尖向後捲起但絕不可碰觸上顎，雙唇微圓突出，聲帶振動。',
      soundText: 'err',
      words: [
        { word: 'red', kk: '[rɛd]', zh: '紅色', highlight: 'r' },
        { word: 'right', kk: '[raɪt]', zh: '正確的', highlight: 'r' },
        { word: 'run', kk: '[rʌn]', zh: '跑步', highlight: 'r' },
        { word: 'car', kk: '[kɑr]', zh: '汽車', highlight: 'r' }
      ]
    },
    {
      id: 'c_w',
      category: 'consonants',
      symbol: 'w',
      kk: '[w]',
      name: '雙唇軟顎半母音',
      tip: '雙唇收圓突出如吹哨狀，舌後部抬高，迅速滑向後面的母音。',
      soundText: 'wuh',
      words: [
        { word: 'water', kk: '[ˋwɔtɚ]', zh: '水', highlight: 'w' },
        { word: 'win', kk: '[wɪn]', zh: '贏得', highlight: 'w' },
        { word: 'wet', kk: '[wɛt]', zh: '濕的', highlight: 'w' },
        { word: 'cow', kk: '[kaʊ]', zh: '母牛', highlight: 'w' }
      ]
    },
    {
      id: 'c_y',
      category: 'consonants',
      symbol: 'y',
      kk: '[j]',
      name: '硬顎半母音',
      tip: '舌前部抬向硬顎如發短[i]，隨後迅速滑向後面的母音。',
      soundText: 'yuh',
      words: [
        { word: 'yes', kk: '[jɛs]', zh: '是的', highlight: 'y' },
        { word: 'yellow', kk: '[ˋjɛlo]', zh: '黃色', highlight: 'y' },
        { word: 'yet', kk: '[jɛt]', zh: '尚未', highlight: 'y' },
        { word: 'you', kk: '[ju]', zh: '你', highlight: 'y' }
      ]
    },
    {
      id: 'c_h',
      category: 'consonants',
      symbol: 'h',
      kk: '[h]',
      name: '聲門無聲過渡音',
      tip: '嘴巴張開成後面母音口型，氣流不受阻礙直接自聲門呼出。',
      soundText: 'huh',
      words: [
        { word: 'hat', kk: '[hæt]', zh: '帽子', highlight: 'h' },
        { word: 'hot', kk: '[hɑt]', zh: '熱的', highlight: 'h' },
        { word: 'hen', kk: '[hɛn]', zh: '母雞', highlight: 'h' },
        { word: 'hop', kk: '[hɑp]', zh: '跳躍', highlight: 'h' }
      ]
    },
    {
      id: 'dg_th_unvoiced',
      category: 'digraphs',
      symbol: 'th (無聲)',
      kk: '[θ]',
      name: '咬舌無聲音',
      tip: '舌尖輕輕伸出上下門牙之間（咬舌），送出強烈氣流，聲帶完全不振動！',
      soundText: 'th',
      words: [
        { word: 'think', kk: '[θɪŋk]', zh: '思考', highlight: 'th' },
        { word: 'three', kk: '[θri]', zh: '三', highlight: 'th' },
        { word: 'tooth', kk: '[tuθ]', zh: '牙齒', highlight: 'th' },
        { word: 'thank', kk: '[θæŋk]', zh: '感謝', highlight: 'th' }
      ]
    },
    {
      id: 'dg_th_voiced',
      category: 'digraphs',
      symbol: 'th (有聲)',
      kk: '[ð]',
      name: '咬舌有聲音',
      tip: '舌尖輕咬於上下門牙之間，用力吐氣並同時強力震動聲帶，發出嗡嗡震感。',
      soundText: 'th',
      words: [
        { word: 'this', kk: '[ðɪs]', zh: '這個', highlight: 'th' },
        { word: 'that', kk: '[ðæt]', zh: '那個', highlight: 'th' },
        { word: 'father', kk: '[ˋfɑðɚ]', zh: '父親', highlight: 'th' },
        { word: 'they', kk: '[ðe]', zh: '他們', highlight: 'th' }
      ]
    },
    {
      id: 'dg_sh',
      category: 'digraphs',
      symbol: 'sh',
      kk: '[ʃ]',
      name: '安靜噓音',
      tip: '雙唇微向前突出成方圓形，舌身抬起，氣流從舌面凹槽噴出，就像示意別人安靜「噓～」。',
      soundText: 'sh',
      words: [
        { word: 'ship', kk: '[ʃɪp]', zh: '船艦', highlight: 'sh' },
        { word: 'fish', kk: '[fɪʃ]', zh: '魚', highlight: 'sh' },
        { word: 'shop', kk: '[ʃɑp]', zh: '商店', highlight: 'sh' },
        { word: 'shoe', kk: '[ʃu]', zh: '鞋子', highlight: 'sh' }
      ]
    },
    {
      id: 'dg_ch',
      category: 'digraphs',
      symbol: 'ch / tch',
      kk: '[tʃ]',
      name: '清脆破擦音 (七)',
      tip: '舌尖緊貼上齒齦先阻擋氣流，然後瞬間分開讓氣流爆發擦出，類似清脆短促的「ㄑㄧ」。',
      soundText: 'ch',
      words: [
        { word: 'chair', kk: '[tʃɛr]', zh: '椅子', highlight: 'ch' },
        { word: 'lunch', kk: '[lʌntʃ]', zh: '午餐', highlight: 'ch' },
        { word: 'chin', kk: '[tʃɪn]', zh: '下巴', highlight: 'ch' },
        { word: 'watch', kk: '[wɑtʃ]', zh: '手錶', highlight: 'tch' }
      ]
    },
    {
      id: 'dg_wh_ph',
      category: 'digraphs',
      symbol: 'wh / ph',
      kk: '[hw / w] ＆ [f]',
      name: '特異複合音',
      tip: 'wh 雙唇縮圓呼氣發 [w]；ph 固定念 [f]，上齒咬下唇送氣。',
      soundText: 'wh, ph',
      words: [
        { word: 'white', kk: '[hwaɪt]', zh: '白色', highlight: 'wh' },
        { word: 'whale', kk: '[hwel]', zh: '鯨魚', highlight: 'wh' },
        { word: 'phone', kk: '[fon]', zh: '電話', highlight: 'ph' },
        { word: 'photo', kk: '[ˋfoto]', zh: '照片', highlight: 'ph' }
      ]
    },
    {
      id: 'dg_ck',
      category: 'digraphs',
      symbol: 'ck',
      kk: '[k]',
      name: '短母音字尾結尾音',
      tip: '通常緊接在短母音之後，舌根頂軟顎俐落中斷氣流，清脆結尾！',
      soundText: 'k',
      words: [
        { word: 'duck', kk: '[dʌk]', zh: '鴨子', highlight: 'ck' },
        { word: 'clock', kk: '[klɑk]', zh: '時鐘', highlight: 'ck' },
        { word: 'black', kk: '[blæk]', zh: '黑色', highlight: 'ck' },
        { word: 'rock', kk: '[rɑk]', zh: '岩石', highlight: 'ck' }
      ]
    }
  ];
  const MINIMAL_PAIRS_QUESTIONS = [
    {
      id: 'mp_1',
      title: '短母音對決：[æ] vs [ɛ]',
      desc: '蝴蝶音 [æ] 嘴巴要張大，微笑音 [ɛ] 嘴角向兩側微張！',
      target: { word: 'bed', kk: '[bɛd]', zh: '床', symbol: 'e [ɛ]' },
      foil: { word: 'bad', kk: '[bæd]', zh: '壞的', symbol: 'a [æ]' },
      audioWord: 'bed'
    },
    {
      id: 'mp_2',
      title: '長短母音對決：[i] vs [ɪ]',
      desc: '長音 [i] 微笑拉長，短音 [ɪ] 放鬆短促！',
      target: { word: 'ship', kk: '[ʃɪp]', zh: '輪船', symbol: 'i [ɪ]' },
      foil: { word: 'sheep', kk: '[ʃip]', zh: '綿羊', symbol: 'ee [i]' },
      audioWord: 'ship'
    },
    {
      id: 'mp_3',
      title: '短母音對決：[ɑ] vs [ʌ]',
      desc: '大口音 [ɑ] 下巴垂直大開，短頓音 [ʌ] 舌身平放短促！',
      target: { word: 'cup', kk: '[kʌp]', zh: '杯子', symbol: 'u [ʌ]' },
      foil: { word: 'cop', kk: '[kɑp]', zh: '警察', symbol: 'o [ɑ]' },
      audioWord: 'cup'
    },
    {
      id: 'mp_4',
      title: '齒間音對決：[θ] (咬舌) vs [s] (齒齦)',
      desc: '咬舌音 [θ] 舌尖一定要伸出牙齒外，[s] 舌尖留在牙齦後！',
      target: { word: 'think', kk: '[θɪŋk]', zh: '思考', symbol: 'th [θ]' },
      foil: { word: 'sink', kk: '[sɪŋk]', zh: '水槽/下沉', symbol: 's [s]' },
      audioWord: 'think'
    },
    {
      id: 'mp_5',
      title: '唇齒音對決：[f] vs [v]',
      desc: '兩者都要上牙咬下唇，[f] 氣音無聲，[v] 聲帶強力振動！',
      target: { word: 'fan', kk: '[fæn]', zh: '風扇', symbol: 'f [f]' },
      foil: { word: 'van', kk: '[væn]', zh: '廂型車', symbol: 'v [v]' },
      audioWord: 'fan'
    },
    {
      id: 'mp_6',
      title: '雙唇音對決：[p] vs [b]',
      desc: '[p] 是無聲爆破音，[b] 聲帶必須劇烈振動！',
      target: { word: 'pig', kk: '[pɪg]', zh: '豬', symbol: 'p [p]' },
      foil: { word: 'big', kk: '[bɪg]', zh: '大的', symbol: 'b [b]' },
      audioWord: 'pig'
    },
    {
      id: 'mp_7',
      title: '邊音與捲舌：[l] vs [r]',
      desc: '[l] 舌尖頂齒齦，[r] 舌尖向後捲起絕不碰上顎！',
      target: { word: 'red', kk: '[rɛd]', zh: '紅色', highlight: 'r [r]' },
      foil: { word: 'led', kk: '[lɛd]', zh: '帶領(過去式)', highlight: 'l [l]' },
      audioWord: 'red'
    },
    {
      id: 'mp_8',
      title: '長短母音對決：[u] vs [ʊ]',
      desc: '[u] 雙唇用力縮圓成小孔，[ʊ] 嘴唇放鬆微圓！',
      target: { word: 'food', kk: '[fud]', zh: '食物', symbol: 'oo [u]' },
      foil: { word: 'foot', kk: '[fʊt]', zh: '腳', symbol: 'oo [ʊ]' },
      audioWord: 'food'
    },
    {
      id: 'mp_9',
      title: '長短母音對決：[e] vs [ɛ]',
      desc: '長音 [e] 由 [e] 滑向 [ɪ]，短音 [ɛ] 維持定格！',
      target: { word: 'cake', kk: '[kek]', zh: '蛋糕', symbol: 'a_e [e]' },
      foil: { word: 'neck', kk: '[nɛk]', zh: '脖子', symbol: 'e [ɛ]' },
      audioWord: 'cake'
    },
    {
      id: 'mp_10',
      title: '噓音與擦音：[ʃ] vs [s]',
      desc: '[ʃ] 嘴唇微往前翹噓音，[s] 嘴角向兩側微張嘶音！',
      target: { word: 'ship', kk: '[ʃɪp]', zh: '船', symbol: 'sh [ʃ]' },
      foil: { word: 'sip', kk: '[sɪp]', zh: '啜飲', symbol: 's [s]' },
      audioWord: 'ship'
    }
  ];
  let currentCategory = 'all';
  let activeQuizItem = null;
  let quizAnswered = false;
  let quizScore = 0;
  let quizTotal = 0;
  let bookmarkedSounds = new Set();
  try {
    const saved = localStorage.getItem('wordchecking_phonics_bookmarks');
    if (saved) bookmarkedSounds = new Set(JSON.parse(saved));
  } catch (e) {}
  const LOCAL_PHONICS_MAP = {
    'sv_a': ['[æ].mp3', 'sv_a.mp3'],
    'sv_e': ['[ɛ].mp3', 'sv_e.mp3'],
    'sv_i': ['[ɪ].mp3', 'sv_i.mp3'],
    'sv_o': ['[ɑ].mp3', 'sv_o.mp3'],
    'sv_u': ['[ʌ].mp3', 'sv_u.mp3'],
    'sv_schwa': ['[ə].mp3', 'sv_schwa.mp3'],
    'lv_a': ['[e].mp3', 'lv_a.mp3'],
    'lv_e': ['[i].mp3', 'lv_e.mp3'],
    'lv_i': ['[aɪ].mp3', 'lv_i.mp3'],
    'lv_o': ['[o].mp3', 'lv_o.mp3'],
    'lv_u': ['[ju].mp3', 'lv_u.mp3'],
    'lv_oo_long': ['[u].mp3', 'lv_oo_long.mp3'],
    'lv_oo_short': ['[ʊ].mp3', 'lv_oo_short.mp3'],
    'lv_ou_ow': ['[aʊ].mp3', 'lv_ou_ow.mp3'],
    'lv_oi_oy': ['[ɔɪ].mp3', 'lv_oi_oy.mp3'],
    'lv_ar': ['[ɑr].mp3', 'lv_ar.mp3'],
    'lv_er_ir_ur': ['[ɝ].mp3', 'lv_er_ir_ur.mp3'],
    'c_p': ['[p].mp3', 'c_p.mp3', 'p.mp3'],
    'c_b': ['[b].mp3', 'c_b.mp3', 'b.mp3'],
    'c_t': ['[t].mp3', 'c_t.mp3', 't.mp3'],
    'c_d': ['[d].mp3', 'c_d.mp3', 'd.mp3'],
    'c_k': ['[k].mp3', 'c_k.mp3', 'k.mp3'],
    'c_g': ['[g].mp3', 'c_g.mp3', 'g.mp3'],
    'c_f': ['[f].mp3', 'c_f.mp3', 'f.mp3'],
    'c_v': ['[v].mp3', 'c_v.mp3', 'v.mp3'],
    'c_s': ['[s].mp3', 'c_s.mp3', 's.mp3'],
    'c_z': ['[z].mp3', 'c_z.mp3', 'z.mp3'],
    'c_m': ['[m].mp3', 'c_m.mp3', 'm.mp3'],
    'c_n': ['[n].mp3', 'c_n.mp3', 'n.mp3'],
    'c_ng': ['[ŋ].mp3', 'c_ng.mp3', 'ng.mp3'],
    'c_l': ['[l].mp3', 'c_l.mp3', 'l.mp3'],
    'c_r': ['[r].mp3', 'c_r.mp3', 'r.mp3'],
    'c_w': ['[w].mp3', 'c_w.mp3', 'w.mp3'],
    'c_y': ['[j].mp3', 'c_y.mp3', 'y.mp3'],
    'c_h': ['[h].mp3', 'c_h.mp3', 'h.mp3'],
    'dg_th_unvoiced': ['[θ].mp3', 'dg_th_unvoiced.mp3'],
    'dg_th_voiced': ['[ð].mp3', 'dg_th_voiced.mp3'],
    'dg_sh': ['[ʃ].mp3', 'dg_sh.mp3'],
    'dg_ch': ['[tʃ].mp3', 'dg_ch.mp3'],
    'dg_wh_ph': ['[w_f].mp3', 'dg_wh_ph.mp3'],
    'dg_ck': ['[k_ck].mp3', 'dg_ck.mp3'],
    'c_pb': ['[p].mp3', '[b].mp3'],
    'c_td': ['[t].mp3', '[d].mp3'],
    'c_kg': ['[k].mp3', '[g].mp3'],
    'c_fv': ['[f].mp3', '[v].mp3'],
    'c_sz': ['[s].mp3', '[z].mp3'],
    'c_mn_ng': ['[m].mp3', '[n].mp3', '[ŋ].mp3'],
    'c_lr': ['[l].mp3', '[r].mp3'],
    'c_wyh': ['[w].mp3', '[j].mp3', '[h].mp3']
  };
  let detectedPhonicsBasePath = null;
  function getCandidatePhonicsDirs() {
    const list = [];
    if (detectedPhonicsBasePath) {
      list.push(detectedPhonicsBasePath);
    }
    const baseAudioDir = (typeof window !== 'undefined' && typeof window.getDetectedAudioBasePath === 'function')
      ? window.getDetectedAudioBasePath()
      : null;
    if (baseAudioDir) {
      const p = baseAudioDir.endsWith('/') ? baseAudioDir + 'phonics/' : baseAudioDir + '/phonics/';
      if (!list.includes(p)) list.push(p);
    }
    const priorityDirs = [
      './data/audio/phonics/',
      'data/audio/phonics/',
      './WordChecking/data/audio/phonics/',
      'WordChecking/data/audio/phonics/',
      '../data/audio/phonics/',
      '/APP/WordChecking/data/audio/phonics/',
      './data/phonics/',
      'data/phonics/',
      './WordChecking/data/phonics/',
      'WordChecking/data/phonics/',
      '../data/phonics/'
    ];
    for (const d of priorityDirs) {
      if (!list.includes(d)) list.push(d);
    }
    return list;
  }
  const PURE_PHONEME_SOUNDS = {
    'c_p': 'puh',
    'c_b': 'buh',
    'c_t': 'tuh',
    'c_d': 'duh',
    'c_k': 'kuh',
    'c_g': 'guh',
    'c_f': 'fah',
    'c_v': 'vuh',
    'c_s': 'sah',
    'c_z': 'zuh',
    'c_m': 'muh',
    'c_n': 'nuh',
    'c_ng': 'ung',
    'c_l': 'luh',
    'c_r': 'ruh',
    'c_w': 'wuh',
    'c_y': 'yuh',
    'c_h': 'huh',
    '[p]': 'puh',
    '[b]': 'buh',
    '[t]': 'tuh',
    '[d]': 'duh',
    '[k]': 'kuh',
    '[g]': 'guh',
    '[f]': 'fah',
    '[v]': 'vuh',
    '[s]': 'sah',
    '[z]': 'zuh',
    '[m]': 'muh',
    '[n]': 'nuh',
    '[ŋ]': 'ung',
    '[l]': 'luh',
    '[r]': 'ruh',
    '[w]': 'wuh',
    '[j]': 'yuh',
    '[h]': 'huh',
    '[θ]': 'th',
    '[ð]': 'thuh',
    '[ʃ]': 'sh',
    '[tʃ]': 'ch',
    'dg_th_unvoiced': 'th',
    'dg_th_voiced': 'thuh', // 純濁齒擦音擬音，杜絕 "the" (大阿大)
    'dg_sh': 'sh',
    'dg_ch': 'ch',
    'dg_wh_ph': 'wuh',
    'dg_ck': 'kuh',
    'sv_a': 'ah',           // [æ]
    'sv_e': 'eh',           // [ɛ]
    'sv_i': 'ih',           // [ɪ]
    'sv_o': 'ah',           // [ɑ]
    'sv_u': 'uh',           // [ʌ]
    'sv_schwa': 'uh',       // [ə]
    'lv_a': 'ay',           // [e]
    'lv_e': 'ee',           // [i]
    'lv_i': 'eye',          // [aɪ]
    'lv_o': 'oh',           // [o]
    'lv_u': 'you',          // [ju]
    'lv_oo_long': 'oo',     // [u]
    'lv_oo_short': 'uh',    // [ʊ]
    'lv_ou_ow': 'ow',       // [aʊ]
    'lv_oi_oy': 'oy',       // [ɔɪ]
    'lv_ar': 'ar',          // [ɑr]
    'lv_er_ir_ur': 'er'     // [ɝ]
  };
  let activePhonemeAudio = null;
  function playPurePhoneme(id, specificSymbol) {
    const item = PHONICS_DATA.find(x => x.id === id);
    if (!item) return;
    if (activePhonemeAudio) {
      try {
        activePhonemeAudio.pause();
        activePhonemeAudio.currentTime = 0;
      } catch (e) {}
      activePhonemeAudio = null;
    }
    let fallbackSound = PURE_PHONEME_SOUNDS[id] || item.soundText || item.symbol;
    let filenames = LOCAL_PHONICS_MAP[id] ? [...LOCAL_PHONICS_MAP[id]] : [];
    if (specificSymbol) {
      const symFile = specificSymbol.endsWith('.mp3') ? specificSymbol : `${specificSymbol}.mp3`;
      filenames = [symFile, ...filenames.filter(f => f !== symFile)];
      if (PURE_PHONEME_SOUNDS[specificSymbol]) {
        fallbackSound = PURE_PHONEME_SOUNDS[specificSymbol];
      }
    }
    const candidateDirs = getCandidatePhonicsDirs();
    let dirIdx = 0;
    let fileIdx = 0;
    let localPlayed = false;
    function tryNextLocalAudio() {
      if (dirIdx >= candidateDirs.length) {
        if (!localPlayed) {
          console.warn(`[Phonics Audio] 本地 MP3 音檔 ${filenames[0]} 未找到 (404)，已啟動 Web Speech 語音合成備援 (${fallbackSound})`);
          if (typeof window.sayCatSpeech === 'function') {
            window.sayCatSpeech(`音標【${displaySym}】本地 MP3 尚未部署，貓貓先以語音合成示範喵～🐾（請在 GitHub 產生並上傳 MP3）`, "語音備援");
          }
          playPhonicsAudio(fallbackSound, 0.85);
        }
        return;
      }
      const dir = candidateDirs[dirIdx];
      const fn = filenames[fileIdx] || `${id}.mp3`;
      const url = encodeURI(dir + fn);
      const audio = new Audio(url);
      activePhonemeAudio = audio;
      let hasHandled = false;
      const handleError = () => {
        if (hasHandled || localPlayed) return;
        hasHandled = true;
        fileIdx++;
        if (fileIdx >= filenames.length) {
          fileIdx = 0;
          dirIdx++;
        }
        tryNextLocalAudio();
      };
      audio.addEventListener('error', handleError);
      audio.addEventListener('play', () => {
        hasHandled = true;
        localPlayed = true;
        detectedPhonicsBasePath = dir;
        console.log(`[Phonics Audio] 成功播放本地 MP3 原音: ${url}`);
        if (typeof window.sayCatSpeech === 'function') {
          window.sayCatSpeech(`音標【${displaySym}】本地 MP3 原音播放！發音要訣：${item.tip}喵～🐾`, "純音標原音");
        }
      });
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          hasHandled = true;
          localPlayed = true;
          detectedPhonicsBasePath = dir;
        }).catch(handleError);
      }
    }
    if (filenames.length > 0) {
      tryNextLocalAudio();
    } else {
      playPhonicsAudio(fallbackSound, 0.85);
    }
    if (typeof window.sayCatSpeech === 'function') {
      const displaySym = specificSymbol ? `${specificSymbol}` : item.kk;
      window.sayCatSpeech(`音標【${displaySym}】自然發音【${item.symbol}】！發音要訣：${item.tip}喵～🐾`, "純音標單音");
    }
  }
  function playPhonicsBlending(id) {
    const item = PHONICS_DATA.find(x => x.id === id);
    if (!item || !item.words || item.words.length === 0) return;
    const targetWord = item.words[0].word;
    playPurePhoneme(id);
    setTimeout(() => {
      if (typeof window.playVoiceText === 'function') {
        window.playVoiceText(targetWord, 0.8);
      }
    }, 750);
    if (typeof window.sayCatSpeech === 'function') {
      window.sayCatSpeech(`拼讀拆解示範：先聽音標【${item.kk}】，再拼讀出單字「${targetWord}」喵！🐾`, "拼讀拆解");
    }
  }
  function playPhonicsAudio(text, rate = 0.9) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = rate;
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const enVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en_US' || (v.lang && v.lang.startsWith('en')));
          if (enVoice) u.voice = enVoice;
        }
        window.speechSynthesis.speak(u);
        return;
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    }
    if (typeof window.playVoiceText === 'function') {
      window.playVoiceText(text, rate);
    }
  }
  function playWordWithCat(word, zh) {
    playPhonicsAudio(word, 0.9);
    if (typeof window.sayCatSpeech === 'function') {
      window.sayCatSpeech(`"${word}"（${zh}），仔細聽發音喔喵！🐾`, "例字發音");
    }
  }
  function playSoundCard(item) {
    if (typeof item === 'string') {
      playPurePhoneme(item);
    } else if (item && item.id) {
      playPurePhoneme(item.id);
    }
  }
  function toggleBookmark(id) {
    if (bookmarkedSounds.has(id)) {
      bookmarkedSounds.delete(id);
    } else {
      bookmarkedSounds.add(id);
    }
    try {
      localStorage.setItem('wordchecking_phonics_bookmarks', JSON.stringify([...bookmarkedSounds]));
    } catch (e) {}
    renderPhonicsGrid();
  }
  function renderPhonicsGrid() {
    const grid = document.getElementById('phonicsCardGrid');
    if (!grid) return;
    const list = PHONICS_DATA.filter(item => {
      if (currentCategory === 'all') return true;
      if (currentCategory === 'bookmarks') return bookmarkedSounds.has(item.id);
      return item.category === currentCategory;
    });
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
          <span class="text-4xl block mb-2">🐾</span>
          <p class="font-bold">目前分類沒有標記的音素喵～點擊卡片右上角星星即可加入待加強！</p>
        </div>
      `;
      return;
    }
    grid.innerHTML = list.map(item => {
      const isStarred = bookmarkedSounds.has(item.id);
      return `
        <div class="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border ${isStarred ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20' : 'border-slate-200 dark:border-slate-700/80'} shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-baseline gap-2">
                <span class="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">${item.symbol}</span>
                <span class="text-base sm:text-lg font-bold text-slate-600 dark:text-slate-300 font-serif bg-slate-100 dark:bg-slate-700/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-600">${item.kk}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <button onclick="WordCheckingPhonics.toggleBookmark('${item.id}')" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-sm" title="${isStarred ? '取消標記' : '標記為待加強'}">
                  ${isStarred ? '⭐' : '☆'}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-2 mb-2.5">
              <button onclick="WordCheckingPhonics.playPurePhoneme('${item.id}')" class="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs shadow-xs transition transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer" title="只聽單純一個音標發音 (Isolated Sound)">
                <i class="fa-solid fa-volume-high text-xs"></i>
                <span>聽純音標 ${item.kk}</span>
              </button>
              <button onclick="WordCheckingPhonics.playBlending('${item.id}')" class="py-1.5 px-2.5 rounded-xl bg-amber-50 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-slate-600 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-slate-600 font-bold text-xs transition cursor-pointer flex items-center gap-1 whitespace-nowrap" title="先發音標再拼讀出單字">
                <span>🐾</span>
                <span>拼讀拆解</span>
              </button>
            </div>
            <div class="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1">
              <span>💡</span>
              <span>${item.name}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 bg-amber-50/50 dark:bg-slate-700/40 p-2 rounded-xl border border-amber-100/60 dark:border-slate-600/50">
              ${item.tip}
            </p>
          </div>
          <div class="border-t border-slate-100 dark:border-slate-700/60 pt-2.5">
            <div class="text-[11px] font-semibold text-slate-400 dark:text-slate-400 mb-1.5 flex items-center justify-between">
              <span>會考代表例字：</span>
              <span class="text-[10px] text-rose-500 dark:text-rose-400">點擊單字聽發音 🔊</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              ${item.words.map(w => `
                <button onclick="WordCheckingPhonics.playWord('${w.word}', '${w.zh}')" class="text-left px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 hover:bg-rose-50 dark:hover:bg-slate-600 hover:border-rose-300 border border-slate-100 dark:border-slate-600 transition flex items-center justify-between group/w cursor-pointer">
                  <div class="truncate mr-1">
                    <span class="text-xs font-black text-slate-800 dark:text-slate-100 group-hover/w:text-rose-600 dark:group-hover/w:text-rose-400">${w.word}</span>
                    <span class="text-[10px] text-slate-400 dark:text-slate-400 block truncate">${w.zh}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-serif opacity-0 group-hover/w:opacity-100 transition">${w.kk}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  function startPhonicsQuiz(autoPlay = false) {
    quizAnswered = false;
    const item = MINIMAL_PAIRS_QUESTIONS[Math.floor(Math.random() * MINIMAL_PAIRS_QUESTIONS.length)];
    activeQuizItem = item;
    const isTarget = Math.random() < 0.5;
    activeQuizItem.correctIsTarget = isTarget;
    activeQuizItem.playbackWord = isTarget ? item.target.word : item.foil.word;
    activeQuizItem.correctOption = isTarget ? item.target : item.foil;
    activeQuizItem.wrongOption = isTarget ? item.foil : item.target;
    const quizBox = document.getElementById('phonicsQuizBox');
    if (!quizBox) return;
    quizBox.innerHTML = `
      <div class="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 dark:from-slate-800 dark:to-slate-800/90 rounded-3xl p-5 sm:p-6 border border-indigo-200 dark:border-indigo-900/50 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-indigo-100 dark:border-slate-700 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🎧</span>
            <div>
              <h3 class="font-black text-slate-800 dark:text-slate-100 text-base sm:text-lg">聽音辨音精熟測驗</h3>
              <p class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">${item.title}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              得分：${quizScore} / ${quizTotal}
            </span>
          </div>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-700/60 p-2.5 rounded-xl border border-indigo-100 dark:border-slate-600">
          💡 辨音重點：${item.desc}
        </p>
        <div class="py-4 text-center">
          <button onclick="WordCheckingPhonics.replayQuizAudio()" class="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-black text-base shadow-lg shadow-indigo-500/25 transition transform hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer">
            <i class="fa-solid fa-volume-high text-xl"></i>
            <span>再次聆聽發音</span>
          </button>
          <div class="text-xs text-slate-400 dark:text-slate-400 mt-2">仔細聽聽看咪咪唸的是哪一個單字？</div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="phonicsQuizOptionsContainer">
          <button onclick="WordCheckingPhonics.checkQuizAnswer(true)" class="p-4 rounded-2xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-400 transition text-left cursor-pointer group shadow-2xs">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">${item.target.word}</span>
              <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-serif bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">${item.target.kk}</span>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400">${item.target.zh}（${item.target.symbol || ''}）</div>
          </button>
          <button onclick="WordCheckingPhonics.checkQuizAnswer(false)" class="p-4 rounded-2xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-400 transition text-left cursor-pointer group shadow-2xs">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">${item.foil.word}</span>
              <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-serif bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">${item.foil.kk}</span>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400">${item.foil.zh}（${item.foil.symbol || ''}）</div>
          </button>
        </div>
        <div id="phonicsQuizFeedbackBox" class="hidden rounded-2xl p-4 transition-all"></div>
      </div>
    `;
    if (autoPlay) {
      setTimeout(() => {
        replayQuizAudio();
      }, 300);
    }
  }
  function replayQuizAudio() {
    if (!activeQuizItem) return;
    playPhonicsAudio(activeQuizItem.playbackWord, 0.85);
  }
  function checkQuizAnswer(selectedIsTarget) {
    if (quizAnswered || !activeQuizItem) return;
    quizAnswered = true;
    quizTotal++;
    const isCorrect = selectedIsTarget === activeQuizItem.correctIsTarget;
    if (isCorrect) quizScore++;
    const fbBox = document.getElementById('phonicsQuizFeedbackBox');
    if (!fbBox) return;
    fbBox.classList.remove('hidden');
    if (isCorrect) {
      if (typeof window.addFish === 'function') window.addFish(1);
      if (typeof window.playCatCheerSound === 'function') window.playCatCheerSound();
      if (typeof window.sayCatSpeech === 'function') {
        window.sayCatSpeech(`答對了喵！妳選的是【${activeQuizItem.correctOption.word}】${activeQuizItem.correctOption.kk}！耳朵真靈光，送妳 1 條小魚乾 🐟✨`, "聽音太神");
      }
      fbBox.className = "rounded-2xl p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3";
      fbBox.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="text-3xl">🎉</span>
          <div>
            <div class="font-black text-sm sm:text-base">答對了！耳朵好靈敏！+1 魚乾 🐟</div>
            <div class="text-xs text-emerald-700 dark:text-emerald-300">正確答案是「${activeQuizItem.correctOption.word}」${activeQuizItem.correctOption.kk}（${activeQuizItem.correctOption.zh}）</div>
          </div>
        </div>
        <button onclick="WordCheckingPhonics.startQuiz(true)" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer self-end sm:self-center">
          下一題 🐾
        </button>
      `;
    } else {
      if (typeof window.playCatMeowSound === 'function') window.playCatMeowSound();
      if (typeof window.sayCatSpeech === 'function') {
        window.sayCatSpeech(`差一點點！剛才播放的是【${activeQuizItem.correctOption.word}】${activeQuizItem.correctOption.kk}，按下方按鈕來對比兩者發音差別喵～🐾`, "再聽一次");
      }
      fbBox.className = "rounded-2xl p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3";
      fbBox.innerHTML = `
        <div class="space-y-1">
          <div class="font-black text-sm sm:text-base flex items-center gap-1.5">
            <span>🐾</span>
            <span>答錯了，沒關係！剛才播放的是「${activeQuizItem.correctOption.word}」${activeQuizItem.correctOption.kk}</span>
          </div>
          <div class="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2 pt-1">
            <span>對比聽：</span>
            <button onclick="WordCheckingPhonics.playPhonicsAudio('${activeQuizItem.correctOption.word}')" class="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-amber-300 text-xs font-bold text-amber-800 dark:text-amber-200 cursor-pointer">
              🔊 ${activeQuizItem.correctOption.word} ${activeQuizItem.correctOption.kk}
            </button>
            <button onclick="WordCheckingPhonics.playPhonicsAudio('${activeQuizItem.wrongOption.word}')" class="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-amber-300 text-xs font-bold text-amber-800 dark:text-amber-200 cursor-pointer">
              🔊 ${activeQuizItem.wrongOption.word} ${activeQuizItem.wrongOption.kk}
            </button>
          </div>
        </div>
        <button onclick="WordCheckingPhonics.startQuiz(true)" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer self-end sm:self-center">
          下一題 🐾
        </button>
      `;
    }
  }
  function setPhonicsCategory(cat) {
    currentCategory = cat;
    const btnContainer = document.getElementById('phonicsCategoryButtons');
    if (btnContainer) {
      const btns = btnContainer.querySelectorAll('button');
      btns.forEach(b => {
        if (b.dataset.cat === cat) {
          b.className = "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-500 text-white shadow-xs transition-all cursor-pointer";
        } else {
          b.className = "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer";
        }
      });
    }
    renderPhonicsGrid();
  }
  function initPhonicsMode() {
    renderCategoryButtons();
    renderPhonicsGrid();
    startPhonicsQuiz();
  }
  function renderCategoryButtons() {
    const container = document.getElementById('phonicsCategoryButtons');
    if (!container) return;
    container.innerHTML = PHONICS_CATEGORIES.map(c => `
      <button data-cat="${c.key}" onclick="WordCheckingPhonics.setCategory('${c.key}')" class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${currentCategory === c.key ? 'bg-rose-500 text-white shadow-xs font-bold' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}">
        <span>${c.icon}</span>
        <span>${c.label}</span>
      </button>
    `).join('') + `
      <button data-cat="bookmarks" onclick="WordCheckingPhonics.setCategory('bookmarks')" class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer whitespace-nowrap ${currentCategory === 'bookmarks' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'}">
        <span>⭐</span>
        <span>待加強音標</span>
      </button>
    `;
  }
  window.WordCheckingPhonics = {
    init: initPhonicsMode,
    setCategory: setPhonicsCategory,
    playPurePhoneme: playPurePhoneme,
    playBlending: playPhonicsBlending,
    playSoundCard: (id) => {
      playPurePhoneme(id);
    },
    playWord: playWordWithCat,
    playPhonicsAudio: playPhonicsAudio,
    toggleBookmark: toggleBookmark,
    startQuiz: (play = true) => startPhonicsQuiz(play),
    replayQuizAudio: replayQuizAudio,
    checkQuizAnswer: checkQuizAnswer
  };
})(window);