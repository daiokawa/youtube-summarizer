#!/bin/bash

# GPT-5-nano APIテストスクリプト

echo "🧪 GPT-5-nano APIレスポンス形式テスト"
echo "=================================="

# APIキーの確認
if [ -z "$1" ]; then
    echo "❌ APIキーが指定されていません"
    echo ""
    echo "使用方法:"
    echo "  ./test_gpt5_nano.sh YOUR_API_KEY"
    echo ""
    echo "または環境変数で設定:"
    echo "  export OPENAI_API_KEY=your_key"
    echo "  ./test_gpt5_nano.sh"
    echo ""
    exit 1
fi

API_KEY="${1:-$OPENAI_API_KEY}"

if [[ ! "$API_KEY" =~ ^sk- ]]; then
    echo "❌ 無効なAPIキーです（sk-で始まる必要があります）"
    exit 1
fi

echo "🔑 APIキー: ${API_KEY:0:20}..."
echo "📡 GPT-5-nano APIをテスト中..."
echo ""

# Pythonスクリプトを実行
python3 gpt5_nano_response_test.py "$API_KEY"