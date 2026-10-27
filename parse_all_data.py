import os
import json
import re
from pypinyin import pinyin, Style, load_phrases_dict, load_single_dict

load_single_dict({
    ord('著'): 'zhe',
})

load_phrases_dict({
    '睡覺': [['shuì'], ['jiào']],
    '睡著': [['shuì'], ['zháo']],
    '睡不著': [['shuì'], ['bù'], ['zháo']],
    '乾淨': [['gān'], ['jìng']],
    '音樂': [['yīn'], ['yuè']],
    '那行字': [['nà'], ['háng'], ['zì']],
    '吃得了': [['chī'], ['de'], ['liǎo']],
    '走得了': [['zǒu'], ['de'], ['liǎo']],
    '不得了': [['bù'], ['dé'], ['liǎo']],
    '便宜': [['pián'], ['yí']],
    '照片': [['zhào'], ['piàn']],
    '一張相': [['yī'], ['zhāng'], ['xiàng']],
    '漂漂亮亮': [['piào'], ['piào'], ['liàng'], ['liàng']],
    '教中文': [['jiāo'], ['zhōng'], ['wén']],
    '教得': [['jiāo'], ['de']],
    '都得上班': [['dōu'], ['děi'], ['shàng'], ['bān']],
    '覺得': [['jué'], ['de']],
    '做得': [['zuò'], ['de']],
    '學得': [['xué'], ['de']],
    '賣得': [['mài'], ['de']],
    '說得': [['shuō'], ['de']],
    '寫得': [['xiě'], ['de']],
    '念得': [['niàn'], ['de']],
    '遠得多': [['yuǎn'], ['de'], ['duō']],
    '看得見': [['kàn'], ['de'], ['jiàn']],
    '看得出來': [['kàn'], ['de'], ['chū'], ['lái']],
    '聽得出來': [['tīng'], ['de'], ['chū'], ['lái']],
    '坐得下': [['zuò'], ['de'], ['xià']],
    '裝得下': [['zhuāng'], ['de'], ['xià']],
    '買得到': [['mǎi'], ['de'], ['dào']],
    '聽得到': [['tīng'], ['de'], ['dào']],
    '租得起': [['zū'], ['de'], ['qǐ']],
    '吃得起': [['chī'], ['de'], ['qǐ']],
    '好得快': [['hǎo'], ['de'], ['kuài']],
    '累得': [['lèi'], ['de']],
    '冷得': [['lěng'], ['de']],
    '痛得': [['tòng'], ['de']],
    '餓得': [['è'], ['de']],
    '熱鬧得很': [['rè'], ['nào'], ['de'], ['hěn']],
})

def format_sentence_pinyin(sentence):
    words = pinyin(sentence, style=Style.TONE)
    res = [item[0] for item in words]
    formatted = " ".join(res)
    formatted = re.sub(r'\s+([，。！？、,!?.;:])', r'\1', formatted)
    return formatted

def get_sentence_char_details(sentence):
    words = pinyin(sentence, style=Style.TONE)
    char_list = []
    for i, ch in enumerate(sentence):
        pyn = words[i][0] if i < len(words) else ""
        if ch in "，。！？、,!?.;:…—（）() ":
            pyn = ""
        char_list.append({"char": ch, "pinyin": pyn})
    return char_list

