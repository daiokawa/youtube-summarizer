chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    handleSummarize(request.text).then(sendResponse);
    return true;
  }
});

// 設定を読み込み（実際の拡張機能では importScripts または動的読み込み）
const CONFIG = {
  API: {
    OPENAI_URL: 'https://api.openai.com/v1/chat/completions',
    MODEL: 'gpt-4o-mini',
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.7,
    MAX_RETRIES: 3
  }
};

// リトライ機能付きfetch
async function fetchWithRetry(url, options, retries = CONFIG.API.MAX_RETRIES) {
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // 429 (Rate Limit) や 5xx エラーの場合はリトライ
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000;
        
        console.log(`[YT Summarizer v2] Retrying after ${delay}ms (attempt ${i + 1}/${retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error;
      const delay = Math.pow(2, i) * 1000;
      
      if (i < retries) {
        console.log(`[YT Summarizer v2] Network error, retrying after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

async function handleSummarize(text) {
  try {
    console.log('=== Summarize Request (GPT-4o-mini) ===');
    console.log('Text length:', text ? text.length : 0);
    
    const { apiKey } = await chrome.storage.local.get(['apiKey']);
    
    if (!apiKey) {
      return { error: 'APIキーが設定されていません。拡張機能のポップアップから設定してください。' };
    }
    
    const response = await fetchWithRetry(CONFIG.API.OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: CONFIG.API.MODEL,
        temperature: CONFIG.API.TEMPERATURE,
        max_tokens: CONFIG.API.MAX_TOKENS,
        messages: [
          {
            role: 'system',
            content: `YouTube動画のトランスクリプト（字幕テキスト）を基に、実際に語られた内容を詳細に要約してください。

【絶対的なルール】
1. トランスクリプトに実際に語られている内容のみを記述
2. 話者が述べた事実、意見、説明を正確に伝える
3. 固有名詞は全て【】で囲んで記載
4. 数値は正確に記載（金額、年月日、パーセンテージ、回数、時間など）
5. 話の流れと論理構造を保持

【書き方】
- 動画で実際に語られた内容を時系列で整理
- 重要なポイントは詳しく展開
- 専門用語や概念は説明を含める
- 各段落は情報密度を高めて5-8文程度
- 全体で10-15段落程度

【含めるべき要素】
- 主要なトピックとサブトピック
- 具体例やエピソード
- データや統計
- 結論や要点
- アクションアイテム（あれば）`
          },
          {
            role: 'user',
            content: `以下のYouTube動画の内容を要約してください：\n\n${text}`
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      
      if (response.status === 401) {
        return { error: 'APIキーが無効です。正しいOpenAI APIキーを設定してください。' };
      } else if (response.status === 429) {
        return { error: 'レート制限に達しました。しばらく待ってから再試行してください。' };
      } else {
        return { error: `APIエラー: ${errorData.error?.message || response.status}` };
      }
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    let summary = data.choices?.[0]?.message?.content;
    
    if (!summary) {
      return { error: '要約の生成に失敗しました' };
    }
    
    return { summary };
  } catch (error) {
    console.error('Summarize error:', error);
    return { error: `要約の生成に失敗しました: ${error.message}` };
  }
}