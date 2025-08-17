chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    handleSummarize(request.text).then(sendResponse);
    return true;
  }
});

async function handleSummarize(text) {
  try {
    console.log('=== Summarize Request ===');
    console.log('Text length:', text ? text.length : 0);
    console.log('Text preview:', text ? text.substring(0, 200) : 'null');
    
    const { apiKey } = await chrome.storage.local.get(['apiKey']);
    
    if (!apiKey) {
      return { error: 'APIキーが設定されていません。拡張機能のポップアップから設定してください。' };
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        max_completion_tokens: 10000,  // 大幅に増やす
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: '動画を日本語で要約'  // 極限まで短く
          },
          {
            role: 'user',
            content: text  // シンプルに
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
    console.log('=== GPT-5-nano API Response ===');
    console.log('Status:', response.status);
    console.log('Full response:', JSON.stringify(data, null, 2));
    
    // GPT-5-nanoは標準的なChat Completions形式を使用
    let summary = null;
    
    // 標準パスを確認
    if (data && data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      const firstChoice = data.choices[0];
      if (firstChoice && firstChoice.message && 'content' in firstChoice.message) {
        summary = firstChoice.message.content;
        console.log('✓ Found at: choices[0].message.content');
        console.log('Summary length:', summary ? summary.length : 0);
        
        if (!summary || summary.trim() === '') {
          console.error('⚠️ Content is empty!');
          console.error('finish_reason:', firstChoice.finish_reason);
          console.error('usage:', data.usage);
          
          // finish_reasonがlengthの場合、トークン数が足りない
          if (firstChoice.finish_reason === 'length') {
            return { error: 'レスポンスが途中で切れました。GPT-5-nanoの出力トークン数が不足している可能性があります。' };
          }
          return { error: '要約が生成されませんでした（空のレスポンス）' };
        } else {
          console.log('Summary preview:', summary.substring(0, 200) + '...');
        }
      }
    }
    
    // 要約が見つからなかった場合
    if (!summary) {
      console.error('Summary not found in standard path');
      console.error('data.choices exists?', !!data.choices);
      console.error('data.choices is array?', Array.isArray(data.choices));
      console.error('data.choices length?', data.choices?.length);
      if (data.choices && data.choices[0]) {
        console.error('choices[0] keys:', Object.keys(data.choices[0]));
        if (data.choices[0].message) {
          console.error('message keys:', Object.keys(data.choices[0].message));
          console.error('message.content:', data.choices[0].message.content);
        }
      }
      return { error: '要約の生成に失敗しました（レスポンス形式が予期したものと異なります）' };
    }
    
    return { summary };
  } catch (error) {
    console.error('Summarize error:', error);
    
    // ユーザーによる中断の場合
    if (error.message && error.message.includes('interrupted')) {
        return { error: 'リクエストが中断されました。もう一度お試しください。' };
    }
    
    return { error: `要約の生成に失敗しました: ${error.message}` };
  }
}