def parse_all():
    vocab_img_dir = 'vocab_images'
    existing_files = {}
    if os.path.exists(vocab_img_dir):
        for f in os.listdir(vocab_img_dir):
            if f.endswith(('.png', '.jpg', '.jpeg')):
                clean_name = os.path.splitext(f)[0].lower().strip()
                existing_files[clean_name] = f"vocab_images/{f}"
                
    print(f"Found {len(existing_files)} images in vocab_images/")

    books = [
        {"book": 1, "filename": "Book 1 vocab and grammar.txt"},
        {"book": 2, "filename": "Book 2 vocab and grammar.txt"}
    ]
    
    all_vocab = []
    all_grammar = []

    # Comprehensive Synonyms & Variation Mapping
    SYNONYM_MAP = {
        "a bowl of": ["bowl"],
        "high speed rail (hsr)": ["high speed train"],
        "mrt": ["metro"],
        "bathroom": ["toilet"],
        "dormitory": ["dormitory", "room"],
        "store-owner, boss": ["boss", "shop"],
        "shop, store": ["shop"],
        "store, shop": ["shop"],
        "stomach, abdomen": ["belly"],
        "snot / runny nose": ["runny nose", "sick"],
        "to catch/have a cold": ["cold illness", "sick"],
        "to fall ill": ["sick"],
        "to have a fever": ["fever"],
        "to see a doctor": ["doctor visit", "clinic", "doctor"],
        "health center": ["clinic"],
        "living room": ["living room"],
        "multi-storey building": ["building"],
        "united states": ["united states"],
        "america": ["united states"],
        "taiwan": ["country"],
        "tram / train": ["train"],
        "stinky tofu": ["tofu"],
        "extra fine noodles": ["noodles"],
        "steamed buns (with meat)": ["steamed bun", "snack"],
        "steamed buns": ["steamed bun", "snack"],
        "light repast, snack": ["snack"],
        "younger sister": ["sisters"],
        "older sister": ["older sister", "sisters"],
        "older brother": ["older brother", "brothers"],
        "boy; male": ["boy"],
        "girl; female": ["girl"],
        "mr.": ["mister"],
        "miss / ms.": ["lady"],
        "a man from japan": ["japan"],
        "a man from taiwan": ["person"],
        "a woman from taiwan": ["person"],
        "a woman from vietnam": ["vietnam"],
        "a woman from the us": ["united states"],
        "a man from the us": ["united states"],
        "convenience store": ["convenience store", "supermarket"],
        "pharmacy / drugstore": ["pharmacy"],
        "language center": ["classroom", "class"],
        "class": ["class", "lesson"],
        "happy birthday": ["birthday"],
        "to sleep (noun form)": ["sleep"],
        "to take a photo": ["take photo", "camera"],
        "scenery, landscape": ["landscape", "mountain"],
        "teahouse": ["teahouse", "tea"],
        "to rain": ["raining", "rain"],
        "to flow": ["flow", "river"],
        "front": ["in front of"],
        "back": ["behind"],
        "clothes": ["clothes", "wear clothes"],
        "you (plural)": ["you all"],
        "elementary school": ["school"],
        "atm machine": ["atm", "bank", "withdraw money"],
        "bus/tram station": ["station", "bus"],
        "chopsticks": ["chopsticks", "dinner", "bowl"],
        "church / cathedral": ["church", "building"],
        "dining room": ["dining room", "dinner"],
        "to dive": ["diver", "swim"],
        "alley": ["door", "house", "street"],
        "door": ["door"],
        "backpack": ["backpack", "bag"],
        "pen": ["pen", "write"],
        "newspapers": ["newspaper", "news"],
        "temple": ["temple", "building"],
        "airplane": ["airplane", "travel"],
        "airport": ["airport", "travel", "station"],
        "bicycle": ["bicycle", "scooter"],
        "watermelon": ["watermelon", "fruit"],
        "mango": ["mango", "fruit"],
        "contract / agreement": ["contract", "paper"],
        "passerby": ["pedestrian", "person"],
        "on the street": ["street", "road"],
        "to turn right": ["turn right", "right"],
        "to turn left": ["turn left", "left"],
        "uncle (older)": ["uncle", "boss"],
        "to calculate": ["calculate"],
        "to collect": ["collect"],
        "to explain": ["explain"],
        "to introduce": ["introduce"],
        "to interview": ["interview"],
        "to investigate": ["investigate"],
        "to download": ["download"],
        "to undress": ["undress"],
        "to sunbathe": ["sunbathe"],
        "to ride (scooter/bike)": ["ride", "scooter", "bicycle"],
        "to roast": ["roast", "cook"],
        "to boil": ["boil", "cook"],
        "to steam": ["steam", "cook"],
        "to fry": ["fry", "cook"],
        "to drive": ["drive", "car"],
        "wedding banquet": ["banquet", "wedding"],
        "wedding ceremony": ["wedding"],
        "bride": ["bride"],
        "groom": ["groom"],
        "apartment": ["apartment", "building", "house"],
        "furniture": ["furniture", "chair", "table"],
        "trash / garbage": ["trash"],
        "to recycle": ["recycle"],
        "post office": ["post office"],
        "envelope": ["envelope", "mail"],
        "salary": ["salary", "money"],
        "wallet / purse": ["wallet", "money"],
        "handbag": ["handbag", "bag"],
        "stoplight / traffic light": ["stoplight"],
        "pedestrian": ["pedestrian", "person"],
        "museum": ["museum", "building"],
        "gym": ["gym", "exercise"],
        "lake": ["lake", "water"],
        "beach": ["beach"],
        "island": ["island"],
        "river": ["river", "flow"],
        "vegetarian food": ["vegetarian", "vegetables"],
        "french fries": ["french fries"],
        "hamburger": ["hamburger"],
        "sushi": ["sushi"],
        "salad": ["salad"],
        "candy": ["candy", "sweet"],
        "lemon": ["lemon", "fruit"],
        "cabbage": ["cabbage", "vegetables"],
        "pepper": ["pepper", "spicy"],
        "salt": ["salt"],
        "salty": ["salty"],
        "acid / sour": ["acid"],
        "toast": ["toast", "bread"],
        "beer": ["beer", "drink"],
        "eiffel tower": ["eiffel tower"],
        "hong kong": ["hong kong"],
        "south korea": ["south korea"],
        "thailand": ["thailand"],
        "canada": ["canada"],
        "france": ["france"],
        "italy": ["italy"],
        "earth": ["earth", "world"],
        "world": ["world", "earth"],
        "asia": ["asia"],
        "europe": ["europe"],
        "charger": ["charger", "electricity"],
        "electricity": ["electricity"],
        "fireworks": ["fireworks"],
        "community center": ["community center"],
        "assistant / clerk": ["assistant", "worker"],
        "director": ["director", "boss"],
        "professor": ["professor", "teacher"],
        "senior high school": ["high school", "school"],
        "adult": ["adult", "person"],
        "child / children": ["child", "children"],
        "daughter": ["daughter", "girl"],
        "couple / pair": ["couple"],
        "advertisement": ["advertisement", "poster"],
        "poster": ["poster"],
        "course / curriculum": ["course", "curriculum", "lesson"],
        "exam / test": ["exam", "test"],
        "notebook": ["notebook", "book"],
        "martial arts": ["martial arts"],
        "web page": ["web page", "internet"],
        "jet ski": ["jet ski"],
        "boat / ship": ["boat"],
        "motorcycle / scooter": ["motorcycle", "scooter"],
        "how are you? hello.": ["hello"],
        "i'm sorry": ["sorry"],
        "family members": ["family"],
        "national palace museum": ["museum"],
        "chinese cabbage": ["cabbage"],
        "red envelope": ["envelope"],
        "teaching assistant": ["assistant"],
        "activity center": ["activity", "community center"],
        "department store": ["store", "shop"],
        "green island": ["island"],
        "noodle shop": ["shop", "noodles"],
        "middle of the night": ["night"],
        "suite (apartment)": ["apartment"],
        "to make a phone call": ["call", "telephone", "phone"],
        "to access the internet / to use the internet": ["internet", "web page"],
        "to have a holiday": ["holiday"],
        "to return to one's country": ["return", "country"],
        "chinese last name (common in taiwan)": ["name"],
        "da-an (district name)": ["name"],
        "to go to work": ["work"],
        "to give someone a ride": ["ride"],
        "to get to know": ["know"],
        "availability of food and drink": ["food", "drink"],
        "to have an interview": ["interview"],
        "summer vacation": ["summer", "holiday"],
        "to work part-time": ["work"],
        "paper cup": ["paper", "cup"],
        "to walk out": ["walk"],
        "to walk over": ["walk"],
        "can't walk": ["walk"],
        "master (teacher)": ["teacher"],
        "to get angry at": ["angry"],
        "to fall asleep": ["sleep"],
        "to clean up (sweep)": ["clean", "sweep"],
        "to go out (house)": ["house"],
        "hometown": ["home", "house"],
        "to stay up (new year’s)": ["night"],
        "to stick on": ["stick"],
        "uncle (older)": ["uncle"],
        "way of saying / theory": ["say", "speech"],
        "to set off firecrackers": ["fireworks"],
        "vacation / holiday": ["holiday"],
        "to break / to split open": ["break"],
        "over there / yonder": ["over there"]
    }

    grammar_translations = {}
    sentence_translations = {}
    if os.path.exists('grammar_translations.json'):
        try:
            with open('grammar_translations.json', 'r', encoding='utf-8') as f:
                t_data = json.load(f)
                grammar_translations = t_data.get('by_id', {})
                sentence_translations = t_data.get('by_sentence', {})
        except Exception as e:
            print("Notice: could not load grammar_translations.json", e)

    for b in books:
        book_num = b["book"]
        filename = b["filename"]
        if not os.path.exists(filename):
            continue
            
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        vocab_section = ""
        grammar_section = ""
        
        if "Grammar List" in content:
            parts = re.split(r'Book \d+ Grammar List:?', content, flags=re.IGNORECASE)
            vocab_section = parts[0]
            if len(parts) > 1:
                grammar_section = parts[1]
        else:
            vocab_section = content

        # 1. Parse Vocab
        for line in vocab_section.splitlines():
            line = line.strip()
            if not line or 'Vocabulary List' in line or line.startswith('English\tTraditional') or line.startswith('from http') or line.startswith('updated'):
                continue
            v_parts = re.split(r'\t+|\s{2,}', line)
            if len(v_parts) >= 4:
                english = v_parts[0].strip()
                traditional = v_parts[1].strip()
                pinyin_str = v_parts[2].strip()
                lesson_str = v_parts[3].strip()
                lesson = int(lesson_str) if lesson_str.isdigit() else 1

                clean_eng = english.lower().strip()
                candidates = [clean_eng]
                
                if clean_eng in SYNONYM_MAP:
                    candidates.extend(SYNONYM_MAP[clean_eng])
                    
                stripped = re.sub(r'\(.*?\)', '', clean_eng).strip()
                candidates.append(stripped)
                candidates.append(re.sub(r'^to\s+', '', stripped).strip())
                candidates.append(re.sub(r'^(a|an)\s+', '', stripped).strip())
                
                for piece in re.split(r'[/,;]', clean_eng):
                    p_clean = piece.strip()
                    candidates.append(p_clean)
                    candidates.append(re.sub(r'^to\s+', '', p_clean).strip())
                    if p_clean in SYNONYM_MAP:
                        candidates.extend(SYNONYM_MAP[p_clean])
                        
                local_image = None
                for c in candidates:
                    if c in existing_files:
                        local_image = existing_files[c]
                        break
                        
                all_vocab.append({
                    "id": len(all_vocab) + 1,
                    "book": book_num,
                    "english": english,
                    "traditional": traditional,
                    "pinyin": pinyin_str,
                    "lesson": lesson,
                    "isVisual": local_image is not None,
                    "photoUrl": local_image,
                    "localImage": local_image,
                    "searchTerm": candidates[0]
                })

        # 2. Parse Grammar
        for line in grammar_section.splitlines():
            line = line.strip()
            if not line or line.startswith('Chapter') or line.startswith('Book'):
                continue
            g_parts = line.split('\t')
            if len(g_parts) >= 7:
                chapter = int(g_parts[0].strip()) if g_parts[0].strip().isdigit() else 1
                point_zh = g_parts[1].strip()
                pinyin_str = g_parts[2].strip()
                english = g_parts[3].strip()
                
                ex1 = g_parts[4].strip() if len(g_parts) > 4 else ""
                ex2 = g_parts[5].strip() if len(g_parts) > 5 else ""
                ex3 = g_parts[6].strip() if len(g_parts) > 6 else ""
                explanation = g_parts[7].strip() if len(g_parts) > 7 else ""
                
                raw_examples = [e for e in [ex1, ex2, ex3] if e and not e.startswith('http')]
                
                if point_zh and raw_examples:
                    example_objects = []
                    example_trans_list = []
                    next_gp_id = len(all_grammar) + 1
                    for ex_idx, ex in enumerate(raw_examples):
                        pyn = format_sentence_pinyin(ex)
                        chars = get_sentence_char_details(ex)
                        trans = grammar_translations.get(f"{next_gp_id}_{ex_idx}", sentence_translations.get(ex, ""))
                        example_objects.append({
                            "chinese": ex,
                            "pinyin": pyn,
                            "english": trans,
                            "charDetails": chars
                        })
                        example_trans_list.append(trans)
                    all_grammar.append({
                        "id": next_gp_id,
                        "book": book_num,
                        "chapter": chapter,
                        "pointZh": point_zh,
                        "pinyin": pinyin_str,
                        "english": english,
                        "examples": raw_examples,
                        "exampleDetails": example_objects,
                        "exampleTranslations": example_trans_list,
                        "explanation": explanation
                    })

    print(f"Total Combined Vocab: {len(all_vocab)} (Book 1 + Book 2)")
    print(f"Total Visual Vocab with Images: {sum(1 for v in all_vocab if v['isVisual'])}")
    print(f"Total Grammar Points: {len(all_grammar)}")

    with open('vocab_data.json', 'w', encoding='utf-8') as f:
        json.dump(all_vocab, f, ensure_ascii=False, indent=2)
        
    with open('vocab_data.js', 'w', encoding='utf-8') as f:
        f.write("const VOCAB_DATA = " + json.dumps(all_vocab, ensure_ascii=False, indent=2) + ";\n")

    with open('grammar_data.json', 'w', encoding='utf-8') as f:
        json.dump(all_grammar, f, ensure_ascii=False, indent=2)
        
    with open('grammar_data.js', 'w', encoding='utf-8') as f:
        f.write("const GRAMMAR_DATA = " + json.dumps(all_grammar, ensure_ascii=False, indent=2) + ";\n")

if __name__ == '__main__':
    parse_all()
