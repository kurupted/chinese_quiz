import os
import sys
import json
import re
import time
import urllib.request
import urllib.parse
from parse_all_data import parse_all

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def clean_query(english_text):
    clean = english_text.lower().strip()
    # Strip parentheses
    clean = re.sub(r'\(.*?\)', '', clean).strip()
    # Take first term if slashes/commas
    parts = re.split(r'[/,;]', clean)
    if parts:
        clean = parts[0].strip()
    # Strip leading 'to ' or 'a/an '
    clean = re.sub(r'^to\s+', '', clean).strip()
    clean = re.sub(r'^(a|an)\s+', '', clean).strip()
    # Replace non-alphanumeric characters with space
    clean = re.sub(r'[^a-z0-9\s]', ' ', clean).strip()
    clean = re.sub(r'\s+', ' ', clean)
    return clean

def search_opensymbols(query):
    if not query:
        return None
    url = f"https://www.opensymbols.org/api/v1/symbols/search?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                if isinstance(data, list) and len(data) > 0:
                    # Prefer PNGs from ARASAAC or high quality repos if available, else first item
                    png_items = [d for d in data if d.get('extension') == 'png' and d.get('image_url')]
                    if png_items:
                        return png_items[0]
                    return data[0]
    except Exception as e:
        print(f"  [!] Search error for '{query}': {e}")
    return None

def download_file(image_url, target_path):
    # Properly quote spaces and special characters in URL path
    parsed = urllib.parse.urlsplit(image_url)
    encoded_path = urllib.parse.quote(parsed.path)
    encoded_url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, encoded_path, parsed.query, parsed.fragment))

    req = urllib.request.Request(encoded_url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status == 200:
                content = response.read()
                with open(target_path, 'wb') as f:
                    f.write(content)
                return True
    except Exception as e:
        print(f"  [!] Download error from '{encoded_url}': {e}")
    return False

def fetch_missing_symbols(max_items=None):
    vocab_img_dir = 'vocab_images'
    os.makedirs(vocab_img_dir, exist_ok=True)

    with open('vocab_data.json', 'r', encoding='utf-8') as f:
        vocab_list = json.load(f)

    # Get list of currently mapped or existing local files
    existing_files = set()
    for f in os.listdir(vocab_img_dir):
        base = os.path.splitext(f)[0].lower().strip()
        existing_files.add(base)

    missing_items = []
    seen_queries = set()

    for item in vocab_list:
        clean_q = clean_query(item['english'])
        if not clean_q:
            continue
        
        # Check if already present locally
        if clean_q in existing_files:
            continue
        if item.get('localImage') and os.path.exists(item['localImage']):
            continue

        if clean_q not in seen_queries:
            seen_queries.add(clean_q)
            missing_items.append({
                "query": clean_q,
                "english": item['english'],
                "traditional": item['traditional'],
                "lesson": item['lesson'],
                "book": item['book']
            })

    print(f"Found {len(missing_items)} missing vocabulary terms to search on OpenSymbols.")
    if max_items:
        missing_items = missing_items[:max_items]
        print(f"Processing first {max_items} items in this batch...")

    downloaded_count = 0
    failed_count = 0

    for idx, item in enumerate(missing_items, 1):
        q = item['query']
        print(f"[{idx}/{len(missing_items)}] Searching OpenSymbols for: '{q}' ({item['traditional']} / {item['english']})...")
        
        result = search_opensymbols(q)
        if result and result.get('image_url'):
            img_url = result['image_url']
            ext = result.get('extension', 'png')
            if not ext:
                ext = 'png'
            filename = f"{q}.{ext}"
            target_path = os.path.join(vocab_img_dir, filename)

            success = download_file(img_url, target_path)
            if success:
                print(f"  ✓ Saved to {target_path} (from {result.get('repo_key', 'repo')})")
                downloaded_count += 1
                existing_files.add(q)
            else:
                failed_count += 1
        else:
            print(f"  - No OpenSymbols results found for '{q}'")
            failed_count += 1

        time.sleep(0.35) # Polite delay

    print("\n--- Summary ---")
    print(f"Successfully downloaded: {downloaded_count} images")
    print(f"Skipped / Not found: {failed_count}")

    if downloaded_count > 0:
        print("\nRefreshing dataset mappings and character Pinyin...")
        parse_all()
        print("Done!")

if __name__ == '__main__':
    import sys
    limit = None
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        limit = int(sys.argv[1])
    fetch_missing_symbols(max_items=limit)
