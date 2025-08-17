// YouTube Summarizer v2 設定ファイル
const CONFIG = {
  // API設定
  API: {
    OPENAI_URL: 'https://api.openai.com/v1/chat/completions',
    MODEL: 'gpt-4o-mini',
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.7,
    TIMEOUT_MS: 120000,
    MAX_RETRIES: 3
  },
  
  // UI設定
  UI: {
    BUTTON: {
      POSITION: { bottom: 30, right: 30 },
      COLORS: {
        PRIMARY: '#0078d4',
        HOVER: '#106ebe',
        BORDER: '#005a9e',
        BORDER_HOVER: '#0062a8'
      },
      TEXT: 'ざっくり'
    },
    POPUP: {
      WIDTH: 550,
      HEIGHT_VH: 80,
      MAX_HEIGHT: 800,
      POSITION: { top: 50, right: 30 }
    },
    ANIMATION: {
      CHICK_DURATION: 2500
    }
  },
  
  // 遅延設定（ミリ秒）
  DELAYS: {
    SHORT: 300,
    MEDIUM: 500,
    LONG: 1000,
    EXTRA_LONG: 2000
  },
  
  // エラーメッセージ
  ERRORS: {
    API_KEY_MISSING: 'APIキーが設定されていません。拡張機能のポップアップから設定してください。',
    VIDEO_ID_NOT_FOUND: '動画IDが見つかりません',
    TRANSCRIPT_NOT_FOUND: '字幕を取得できませんでした',
    DESCRIPTION_EMPTY: 'この動画は説明欄が空のため要約できません。\n説明欄に十分な情報がある動画でお試しください。',
    EXTENSION_RELOAD_NEEDED: '拡張機能を再読み込みしてください。ページもリロードが必要です。',
    COMMUNICATION_ERROR: '拡張機能との通信エラー。ページをリロードしてください。',
    GENERATION_FAILED: '要約の生成に失敗しました',
    RATE_LIMIT: 'API利用制限に達しました。しばらく待ってから再試行してください。',
    NETWORK_ERROR: 'ネットワークエラーが発生しました。接続を確認してください。',
    INVALID_API_KEY: 'APIキーが無効です。正しいOpenAI APIキーを設定してください。'
  },
  
  // デバッグ設定
  DEBUG: {
    ENABLED: false,  // 本番環境ではfalseに
    LOG_API_RESPONSES: false
  }
};

// Chrome拡張機能では export が使えないので、グローバル変数として定義
if (typeof window !== 'undefined') {
  window.YT_SUMMARIZER_CONFIG = CONFIG;
}