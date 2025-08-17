console.log('[YT Summarizer v2] Extension loaded');

let summarizeButton = null;
let summaryPopup = null;

function createSummarizeButton() {
  if (summarizeButton && document.body.contains(summarizeButton)) {
    return;
  }
  
  summarizeButton = document.createElement('button');
  summarizeButton.id = 'yt-summarize-btn-v2';
  summarizeButton.textContent = 'ざっくり';
  summarizeButton.style.cssText = `
    position: fixed !important;
    bottom: 30px !important;
    right: 30px !important;
    z-index: 99999 !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border: none !important;
    border-radius: 50px !important;
    padding: 12px 24px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
    transition: all 0.3s !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  `;
  
  // ボタンのスタイル設定完了
  
  // ホバーエフェクト
  summarizeButton.onmouseover = () => {
    summarizeButton.style.transform = 'scale(1.05)';
  };
  summarizeButton.onmouseout = () => {
    summarizeButton.style.transform = 'scale(1)';
  };
  
  summarizeButton.addEventListener('click', handleSummarizeClick);
  document.body.appendChild(summarizeButton);
  console.log('[YT Summarizer v2] Button created');
}

function createSummaryPopup() {
  if (summaryPopup) {
    summaryPopup.remove();
  }
  
  summaryPopup = document.createElement('div');
  summaryPopup.id = 'yt-summary-popup-v2';
  summaryPopup.style.cssText = `
    position: fixed !important;
    top: 50px !important;
    right: 30px !important;
    width: 550px !important;
    height: 80vh !important;
    max-height: 800px !important;
    background: white !important;
    border-radius: 12px !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
    z-index: 100000 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
  `;
  
  // 既存のスタイルを削除
  const existingStyle = document.getElementById('chick-bounce-style-v2');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // 新しいスタイルを追加
  const newStyle = document.createElement('style');
  newStyle.id = 'chick-bounce-style-v2';
  newStyle.textContent = `
    @keyframes chickBounceV2 {
      0% { 
        transform: translateX(-30px) translateY(0);
      }
      12.5% {
        transform: translateX(-15px) translateY(-25px);
      }
      25% {
        transform: translateX(0) translateY(0);
      }
      37.5% {
        transform: translateX(15px) translateY(-25px);
      }
      50% {
        transform: translateX(30px) translateY(0);
      }
      62.5% {
        transform: translateX(15px) translateY(-25px);
      }
      75% {
        transform: translateX(0) translateY(0);
      }
      87.5% {
        transform: translateX(-15px) translateY(-25px);
      }
      100% {
        transform: translateX(-30px) translateY(0);
      }
    }
    
    .chick-animation-v2 {
      animation: chickBounceV2 0.6s linear infinite !important;
      display: inline-block;
    }
  `;
  document.head.appendChild(newStyle);
  
  summaryPopup.innerHTML = `
    <div id="popup-header-v2" style="background: #0078d4; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: move; user-select: none; border-bottom: 1px solid #005a9e;">
      <span style="font-weight: 600; font-size: 15px;">🐥 ざっくり要約ちゃん</span>
      <button id="close-popup-v2" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 20px; cursor: pointer; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">×</button>
    </div>
    <div id="popup-content-v2" style="padding: 20px; flex: 1; overflow-y: auto; background: #f8f9fa; position: relative;">
      <div style="text-align: center; color: #666; padding: 40px; padding-top: 80px;">
        <div style="font-size: 18px; margin-bottom: 15px;">ざっくり要約中...</div>
        <div style="height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 30px;">
          <div class="chick-animation-v2" style="font-size: 50px; font-family: 'Noto Color Emoji', 'Apple Color Emoji', sans-serif;">🐥</div>
        </div>
      </div>
    </div>
    <div id="action-buttons-v2" style="display: none; position: absolute; bottom: 20px; right: 40px; gap: 8px; z-index: 100001;">
      <button id="print-summary-v2" style="background: #0078d4; color: white; border: 1px solid #005a9e; padding: 5px 14px; border-radius: 3px; font-size: 13px; font-weight: normal; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.15); transition: all 0.1s; margin-right: 8px; font-family: 'Segoe UI', sans-serif;">印刷</button>
      <button id="save-summary-v2" style="background: #0078d4; color: white; border: 1px solid #005a9e; padding: 5px 14px; border-radius: 3px; font-size: 13px; font-weight: normal; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.15); transition: all 0.1s; font-family: 'Segoe UI', sans-serif;">保存</button>
    </div>
  `;
  
  document.body.appendChild(summaryPopup);
  
  // ドラッグ機能を追加
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  
  const header = document.getElementById('popup-header-v2');
  
  header.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
  
  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    
    if (e.target.id === 'popup-header-v2' || e.target.parentElement.id === 'popup-header-v2') {
      isDragging = true;
    }
  }
  
  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      xOffset = currentX;
      yOffset = currentY;
      
      summaryPopup.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  }
  
  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }
  
  // ボタンイベント
  document.getElementById('close-popup-v2').addEventListener('click', () => {
    summaryPopup.remove();
    summaryPopup = null;
  });
}

