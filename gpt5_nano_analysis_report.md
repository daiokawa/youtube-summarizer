# GPT-5-nano APIレスポンス形式分析レポート

## 現在のプロジェクト構成

### YouTube Summarizer v2 Chrome Extension

**ファイル構成:**
- `manifest.json` - Chrome拡張機能の設定
- `popup.html` & `popup.js` - APIキー設定UI
- `content.js` - YouTubeページに挿入されるスクリプト
- `background.js` - API呼び出しを処理するバックグラウンドスクリプト
- `styles.css` - スタイリング

## 現在の実装分析

### APIキー管理方式
```javascript
// popup.js より抜粋
const { apiKey } = await chrome.storage.local.get(['apiKey']);
await chrome.storage.local.set({ apiKey });
```
- Chrome拡張機能のローカルストレージを使用
- `sk-`で始まるOpenAI形式のAPIキーを想定

### API呼び出し実装（background.js）

#### 1. リクエスト形式
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'gpt-5-nano',
    max_completion_tokens: 1200,
    messages: [...]
  })
});
```

#### 2. レスポンス処理の多段階フォールバック
現在のコードは以下の順序でレスポンスからコンテンツを抽出しようとします：

```javascript
let summary = 
    data.choices?.[0]?.message?.content ||           // 標準Chat Completions形式
    data.choices?.[0]?.content?.[0]?.text ||         // 新しいResponses API形式
    data.content?.[0]?.text ||                       // content配列形式
    data.output_text ||                              // 簡易出力形式
    data.content ||                                  // 文字列直接
    data.text ||                                     // テキスト直接
    data.message ||                                  // メッセージ直接
    null;
```

#### 3. エラーハンドリング
- HTTP 401: 「APIキーが無効です」
- HTTP 429: 「レート制限に達しました」
- その他: APIエラーメッセージを表示

## GPT-5-nanoの期待される動作

### 標準的なChat Completions APIレスポンス形式
```json
{
  "choices": [
    {
      "message": {
        "content": "要約された内容がここに入る",
        "role": "assistant"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  }
}
```

### 新しいResponses API形式の可能性
```json
{
  "choices": [
    {
      "content": [
        {
          "type": "text",
          "text": "要約された内容がここに入る"
        }
      ]
    }
  ]
}
```

## 既知の問題と対策

### 1. GPT-5-nanoの実際のレスポンス形式が不明
- **問題**: GPT-5-nanoが新しいモデルで、従来のChat Completions APIと異なる形式を返す可能性
- **対策**: 実際のAPIテストでレスポンス形式を確認する必要がある

### 2. フォールバック機構
現在の実装は11種類の異なるレスポンス形式に対応していますが、以下の追加パターンも考慮すべき：

```javascript
// 追加すべきパターン
data.response?.text ||                               // response.text形式
data.data?.content ||                                // data.content形式
data.result?.message ||                              // result.message形式
data.completion ||                                   // completion直接
```

### 3. デバッグ情報の強化
現在のコードにはコンソールログが含まれていますが、実際の運用では：

```javascript
console.log('Full API Response Structure:', JSON.stringify(data, null, 2));
console.log('Available keys:', Object.keys(data));
```

## 推奨事項

### 1. 実際のAPIテストの実行
作成した `gpt5_nano_response_test.py` を使用して実際のレスポンス形式を確認：

```bash
# ユーザーのAPIキーで実行
python3 gpt5_nano_response_test.py YOUR_API_KEY
```

### 2. レスポンス形式の詳細ログ
Chrome拡張機能の background.js に詳細なデバッグログを追加：

```javascript
console.log('=== GPT-5-nano API Response Debug ===');
console.log('Status:', response.status);
console.log('Headers:', Object.fromEntries(response.headers.entries()));
console.log('Full Response:', JSON.stringify(data, null, 2));
console.log('Keys at root level:', Object.keys(data));
if (data.choices) {
    console.log('Choices structure:', data.choices.map(choice => Object.keys(choice)));
}
console.log('=== End Debug ===');
```

### 3. エラー処理の改善
GPT-5-nanoが新しいエラー形式を返す可能性も考慮：

```javascript
if (!response.ok) {
  const errorText = await response.text();
  console.error('Raw error response:', errorText);
  try {
    const errorData = JSON.parse(errorText);
    // エラー処理
  } catch {
    return { error: `API Error: ${response.status} - ${errorText}` };
  }
}
```

## まとめ

GPT-5-nanoの正確なAPIレスポンス形式を確認するために：

1. 実際のAPIキーを使用して `gpt5_nano_response_test.py` を実行
2. レスポンス構造を確認
3. 必要に応じてChrome拡張機能のレスポンス処理を調整

現在の多段階フォールバック実装により、多くのレスポンス形式に対応できていますが、実際のテストで具体的な形式を確認することが重要です。