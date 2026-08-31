import os
import json
import re

def map_vocab_images():
    vocab_img_dir = 'vocab_images'
    existing_files = {}
    if os.path.exists(vocab_img_dir):
        for f in os.listdir(vocab_img_dir):
            if f.endswith('.png') or f.endswith('.jpg') or f.endswith('.jpeg'):
                clean_name = os.path.splitext(f)[0].lower().strip()
                existing_files[clean_name] = f"vocab_images/{f}"
                
    print(f"Found {len(existing_files)} local images in vocab_images/")

    with open('Book 1 vocab and grammar.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    vocab_start = False
    all_vocab = []
    
    # Custom synonyms / direct mappings for Book 1 entries to vocab_images filenames
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
        "to take a photo": ["take photo"],
        "scenery, landscape": ["landscape"],
        "teahouse": ["teahouse", "tea"],
        "to rain": ["raining", "rain"],
        "to flow": ["flow"],
        "front": ["in front of"],
        "back": ["behind"],
        "clothes": ["clothes", "wear clothes"],
        "you (plural)": ["you all"]
    }

    local_matched = 0
    
    for line in lines:
        line = line.strip()
        if 'Book 1 Vocabulary List:' in line:
            vocab_start = True
            continue
        if 'Book 1 Grammar List:' in line:
            break
        if not vocab_start or not line or line.startswith('English\tTraditional'):
            continue
            
        parts = line.split('\t')
        if len(parts) >= 4:
            english = parts[0].strip()
            traditional = parts[1].strip()
            pinyin = parts[2].strip()
            lesson = int(parts[3].strip()) if parts[3].strip().isdigit() else 1
            
            clean_eng = english.lower().strip()
            
            candidates = [clean_eng]
            
            if clean_eng in SYNONYM_MAP:
                candidates.extend(SYNONYM_MAP[clean_eng])
                
            # Strip parentheses
            stripped = re.sub(r'\(.*?\)', '', clean_eng).strip()
            candidates.append(stripped)
            stripped_verb = re.sub(r'^to\s+', '', stripped).strip()
            candidates.append(stripped_verb)
            stripped_article = re.sub(r'^(a|an)\s+', '', stripped).strip()
            candidates.append(stripped_article)
            
            # Split by slash or comma
            for piece in re.split(r'[/,;]', clean_eng):
                p_clean = piece.strip()
                candidates.append(p_clean)
                candidates.append(re.sub(r'^to\s+', '', p_clean).strip())
                if p_clean in SYNONYM_MAP:
                    candidates.extend(SYNONYM_MAP[p_clean])
                
            local_image_path = None
            for c in candidates:
                if c in existing_files:
                    local_image_path = existing_files[c]
                    break
                    
            photo_url = None
            is_visual = False
            
            if local_image_path:
                photo_url = local_image_path
                is_visual = True
                local_matched += 1

            all_vocab.append({
                "id": len(all_vocab) + 1,
                "english": english,
                "traditional": traditional,
                "pinyin": pinyin,
                "lesson": lesson,
                "isVisual": is_visual,
                "photoUrl": photo_url,
                "localImage": local_image_path,
                "searchTerm": candidates[0]
            })
            
    print(f"Total vocabulary items: {len(all_vocab)}")
    print(f"Items with verified local images in vocab_images/: {local_matched}")
    
    with open('vocab_data.json', 'w', encoding='utf-8') as f:
        json.dump(all_vocab, f, ensure_ascii=False, indent=2)
        
    with open('vocab_data.js', 'w', encoding='utf-8') as f:
        f.write("const VOCAB_DATA = " + json.dumps(all_vocab, ensure_ascii=False, indent=2) + ";\n")

if __name__ == '__main__':
    map_vocab_images()
