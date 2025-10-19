/**
 * [テスト用ダミー]
 * 渡されたテキストをターミナル（コンソール）に出力する
 * @param message Geminiが生成したテキスト
 */
export async function sendNotification(message: string) {
  
    console.log("--- 🔔 通知機能テスト ---");
    console.log("以下のメッセージがAIから渡されました:");
    console.log(message);
    console.log("--------------------------");
  
    // 本物の通知機能ができたと仮定して、成功を返す
    return { success: true };
  }
  