import json
import urllib.request

def test_urls():
    with open('vocab_data.json', 'r', encoding='utf-8') as f:
        items = json.load(f)
        
    broken = []
    visual = [item for item in items if item['isVisual'] and item['photoUrl']]
    print(f"Testing {len(visual)} visual URLs...")
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    for item in visual:
        url = item['photoUrl']
        try:
            req = urllib.request.Request(url, headers=headers, method='HEAD')
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status != 200:
                    broken.append((item['english'], url, response.status))
        except Exception as e:
            broken.append((item['english'], url, str(e)))
            
    print(f"Broken count: {len(broken)}")
    for b in broken:
        print(f"  FAILED: {b[0]} -> {b[1]} ({b[2]})")

if __name__ == '__main__':
    test_urls()
