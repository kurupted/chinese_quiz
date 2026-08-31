import json
import re

def test_grammar():
    with open('grammar_data.json', 'r', encoding='utf-8') as f:
        grammar_list = json.load(f)

    print(f"Total grammar items: {len(grammar_list)}")
    
    # Common grammar particles and markers to extract for fill-in-the-blank
    COMMON_MARKERS = [
        "一點也不", "看起來", "聽起來", "聞起來", "吃起來", "一邊", "往前", "往後", "往左", "往右",
        "越來越", "沒想到", "過", "著", "了", "把", "被", "比", "離", "從", "往", "得", "的", "地", 
        "也", "都", "常", "才", "就", "呢", "嗎", "吧", "啊", "只要", "應該", "本來", "完全"
    ]
    
    samples = []
    for g in grammar_list[:15]:
        for ex in g['examples']:
            # Find a match in the example sentence
            matched_key = None
            # Check from longest to shortest
            for m in sorted(COMMON_MARKERS, key=len, reverse=True):
                if m in ex:
                    matched_key = m
                    break
                    
            if matched_key:
                blank_sentence = ex.replace(matched_key, " ____ ", 1)
                samples.append({
                    "point": g["pointZh"],
                    "english": g["english"],
                    "sentence": ex,
                    "blankSentence": blank_sentence,
                    "target": matched_key,
                    "explanation": g["explanation"]
                })
                break
                
    print(f"Generated {len(samples)} sample cloze grammar questions. First 5:")
    for s in samples[:5]:
        print("---")
        print("Grammar Point:", s["point"], f"({s['english']})")
        print("Question:", s["blankSentence"])
        print("Answer:", s["target"])

if __name__ == '__main__':
    test_grammar()
