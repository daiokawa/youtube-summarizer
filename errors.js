// エラー管理クラス
class SummarizerError extends Error {
  constructor(code, devMessage, userMessage) {
    super(devMessage);
    this.name = 'SummarizerError';
    this.code = code;
    this.userMessage = userMessage;
    this.timestamp = new Date().toISOString();
  }
  
  // ユーザー向けメッセージを取得
  getUserMessage() {
    return this.userMessage || 'エラーが発生しました';
  }
  
  // 開発者向けログ
  log() {
    console.error(`[YT Summarizer v2] ${this.code}:`, this.message);
    return this;
  }
}

// エラーコード定義
const ErrorCodes = {
  API_KEY_MISSING: 'E001',
  NETWORK_ERROR: 'E002',
  TRANSCRIPT_NOT_FOUND: 'E003',
  RATE_LIMIT: 'E004',
  INVALID_API_KEY: 'E005',
  VIDEO_ID_NOT_FOUND: 'E006',
  EXTENSION_ERROR: 'E007',
  GENERATION_FAILED: 'E008',
  UNKNOWN: 'E999'
};

// エラーメッセージマップ
const ErrorMessages = {
  [ErrorCodes.API_KEY_MISSING]: 'APIキーが設定されていません',
  [ErrorCodes.NETWORK_ERROR]: 'ネットワークエラーが発生しました',
  [ErrorCodes.TRANSCRIPT_NOT_FOUND]: '字幕を取得できませんでした',
  [ErrorCodes.RATE_LIMIT]: 'API利用制限に達しました。しばらくお待ちください',
  [ErrorCodes.INVALID_API_KEY]: 'APIキーが無効です',
  [ErrorCodes.VIDEO_ID_NOT_FOUND]: '動画が見つかりません',
  [ErrorCodes.EXTENSION_ERROR]: '拡張機能エラー。ページをリロードしてください',
  [ErrorCodes.GENERATION_FAILED]: '要約の生成に失敗しました',
  [ErrorCodes.UNKNOWN]: '不明なエラーが発生しました'
};

// エラー作成ヘルパー
function createError(code, devMessage, userMessage) {
  const defaultUserMessage = ErrorMessages[code] || ErrorMessages[ErrorCodes.UNKNOWN];
  return new SummarizerError(
    code,
    devMessage,
    userMessage || defaultUserMessage
  );
}

// Chrome拡張機能用のグローバル定義
if (typeof window !== 'undefined') {
  window.SummarizerError = SummarizerError;
  window.ErrorCodes = ErrorCodes;
  window.createError = createError;
}