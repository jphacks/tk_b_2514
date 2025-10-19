"use server";

import { generateText } from "./lib/LLM/gemini";
import { sendNotification } from "./lib/notifications";
import fs from "fs";
import path from "path";

/**
 * FirebaseまたはローカルJSONからデータを読み込み、
 * Geminiで通知メッセージを生成する関数
 */
export async function generateContentFromDB() {
  try {
    // --- ① 既存の仮データ（デフォルト） ---
    const defaultData = {
      name: "React完全ガイド",
      start_date: "2025-01-01",
      last_read_date: "2025-01-05",
      today: "2025-01-25",
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

    // --- ② data.json があれば読み込み（なければ defaultData 使用） ---
    let data = defaultData;
    const filePath = path.join(process.cwd(), "data.json");

    if (fs.existsSync(filePath)) {
      const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // JSONにbooksが含まれている場合（前回の構造対応）
      if (json.books && json.books.length > 0) {
        data = json.books[0];
      } else {
        // 単体データ形式の場合
        data = { ...defaultData, ...json };
      }

      console.log("✅ data.json を使用:", data.name);
    } else {
      console.log(
        "⚠️ data.json が見つからないため、デフォルトデータを使用します"
      );
    }

    // --- ③ Geminiに渡すプロンプトを組み立て ---
    const prompt = `
あなたは「本が人格を持つ読書アプリ」のキャラクターAIです。
ユーザーにプッシュ通知として送る短いメッセージを生成してください。
本の視点で語りかけ、ユーザーの読書意欲を優しく再点火させます。

# 入力情報
- 本のタイトル: ${data.name}
- キャラクター: ${data.character.type} ${data.character.emoji}
- 性格: ${data.character.personality}
- 最後に読んだ日: ${data.last_read_date}
- 現在の日付: ${data.today}
- 放置期間（日数）: ${data.days_inactive}日
- 現在のページ数: ${data.current_page}
- 総ページ数: ${data.total_pages}
- 読みたいと思った理由: ${data.initial_motivation}

# 出力ルール
- 出力は通知本文のみ（30〜60文字）。
- 本人（本）の一人称で話す。
- 絵文字は0〜1個までOK。
- 罪悪感を与えず、温かくポジティブに。
- 放置期間に応じてトーンを変える。

# トーンガイド
- 放置1〜3日：軽めに声をかける
- 放置4〜7日：励まし系
- 放置8〜14日：ドラマチック
- 放置15日以上：懐かしさ・再会の喜び

# 出力形式
メッセージ本文のみを出力。説明や補足は禁止。
`;

    // --- ④ Gemini呼び出し ---
    const ai_response = await generateText(prompt);

    // --- ⑤ 通知送信（仮） ---
    await sendNotification(ai_response);

    return {
      success: true,
      message: ai_response,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "不明なエラーが発生しました";
    return {
      success: false,
      message: `エラー内容: ${errorMessage}`,
    };
  }
}
