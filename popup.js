document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');
  
  // 既存のAPIキーを読み込み
  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  if (apiKey) {
    apiKeyInput.value = apiKey;
    showStatus('APIキーが設定されています', 'success');
  }
  
  saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('APIキーを入力してください', 'error');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      showStatus('有効なOpenAI APIキーを入力してください', 'error');
      return;
    }
    
    await chrome.storage.local.set({ apiKey });
    showStatus('APIキーを保存しました', 'success');
  });
  
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});