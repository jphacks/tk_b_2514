import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini APIクライアントを初期化
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

/**
 * Gemini APIを使用してテキストを生成する関数
 * @param prompt - 生成したいテキストのプロンプト
 * @returns 生成されたテキスト
 * @throws APIキーが設定されていない場合やAPI呼び出しに失敗した場合
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    // APIキーの存在確認
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY環境変数が設定されていません');
    }

    // モデルを取得（思考機能を無効化）
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      },
    } as any);

    // コンテンツを生成
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    // エラーハンドリング
    if (error instanceof Error) {
      throw new Error(`Gemini API呼び出しエラー: ${error.message}`);
    } else {
      throw new Error('Gemini API呼び出し中に不明なエラーが発生しました');
    }
  }
}
