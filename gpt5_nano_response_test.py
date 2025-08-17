#!/usr/bin/env python3
"""
GPT-5-nanoのAPIレスポンス形式を確認するスクリプト
"""

import requests
import json
import sys
import os

def test_gpt5_nano_api():
    # APIキーの取得（環境変数またはコマンドライン引数から）
    api_key = os.getenv('OPENAI_API_KEY') or (sys.argv[1] if len(sys.argv) > 1 else None)
    
    if not api_key:
        print("❌ APIキーが設定されていません")
        print("使用方法:")
        print("  環境変数: export OPENAI_API_KEY=your_key && python3 gpt5_nano_response_test.py")
        print("  引数指定: python3 gpt5_nano_response_test.py your_key")
        return
    
    if not api_key.startswith('sk-'):
        print("❌ 無効なAPIキーです（sk-で始まる必要があります）")
        return
    
    print(f"🔑 APIキー: {api_key[:20]}...")
    print("📡 GPT-5-nano APIをテスト中...")
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'gpt-5-nano',
                'max_completion_tokens': 100,
                'messages': [
                    {'role': 'system', 'content': 'You are a helpful assistant.'},
                    {'role': 'user', 'content': 'Say hello in Japanese'}
                ]
            },
            timeout=30
        )
        
        print(f"\n📊 ステータスコード: {response.status_code}")
        print(f"📋 レスポンスヘッダー:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        print(f"\n📄 レスポンス本文 (raw):")
        print("-" * 50)
        print(response.text)
        print("-" * 50)
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"\n✅ JSONパース成功！")
                print(f"🔍 JSON構造:")
                print(json.dumps(data, indent=2, ensure_ascii=False))
                
                # Chrome拡張機能で使用されているパスをテスト
                test_paths = [
                    ("data.choices[0].message.content", lambda d: d.get('choices', [{}])[0].get('message', {}).get('content')),
                    ("data.choices[0].content[0].text", lambda d: d.get('choices', [{}])[0].get('content', [{}])[0].get('text')),
                    ("data.content[0].text", lambda d: d.get('content', [{}])[0].get('text')),
                    ("data.output_text", lambda d: d.get('output_text')),
                    ("data.content", lambda d: d.get('content')),
                    ("data.text", lambda d: d.get('text')),
                    ("data.message", lambda d: d.get('message')),
                    ("data.choices[0].text", lambda d: d.get('choices', [{}])[0].get('text')),
                    ("data.result", lambda d: d.get('result')),
                    ("data.output", lambda d: d.get('output')),
                    ("data.response", lambda d: d.get('response'))
                ]
                
                print(f"\n🔍 コンテンツ抽出テスト:")
                print("=" * 60)
                found_content = False
                
                for path_name, extractor in test_paths:
                    try:
                        result = extractor(data)
                        if result:
                            print(f"✅ {path_name}: {repr(result[:100])}...")
                            found_content = True
                        else:
                            print(f"❌ {path_name}: None/Empty")
                    except Exception as e:
                        print(f"❌ {path_name}: Exception - {e}")
                
                if not found_content:
                    print(f"\n⚠️  既知のパスでコンテンツが見つかりません")
                    print(f"📋 利用可能なキー: {list(data.keys())}")
                    
                    # 再帰的にすべての文字列値を探す
                    def find_strings(obj, path=""):
                        results = []
                        if isinstance(obj, dict):
                            for key, value in obj.items():
                                new_path = f"{path}.{key}" if path else key
                                results.extend(find_strings(value, new_path))
                        elif isinstance(obj, list):
                            for i, value in enumerate(obj):
                                new_path = f"{path}[{i}]" if path else f"[{i}]"
                                results.extend(find_strings(value, new_path))
                        elif isinstance(obj, str) and len(obj) > 10:
                            results.append((path, obj))
                        return results
                    
                    string_values = find_strings(data)
                    if string_values:
                        print(f"\n🔍 レスポンス内の文字列値:")
                        for path, value in string_values:
                            print(f"  {path}: {repr(value[:100])}...")
                
            except json.JSONDecodeError as e:
                print(f"❌ JSONパースエラー: {e}")
                
        else:
            print(f"❌ APIエラー (HTTP {response.status_code})")
            try:
                error_data = response.json()
                print(f"エラー詳細: {json.dumps(error_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"エラー詳細: {response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"❌ リクエストエラー: {e}")
    except Exception as e:
        print(f"❌ 予期しないエラー: {e}")

if __name__ == "__main__":
    print("🧪 GPT-5-nano APIレスポンス形式テスト")
    print("=" * 50)
    test_gpt5_nano_api()