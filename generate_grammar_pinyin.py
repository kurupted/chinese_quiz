import json
import re
from pypinyin import pinyin, Style

def format_sentence_pinyin(sentence):
    # Convert Chinese sentence to tone-marked pinyin
    # Preserve punctuation
    words = pinyin(sentence, style=Style.TONE)
    res = []
    for item in words:
        res.append(item[0])
    
    formatted = " ".join(res)
    # Clean spacing before punctuation marks
    formatted = re.sub(r'\s+([，。！？、,!?.;:])', r'\1', formatted)
    return formatted

def update_grammar_with_pinyin():
    with open('grammar_data.json', 'r', encoding='utf-8') as f:
        grammar_list = json.load(f)

    for item in grammar_list:
        example_objects = []
        for ex in item['examples']:
            pyn = format_sentence_pinyin(ex)
            example_objects.append({
                "chinese": ex,
                "pinyin": pyn
            })
        item['exampleDetails'] = example_objects

    print(f"Added pinyin to {len(grammar_list)} grammar items.")

    with open('grammar_data.json', 'w', encoding='utf-8') as f:
        json.dump(grammar_list, f, ensure_ascii=False, indent=2)

    with open('grammar_data.js', 'w', encoding='utf-8') as f:
        f.write("const GRAMMAR_DATA = " + json.dumps(grammar_list, ensure_ascii=False, indent=2) + ";\n")

if __name__ == '__main__':
    update_grammar_with_pinyin()
