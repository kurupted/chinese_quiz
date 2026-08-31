import os
import urllib.parse
import urllib.request
import json
import time

# Curated vocabulary pairs from Book 2 mapped to valid ARASAAC keywords
VOCAB_MAPPING = [
    # Lesson 1
    (1, "巷子", "xiàng_zi", "alley"),
    (1, "提款機", "tí_kuǎn_jī", "atm"),
    (1, "背包", "bèi_bāo", "backpack"),
    (1, "繼續", "jì_xù", "continue"),
    (1, "主任", "zhǔ_rèn", "director"),
    (1, "門", "mén", "door"),
    (1, "容易", "róng_yì", "easy"),
    (1, "小學", "xiǎo_xué", "primary school"),
    (1, "走", "zǒu", "walk"),
    (1, "過", "guò", "cross"),
    (1, "幫助", "bāng_zhù", "help"),
    (1, "節日", "jié_rì", "holidays"),
    (1, "餓", "è", "hungry"),
    (1, "路口", "lù_kǒu", "crossroads"),
    (1, "水上摩托車", "shuǐ_shàng_mó_tuō_chē", "jet ski"),
    (1, "報紙", "bào_zhǐ", "newspaper"),
    (1, "巴黎", "Bā_lí", "Paris"),
    (1, "筆", "bǐ", "pen"),
    (1, "汙染", "wū_rǎn", "pollution"),
    (1, "看見", "kàn_jiàn", "look"),
    (1, "汽水罐", "qì_shuǐ_guàn", "can"),
    (1, "路人", "lù_rén", "pedestrian"),
    (1, "考", "kǎo", "exam"),
    (1, "廟", "miào", "temple"),
    (1, "右轉", "yòu_zhuǎn", "turn right"),
    (1, "伯伯", "bó_bo", "uncle"),
    (1, "懂", "dǒng", "understand"),

    # Lesson 2
    (2, "飛機", "fēi_jī", "airplane"),
    (2, "機場", "jī_chǎng", "airport"),
    (2, "自行車", "zì_xíng_chē", "bicycle"),
    (2, "車站", "chē_zhàn", "station"),
    (2, "算", "suàn", "calculate"),
    (2, "筷子", "kuài_zi", "chopsticks"),
    (2, "教堂", "jiào_táng", "church"),
    (2, "收", "shōu", "collect"),
    (2, "飯廳", "fàn_tīng", "dining room"),
    (2, "潛水", "qián_shuǐ", "scuba diving"),
    (2, "下載", "xià_zài", "download"),
    (2, "地球", "dì_qiú", "Earth"),
    (2, "展覽館", "zhǎn_lǎn_guǎn", "museum"),
    (2, "法國", "Fǎ_guó", "France"),
    (2, "下", "xià", "get off"),
    (2, "島", "dǎo", "island"),
    (2, "長", "cháng", "long"),
    (2, "公尺", "gōng_chǐ", "meter"),
    (2, "宗教", "zōng_jiào", "religion"),
    (2, "海邊", "hǎi_biān", "beach"),
    (2, "街", "jiē", "street"),
    (2, "暑假", "shǔ_jià", "summer"),
    (2, "日月潭", "Rì_yuè_tán", "lake"),
    (2, "左轉", "zuǒ_zhuǎn", "turn left"),
    (2, "交通", "jiāo_tōng", "traffic"),
    (2, "喜宴", "xǐ_yàn", "banquet"),
    (2, "打工", "dǎ_gōng", "part time job"),

    # Lesson 3
    (3, "活動中心", "huó_dòng_zhōng_xīn", "community center"),
    (3, "廣告", "guǎng_gào", "advertisement"),
    (3, "新娘", "xīn_niáng", "bride"),
    (3, "鄉下", "xiāng_xià", "countryside"),
    (3, "桌子", "zhuō_zi", "table"),
    (3, "黃昏", "huáng_hūn", "sunset"),
    (3, "電", "diàn", "electricity"),
    (3, "外國人", "wài_guó_rén", "foreigner"),
    (3, "高興", "gāo_xìng", "happy"),
    (3, "爬山", "pá_shān", "trekking"),
    (3, "聊天", "liáo_tiān", "talk"),
    (3, "香港", "Xiāng_gǎng", "Hong Kong"),
    (3, "錯", "cuò", "wrong"),
    (3, "上午", "shàng_wǔ", "morning"),
    (3, "鍋子", "guō_zi", "pot"),
    (3, "春假", "chūn_jià", "vacations"),
    (3, "曬太陽", "shài_tài_yáng", "sunbathe"),
    (3, "教書", "jiāo_shū", "teach"),

    # Lesson 4
    (4, "日用品", "rì_yòng_pǐn", "supermarket"),
    (4, "亞洲", "Yà_zhōu", "Asia"),
    (4, "研究", "yán_jiū", "investigate"),
    (4, "說明", "shuō_míng", "explain"),
    (4, "未來", "wèi_lái", "future"),
    (4, "年級", "nián_jí", "grade"),
    (4, "面談", "miàn_tán", "interview"),
    (4, "介紹", "jiè_shào", "introduce"),
    (4, "法律", "fǎ_lǜ", "law"),
    (4, "公園", "gōng_yuán", "park"),
    (4, "演講", "yǎn_jiǎng", "lecture"),
    (4, "太極拳", "tài_jí_quán", "martial arts"),
    (4, "搭", "dā", "ride"),
    (4, "談", "tán", "discuss"),

    # Lesson 5
    (5, "大人", "dà_rén", "adult"),
    (5, "參加", "cān_jiā", "participate"),
    (5, "身體", "shēn_tǐ", "body"),
    (5, "破", "pò", "break"),
    (5, "建築", "jiàn_zhú", "building"),
    (5, "汽車", "qì_chē", "car"),
    (5, "充電", "chōng_diàn", "recharge battery"),
    (5, "城市", "chéng_shì", "city"),
    (5, "顏色", "yán_sè", "color"),
    (5, "禮服", "lǐ_fú", "dress"),
    (5, "結婚", "jié_hūn", "marry"),
    (5, "送", "sòng", "gift"),
    (5, "祝福", "zhù_fú", "congratulate"),
    (5, "客人", "kè_rén", "guest"),
    (5, "手", "shǒu", "hand"),
    (5, "酸辣湯", "suān_là_tāng", "soup"),
    (5, "敬酒", "jìng_jiǔ", "toast"),
    (5, "麥當勞", "Mài_dāng_láo", "fast food"),
    (5, "皮包", "pí_bāo", "handbag"),
    (5, "座位", "zuò_wèi", "seat"),
    (5, "偷", "tōu", "steal"),
    (5, "網站", "wǎng_zhàn", "website"),

    # Lesson 6
    (6, "床", "chuáng", "bed"),
    (6, "借", "jiè", "borrow"),
    (6, "辣椒", "là_jiāo", "pepper"),
    (6, "飲料", "yǐn_liào", "drink"),
    (6, "隨身碟", "suí_shēn_dié", "usb"),
    (6, "家具", "jiā_jù", "furniture"),
    (6, "討論", "tǎo_lùn", "discuss"),
    (6, "躺", "tǎng", "lie down"),
    (6, "迷路", "mí_lù", "lost"),
    (6, "橘子", "jú_zi", "orange"),
    (6, "薪水", "xīn_shuǐ", "salary"),
    (6, "浪漫", "làng_màn", "romantic"),
    (6, "存", "cún", "save money"),
    (6, "高中", "gāo_zhōng", "high school"),
    (6, "貼上", "tiē_shàng", "glue"),
    (6, "簡訊", "jiǎn_xùn", "sms"),
    (6, "世界", "shì_jiè", "world"),
    (6, "提", "tí", "withdraw money"),

    # Lesson 7
    (7, "袋子", "dài_zi", "bag"),
    (7, "椅子", "yǐ_zi", "chair"),
    (7, "開車", "kāi_chē", "drive"),
    (7, "垃圾", "lā_jī", "trash"),
    (7, "幫忙", "bāng_máng", "help"),
    (7, "肉", "ròu", "meat"),
    (7, "本子", "běn_zi", "notebook"),
    (7, "紙杯", "zhǐ_bēi", "paper cup"),
    (7, "回收桶", "huí_shōu_tǒng", "recycle bin"),
    (7, "紅包", "hóng_bāo", "red envelope"),
    (7, "跑", "pǎo", "run"),
    (7, "丟", "diū", "throw away"),
    (7, "紅綠燈", "hóng_lǜ_dēng", "traffic light"),
    (7, "換", "huàn", "change"),

    # Lesson 8
    (8, "船", "chuán", "boat"),
    (8, "熱鬧", "rè_nào", "crowd"),
    (8, "照相機", "zhào_xiàng_jī", "camera"),
    (8, "加拿大", "Jiā_ná_dà", "Canada"),
    (8, "體育館", "tǐ_yù_guǎn", "gym"),
    (8, "功夫", "gōng_fu", "martial arts"),
    (8, "腿", "tuǐ", "leg"),
    (8, "親戚", "qīn_qī", "relatives"),
    (8, "春捲", "chūn_juǎn", "spring roll"),
    (8, "馬路", "mǎ_lù", "street"),
    (8, "西裝", "xī_zhuāng", "suit"),
    (8, "瘦", "shòu", "thin"),

    # Lesson 9
    (9, "巴士", "bā_shì", "bus"),
    (9, "過年", "guò_nián", "new year"),
    (9, "大白菜", "dà_bái_cài", "cabbage"),
    (9, "打掃", "dǎ_sǎo", "clean"),
    (9, "做菜", "zuò_cài", "cook"),
    (9, "煮", "zhǔ", "boil"),
    (9, "離開", "lí_kāi", "leave"),
    (9, "魚", "yú", "fish"),
    (9, "請客", "qǐng_kè", "invite"),
    (9, "檸檬", "níng_méng", "lemon"),
    (9, "搬家", "bān_jiā", "moving"),
    (9, "麵店", "miàn_diàn", "restaurant"),
    (9, "追", "zhuī", "chase"),
    (9, "酸", "suān", "sour"),
    (9, "說話", "shuō_huà", "speak"),
    (9, "告訴", "gào_sù", "tell"),
    (9, "上傳", "shàng_chuán", "upload"),

    # Lesson 10
    (10, "瓶子", "píng_zi", "bottle"),
    (10, "新郎", "xīn_láng", "groom"),
    (10, "孩子", "hái_zi", "children"),
    (10, "超商", "chāo_shāng", "supermarket"),
    (10, "餃子", "jiǎo_zi", "dumpling"),
    (10, "飽", "bǎo", "full"),
    (10, "溫泉", "wēn_quán", "hot springs"),
    (10, "泡菜", "pào_cài", "pickles"),
    (10, "韓國", "Hán_guó", "South Korea"),
    (10, "地圖", "dì_tú", "map"),
    (10, "豬肉", "zhū_ròu", "pork"),
    (10, "郵局", "yóu_jú", "post office"),
    (10, "回收", "huí_shōu", "recycle"),
    (10, "鹽", "yán", "salt"),
    (10, "放鞭炮", "fàng_biān_pào", "fireworks"),
    (10, "鞋", "xié", "shoe"),
    (10, "站", "zhàn", "stand"),
    (10, "洗", "xǐ", "wash"),
    (10, "白", "bái", "white"),

    # Lesson 11
    (11, "沙灘", "shā_tān", "beach"),
    (11, "啤酒", "pí_jiǔ", "beer"),
    (11, "女兒", "nǚ_ér", "daughter"),
    (11, "水餃", "shuǐ_jiǎo", "dumpling"),
    (11, "作業", "zuò_yè", "homework"),
    (11, "湖", "hú", "lake"),
    (11, "紙", "zhǐ", "paper"),
    (11, "履歷", "lǚ_lì", "curriculum"),
    (11, "室友", "shì_yǒu", "roommates"),
    (11, "票", "piào", "ticket"),
    (11, "觀光客", "guān_guāng_kè", "tourist"),
    (11, "翻譯", "fān_yì", "translator"),
    (11, "錢包", "qián_bāo", "wallet"),

    # Lesson 12
    (12, "公寓", "gōng_yù", "apartment"),
    (12, "胖", "pàng", "fat"),
    (12, "薯條", "shǔ_tiáo", "french fries"),
    (12, "女孩", "nǚ_hái", "girl"),
    (12, "烤", "kǎo", "roast"),
    (12, "漢堡", "hàn_bǎo", "hamburger"),
    (12, "摩托車", "mó_tuō_chē", "motorcycle"),
    (12, "推", "tuī", "push"),
    (12, "沙拉", "shā_lā", "salad"),
    (12, "鹹", "xián", "salty"),
    (12, "青菜", "qīng_cài", "vegetables"),
    (12, "吃素", "chī_sù", "vegetarian"),
    (12, "婚禮", "hūn_lǐ", "wedding"),

    # Lesson 13
    (13, "生氣", "shēng_qì", "angry"),
    (13, "檢查", "jiǎn_chá", "check"),
    (13, "班機", "bān_jī", "airplane"),
    (13, "起床", "qǐ_chuáng", "wake up"),
    (13, "打招呼", "dǎ_zhāo_hū", "greet"),
    (13, "健身房", "jiàn_shēn_fáng", "gym"),
    (13, "義大利", "Yì_dà_lì", "Italy"),
    (13, "郵件", "yóu_jiàn", "mail"),
    (13, "訂位", "dìng_wèi", "reserve"),
    (13, "搬", "bān", "move"),
    (13, "新人", "xīn_rén", "couple"),
    (13, "吵", "chǎo", "noisy"),
    (13, "壽司", "shòu_sī", "sushi"),
    (13, "助教", "zhù_jiào", "assistant"),
    (13, "泰國", "Tài_guó", "Thailand"),
    (13, "罵", "mà", "scold"),

    # Lesson 14
    (14, "麵包", "miàn_bāo", "bread"),
    (14, "糖", "táng", "candy"),
    (14, "關", "guān", "close"),
    (14, "炸", "zhà", "fry"),
    (14, "百貨公司", "bǎi_huò_gōng_sī", "department store"),
    (14, "全家", "quán_jiā", "family"),
    (14, "畢業", "bì_yè", "graduate"),
    (14, "聽見", "tīng_jiàn", "listen"),
    (14, "教授", "jiào_shòu", "professor"),
    (14, "上海", "Shàng_hǎi", "China"),

    # Lesson 15
    (15, "國外", "guó_wài", "travel"),
    (15, "小孩", "xiǎo_hái", "child"),
    (15, "抱怨", "bào_yuàn", "complain"),
    (15, "歐洲", "Ōu_zhōu", "Europe"),
    (15, "睡著", "shuì_zháo", "sleep"),
    (15, "出門", "chū_mén", "leave home"),
    (15, "春節", "chūn_jié", "chinese new year"),
    (15, "年夜飯", "nián_yè_fàn", "dinner"),
    (15, "年糕", "nián_gāo", "cake"),
    (15, "春聯", "chūn_lián", "poster"),
    (15, "壓歲錢", "yā_suì_qián", "money"),
    (15, "拜年", "bài_nián", "congratulate"),
    (15, "脫", "tuō", "take off clothes"),
    (15, "河邊", "hé_biān", "river"),
    (15, "首爾", "Shǒu_ěr", "Korea"),
    (15, "蒸", "zhēng", "steam"),
]

