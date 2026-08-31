import json
import re

def parse_vocab():
    with open('Book 1 vocab and grammar.txt', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    vocab_start = False
    vocab_items = []
    
    for idx, line in enumerate(lines):
        line = line.strip()
        if 'Book 1 Vocabulary List:' in line:
            vocab_start = True
            continue
        if 'Book 1 Grammar List:' in line:
            break
        if not vocab_start or not line:
            continue
        if line.startswith('English\tTraditional') or line.startswith('Chapter'):
            continue
            
        parts = line.split('\t')
        if len(parts) >= 4:
            english = parts[0].strip()
            traditional = parts[1].strip()
            pinyin = parts[2].strip()
            lesson = parts[3].strip()
            
            # Clean english for image search
            search_term = english
            search_term = re.sub(r'\(.*?\)', '', search_term)
            search_term = re.sub(r'^to\s+', '', search_term, flags=re.IGNORECASE)
            search_term = re.sub(r'^(a|an)\s+', '', search_term, flags=re.IGNORECASE)
            search_term = search_term.split('/')[0].split(';')[0].strip()
            
            # Identify abstract/grammar terms
            abstract_keywords = [
                'particle', 'marker', 'sentence-final', 'modification', 'disposal',
                'measure word', 'how many', 'what', 'which', 'who', 'where', 'because', 'so',
                'therefore', 'also', 'and', 'but', 'all', 'both', 'from', 'at', 'to / toward',
                'could', 'can', 'may', 'will', 'not', 'very', 'comparatively', 'most', 'only',
                'realization', 'affirmative', 'contrastive', 'possessive'
            ]
            
            is_abstract = any(ak in english.lower() for ak in abstract_keywords)
            
            vocab_items.append({
                "id": len(vocab_items) + 1,
                "english": english,
                "traditional": traditional,
                "pinyin": pinyin,
                "lesson": int(lesson) if lesson.isdigit() else 1,
                "searchTerm": search_term,
                "isVisual": not is_abstract
            })
            
    print(f"Total vocabulary items parsed: {len(vocab_items)}")
    visual_count = sum(1 for v in vocab_items if v['isVisual'])
    print(f"Visual vocabulary items: {visual_count}")
    
    with open('vocab_data.json', 'w', encoding='utf-8') as out_f:
        json.dump(vocab_items, out_f, ensure_ascii=False, indent=2)
        
    with open('vocab_data.js', 'w', encoding='utf-8') as out_js:
        out_js.write("const VOCAB_DATA = " + json.dumps(vocab_items, ensure_ascii=False, indent=2) + ";\n")

if __name__ == '__main__':
    parse_vocab()
