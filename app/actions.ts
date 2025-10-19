"use server";

import { generateText } from './lib/LLM/gemini';
import { sendNotification } from './lib/notifications';
/**
 * FirebaseとGeminiを連携させてコンテンツを生成する関数
 * @returns 生成結果またはエラー情報
 */
export async function generateContentFromDB() {
  try {
    // 仮のDBモックデータ（後でFirebase担当者が本物のDBロジックに差し替え）
    const data = {
      name: "React完全ガイド",
      start_date: "2025-01-01",
      last_read_date: "2025-01-05",
      today: "2025-01-025",
      days_inactive: 20,
      total_pages: 350,
      current_page: 120,
      initial_motivation: "Reactの勉強を始めたい",
      character: {
        type: "熱血系",
        emoji: "💪",
        personality: "passionate",
      },
    };

    // DBデータを使ってGeminiに渡すためのプロンプト文字列を組み立て
    const prompt = `
あなたは「本が人格を持つ読書アプリ」のキャラクターAIです。
ユーザーにプッシュ通知として送る短いメッセージを生成してください。
本の視点で語りかけ、ユーザーの読書意欲を優しく再点火させます。

# 入力情報
- 本のタイトル: ${data.name}
- キャラクター: ${data.character.type} ${data.character.emoji}
- キャラクターの性格: ${data.character.personality}
- 最後に読んだ日: ${data.last_read_date}
- 現在の日付: ${data.today}
- 放置期間（日数）: ${data.days_inactive}日
- 現在のページ数: ${data.current_page}
- 総ページ数: ${data.total_pages}
- ユーザーが最初に本を読みたいと思った時の気持ち: ${data.initial_motivation}

# 出力ルール
- 出力は通知本文のみ（30〜60文字）。
- 本人（本）の一人称で話す。
- 絵文字は0〜1個までOK。
- 罪悪感を与えず、温かくポジティブに。
- ユーザーに本を読みたいと思っていた気持ちを思い出させる。
- 放置期間に応じてトーンを変える。

# トーンガイド
- 放置1〜3日：やさしく軽めに声をかける（フレンドリー／カジュアル）
- 放置4〜7日：ちょっと恋しげ・励まし系（温かく前向き）
- 放置8〜14日：少しドラマチックに、再開を誘う（感情豊かに）
- 放置15日以上：懐かしさ・再会の喜び・一歩を促す（感動的・誇張気味でもOK）

# 出力形式
メッセージ本文のみを出力。説明や補足は禁止。
`;

    // Gemini APIを呼び出してAIの回答を取得
    const ai_response = await generateText(prompt);

    // 4. 通知担当の関数に、生成したテキスト(ai_response)を「引数」として渡す
    await sendNotification(ai_response);

    // 成功時のレスポンス
    return {
      success: true,
      message: ai_response
    };

  } catch (error) {
    // エラーハンドリング
    const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";
    
    return {
      success: false,
      message: `エラー内容: ${errorMessage}`
    };
  }
}
