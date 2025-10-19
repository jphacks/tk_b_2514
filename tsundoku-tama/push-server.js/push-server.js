const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// CORSを許可する（Next.jsの開発サーバー(localhost:3000)からアクセスできるようにするため）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// ★ここに先ほど生成したVAPIDキーを貼り付ける
const vapidKeys = {
  publicKey: "BCEriP3j8ZOAPnnXoUt-jgQFkwOJoMYDAJLWZ7LEuHGrc2R0mc8IjkA-eQhWIXJvmX4n_RR-on3VR22TlpoP0XQ", // 公開鍵
  privateKey: "Rj9mYfvVRT1POFRAXgAWyinj75CmxkDPNfBDEUOBA7M", // 秘密鍵
};

webpush.setVapidDetails(
  'mailto:your-email@example.com', // 連絡先
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// 購読情報を保存する配列（デモ用。本番ではデータベースに保存）
let subscriptions = [];

// フロントエンドから購読情報を受け取り保存するAPI
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  // 同じ購読情報がなければ追加する
  if (!subscriptions.find(s => s.endpoint === subscription.endpoint)) {
    subscriptions.push(subscription);
    console.log('Subscription added:', subscription);
  }
  res.status(201).json({});
});

// AIチームが叩く、プッシュ通知を送信するAPI
app.post('/send-notification', (req, res) => {
  const { message } = req.body;

  const payload = JSON.stringify({
    title: '積読タマからのお知らせ',
    body: message || '読書の続きはどう？一緒に頑張ろう！', // メッセージがなければデフォルト
  });

  console.log(`Sending notification to ${subscriptions.length} subscribers.`);
  
  // 保存されている全ての購読情報に通知を送信
  const sendPromises = subscriptions.map(subscription => 
    webpush.sendNotification(subscription, payload)
      .catch(err => {
        // もし購読が無効になっていたら（例：ユーザーが通知をブロックした）、配列から削除
        if (err.statusCode === 410) {
          subscriptions = subscriptions.filter(s => s.endpoint !== subscription.endpoint);
        }
        console.error("Failed to send notification to one subscription", err);
      })
  );

  Promise.all(sendPromises)
    .then(() => res.status(200).json({ message: 'Notifications sent.' }))
    .catch(err => {
      console.error("Error sending notifications:", err);
      res.sendStatus(500);
    });
});

const PORT = 3001; // Next.jsが3000を使うので、3001番ポートで起動
app.listen(PORT, () => {
  console.log(`Push server started on http://localhost:${PORT}`);
});