let isProcessing = false; // 処理中フラグ

async function handleSummarizeClick() {
  // 多重起動防止
  if (isProcessing) {
    console.log('[YT Summarizer v2] Already processing, skipping...');
    return;
  }
  
  console.log('[YT Summarizer v2] Button clicked');
  isProcessing = true;
  
  // ボタンを無効化
  if (summarizeButton) {
    summarizeButton.disabled = true;
    summarizeButton.style.opacity = '0.6';
    summarizeButton.style.cursor = 'not-allowed';
    summarizeButton.textContent = '処理中...';
  }
  
  createSummaryPopup();
  
  try {
    const videoId = new URLSearchParams(window.location.search).get('v');
    if (!videoId) {
      showError('動画IDが見つかりません');
      isProcessing = false; // フラグをリセット
      return;
    }
    
    // シンプルな方法：動画の説明欄を取得
    let description;
    try {
      description = await getVideoDescription();
    } catch (descError) {
      showError('この動画は説明欄が空のため要約できません。\n説明欄に十分な情報がある動画でお試しください。');
      isProcessing = false; // フラグをリセット
      return;
    }
    
    const title = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent || 
                  document.querySelector('#title h1')?.textContent || 
                  '動画タイトル不明';
    
    const isTranscript = description.length > 1000 && !description.includes('http');
    const contentType = isTranscript ? 'トランスクリプト' : '説明';
    const textToSummarize = `タイトル: ${title}\n\n${contentType}: ${description}`;
    console.log('[YT Summarizer v2] Sending to API, text length:', textToSummarize.length);
    
    // Extension context invalidatedエラーを処理
    if (!chrome.runtime?.id) {
      showError('拡張機能を再読み込みしてください。ページもリロードが必要です。');
      isProcessing = false; // フラグをリセット
      return;
    }
    
    chrome.runtime.sendMessage({
      action: 'summarize',
      text: textToSummarize
    }, (response) => {
      // エラーチェック
      if (chrome.runtime.lastError) {
        console.error('[YT Summarizer v2] Runtime error:', chrome.runtime.lastError);
        showError('拡張機能との通信エラー。ページをリロードしてください。');
        return;
      }
      
      console.log('[YT Summarizer v2] Response:', response);
      console.log('[YT Summarizer v2] Response type:', typeof response);
      console.log('[YT Summarizer v2] Response keys:', response ? Object.keys(response) : 'null');
      console.log('[YT Summarizer v2] Response.error:', response?.error);
      console.log('[YT Summarizer v2] Has error?:', !!response?.error);
      console.log('[YT Summarizer v2] Has summary?:', !!response?.summary);
      
      if (response?.error) {
        console.log('[YT Summarizer v2] Showing error:', response.error);
        showError(response.error);
      } else if (response?.summary) {
        console.log('[YT Summarizer v2] Summary length:', response.summary.length);
        console.log('[YT Summarizer v2] Summary preview:', response.summary.substring(0, 100));
        showSummary(response.summary);
      } else {
        console.log('[YT Summarizer v2] No error or summary in response');
        showError('要約の生成に失敗しました（レスポンス形式が予期したものと異なります）');
      }
    });
  } catch (error) {
    console.error('[YT Summarizer v2] Error:', error);
    if (error.message.includes('Extension context invalidated')) {
      showError('拡張機能を更新しました。ページをリロードしてください。');
    } else {
      showError(error.message);
    }
    isProcessing = false; // エラー時もフラグをリセット
  }
}

