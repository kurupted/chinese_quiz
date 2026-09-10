"""
Convenience wrapper that runs parse_all from parse_all_data.py
to generate vocab_data.json, vocab_data.js, grammar_data.json, and grammar_data.js.
"""
from parse_all_data import parse_all

if __name__ == '__main__':
    parse_all()
