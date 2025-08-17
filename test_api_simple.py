#!/usr/bin/env python3
import requests
import json
import sys

# テスト用の簡単なAPIコール
def test_gpt5_nano():
    # APIキーをコマンドライン引数から取得（セキュリティのため直接記述しない）
    if len(sys.argv) < 2:
        print("Usage: python3 test_api_simple.py YOUR_API_KEY")
        return
    
    api_key = sys.argv[1]
    
    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        },
        json={
            'model': 'gpt-5-nano',
            'max_completion_tokens': 50,
            'messages': [
                {'role': 'system', 'content': 'You are a helpful assistant.'},
                {'role': 'user', 'content': 'Say hello in Japanese'}
            ]
        }
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n=== Full Response ===")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        print("\n=== Testing extraction paths ===")
        
        # 標準的なパス
        if 'choices' in data and len(data['choices']) > 0:
            choice = data['choices'][0]
            print(f"choices[0] keys: {list(choice.keys())}")
            
            if 'message' in choice:
                print(f"message keys: {list(choice['message'].keys())}")
                if 'content' in choice['message']:
                    print(f"✓ Found at: choices[0].message.content")
                    print(f"  Content: {choice['message']['content']}")
            
            if 'text' in choice:
                print(f"✓ Found at: choices[0].text")
                print(f"  Content: {choice['text']}")
        
        # その他の可能性
        for key in ['content', 'text', 'output', 'result', 'response', 'output_text']:
            if key in data:
                print(f"✓ Found at root: {key}")
                print(f"  Content: {data[key]}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_gpt5_nano()