async function getVideoDescription() {
  // まず字幕/トランスクリプトを取得を試みる
  try {
    const transcript = await getTranscript();
    if (transcript && transcript.trim().length > 100) {
      console.log('[YT Summarizer v2] Using transcript, length:', transcript.length);
      return transcript;
    }
  } catch (error) {
    console.log('[YT Summarizer v2] Transcript not available:', error.message);
  }
  
  // 字幕が取得できない場合は説明欄にフォールバック
  console.log('[YT Summarizer v2] Falling back to description');
  const expandButton = document.querySelector('tp-yt-paper-button#expand');
  if (expandButton) {
    expandButton.click();
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const description = document.querySelector('#description-inline-expander')?.textContent ||
                     document.querySelector('#description')?.textContent ||
                     document.querySelector('ytd-text-inline-expander')?.textContent ||
                     '';
  
  // 説明欄が空または極端に短い場合はエラーを投げる
  const cleanedDescription = description.trim();
  if (cleanedDescription.length < 50) {
    throw new Error('字幕も説明欄も取得できませんでした');
  }
  
  return cleanedDescription.substring(0, 3000); // 最初の3000文字
}

async function getTranscript() {
  try {
    // まず既に開いているトランスクリプトパネルがあるか確認
    let transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
    
    if (transcriptSegments.length === 0) {
      // トランスクリプトボタンを直接探す（サイドパネル内）
      const transcriptBtn = document.querySelector('ytd-video-description-transcript-section-renderer button') ||
                           document.querySelector('[aria-label*="transcript" i]') ||
                           document.querySelector('[aria-label*="文字起こし"]');
      
      if (transcriptBtn) {
        transcriptBtn.click();
        await new Promise(resolve => setTimeout(resolve, 1500));
        transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
      }
    }
    
    if (transcriptSegments.length > 0) {
      // セグメントから文字を結合
      const transcriptText = Array.from(transcriptSegments)
        .map(segment => {
          // より正確なセレクタ
          const textElement = segment.querySelector('.segment-text') ||
                            segment.querySelector('[class*="cue"]') ||
                            segment.querySelector('yt-formatted-string');
          return textElement ? textElement.textContent.trim() : '';
        })
        .filter(text => text.length > 0)
        .join(' ');
      
      if (transcriptText.length > 100) {
        // パネルを閉じる
        const closeBtn = document.querySelector('ytd-engagement-panel-title-header-renderer [aria-label*="閉"]') ||
                        document.querySelector('ytd-engagement-panel-title-header-renderer [aria-label*="Close"]');
        if (closeBtn) closeBtn.click();
        
        return transcriptText.substring(0, 8000);
      }
    }
    
    throw new Error('トランスクリプトが利用できません');
  } catch (error) {
    console.log('[YT Summarizer v2] Transcript error:', error.message);
    throw error;
  }
}

// HTMLエスケープ関数
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function resetButton() {
  isProcessing = false;
  if (summarizeButton) {
    summarizeButton.disabled = false;
    summarizeButton.style.opacity = '1';
    summarizeButton.style.cursor = 'pointer';
    summarizeButton.textContent = 'ざっくり';
  }
}

function showSummary(summary) {
  if (!summaryPopup) return;
  
  resetButton(); // ボタンをリセット
  
  const content = document.getElementById('popup-content-v2');
  
  // 要約を保存（グローバル変数に）
  window.currentSummary = summary;
  window.currentVideoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent || 
                            document.querySelector('#title h1')?.textContent || 
                            '動画タイトル';
  window.currentVideoUrl = window.location.href;
  
  // パート見出しと本文を処理（XSS対策済み）
  const paragraphs = summary.split('\n\n'); // 段落で分割
  let formattedHtml = '';
  
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.trim()) {
      // 段落間に区切り線を追加（最初の段落以外）
      if (index > 0) {
        formattedHtml += '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px auto; width: 50%;">';
      }
      
      // HTMLエスケープしてから固有名詞の【】を強調表示
      const escapedText = escapeHTML(paragraph);
      const highlightedText = escapedText.replace(/【([^】]+)】/g, 
        '<strong style="color: #1f2937; background: #fef3c7; padding: 1px 4px; border-radius: 3px;">$1</strong>');
      
      // 段落全体を▶付きで表示
      formattedHtml += `
        <div style="margin-bottom: 20px; position: relative;">
          <span style="position: absolute; left: 0; top: 2px; color: #6366f1; font-weight: bold;">▶</span>
          <p style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8; font-size: 14px;">
            ${highlightedText}
          </p>
        </div>
      `;
    }
  });
  
  const formatted = formattedHtml;
  
  content.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      ${formatted}
      <div style="height: 80px;"></div><!-- ボタン用のスペース -->
    </div>
  `;
  
  // 保存・印刷ボタンを表示して設定
  const actionButtons = document.getElementById('action-buttons-v2');
  actionButtons.style.display = 'flex';
  
  // ボタンイベントを設定
  document.getElementById('save-summary-v2').addEventListener('click', saveSummary);
  document.getElementById('print-summary-v2').addEventListener('click', printSummary);
  
  // ホバーエフェクト
  const buttons = actionButtons.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.onmouseover = () => {
      btn.style.background = '#106ebe';
      btn.style.borderColor = '#0062a8';
    };
    btn.onmouseout = () => {
      btn.style.background = '#0078d4';
      btn.style.borderColor = '#005a9e';
    };
  });
}

function showError(error) {
  if (!summaryPopup) return;
  
  resetButton(); // エラー時もボタンをリセット
  
  const content = document.getElementById('popup-content-v2');
  content.innerHTML = `
    <div style="color: #e74c3c; padding: 20px; background: #fee; border-radius: 8px; text-align: center;">
      <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">エラー</div>
      <div style="font-size: 14px; line-height: 1.5;">${error.split('\n').join('<br>')}</div>
    </div>
  `;
}

// ページ読み込み時に実行
if (window.location.pathname === '/watch') {
  setTimeout(createSummarizeButton, 2000);
}

// 保存機能
function saveSummary() {
  if (!window.currentSummary) return;
  
  const timestamp = new Date().toLocaleString('ja-JP');
  
  // テキスト形式で保存
  const textContent = `YouTube要約