def main():
    # Write directly to vocab_images next to where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
    output_dir = os.path.join(script_dir, "vocab_images")
    os.makedirs(output_dir, exist_ok=True)
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    success_count = 0
    
    print(f"Target saving directory: {output_dir}")
    print(f"Starting download of {len(VOCAB_MAPPING)} items...\n")
    
    for lesson, trad, pinyin, keyword in VOCAB_MAPPING:
        filename = f"{keyword}.png"
        filepath = os.path.join(output_dir, filename)
        
        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            print(f"[EXISTS] {filename}")
            success_count += 1
            continue
            
        encoded = urllib.parse.quote(keyword)
        search_url = f"https://api.arasaac.org/v1/pictograms/en/bestsearch/{encoded}"
        
        try:
            req_search = urllib.request.Request(search_url, headers=headers)
            with urllib.request.urlopen(req_search) as resp:
                data = json.loads(resp.read().decode())
                
            if data and len(data) > 0:
                pic_id = data[0]['_id']
                img_url = f"https://api.arasaac.org/v1/pictograms/{pic_id}"
                
                req_img = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req_img) as img_resp:
                    img_bytes = img_resp.read()
                    with open(filepath, "wb") as f:
                        f.write(img_bytes)
                
                if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
                    print(f"[OK] {filename} (matched: '{keyword}', ID: {pic_id})")
                    success_count += 1
                else:
                    print(f"[ERROR] Write failed for {filename}")
            else:
                print(f"[FAILED] No match for: '{keyword}'")
        except Exception as e:
            print(f"[ERROR] {filename} ({keyword}): {e}")
            
        time.sleep(0.05)

    print(f"\nDone! Downloaded/verified {success_count}/{len(VOCAB_MAPPING)} images.")

if __name__ == "__main__":
    main()