=====================================

タイトル: ${window.currentVideoTitle}
URL: ${window.currentVideoUrl}
保存日時: ${timestamp}
要約生成: GPT-4o-mini

=====================================

${window.currentSummary}`;
  
  // テキストファイルとしてダウンロード
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `YouTube要約_${window.currentVideoTitle.replace(/[<>:"/\\|?*]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // フィードバック表示
  const saveBtn = document.getElementById('save-summary-v2');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = '✅ 保存完了';
  setTimeout(() => {
    saveBtn.textContent = originalText;
  }, 2000);
}

// 印刷機能
function printSummary() {
  if (!window.currentSummary) return;
  
  // 印刷用ウィンドウを作成
  const printWindow = window.open('', '_blank');
  const timestamp = new Date().toLocaleString('ja-JP');
  
  const printContent = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <title>${window.currentVideoTitle} - YouTube要約</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.8;
          max-width: 800px;
          margin: 40px auto;
          padding: 0 20px;
          color: #333;
        }
        h1 {
          color: #6366f1;
          border-bottom: 2px solid #6366f1;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .meta {
          color: #666;
          font-size: 14px;
          margin-bottom: 30px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 5px;
        }
        .summary {
          margin-top: 30px;
        }
        .paragraph {
          margin-bottom: 20px;
          padding-left: 20px;
          position: relative;
        }
        .paragraph::before {
          content: '▶';
          position: absolute;
          left: 0;
          color: #6366f1;
          font-weight: bold;
        }
        hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 25px auto;
          width: 50%;
        }
        @media print {
          body {
            margin: 20px;
          }
        }
      </style>
    </head>
    <body>
      <h1>${window.currentVideoTitle}</h1>
      <div class="meta">
        <div>URL: <a href="${window.currentVideoUrl}">${window.currentVideoUrl}</a></div>
        <div>印刷日時: ${timestamp}</div>
      </div>
      <div class="summary">
        ${window.currentSummary.split('\n\n').map((p, i) => 
          p.trim() ? `
            ${i > 0 ? '<hr>' : ''}
            <div class="paragraph">${p.replace(/【([^】]+)】/g, '<strong>$1</strong>')}</div>
          ` : ''
        ).join('')}
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // 少し待ってから印刷ダイアログを開く
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// クリーンアップ関数
function cleanupUI() {
  // ボタンの削除
  if (summarizeButton) {
    summarizeButton.removeEventListener('click', handleSummarizeClick);
    summarizeButton.remove();
    summarizeButton = null;
  }
  // ポップアップの削除
  if (summaryPopup) {
    summaryPopup.remove();
    summaryPopup = null;
  }
  // グローバル変数のクリア
  window.currentSummary = null;
  window.currentVideoTitle = null;
  window.currentVideoUrl = null;
}

// URL変更を監視
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    cleanupUI(); // ページ遷移時にクリーンアップ
    lastUrl = url;
    if (window.location.pathname === '/watch') {
      setTimeout(createSummarizeButton, 2000);
    }
  }
}).observe(document, {subtree: true, childList: true});