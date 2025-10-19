// VAPIDキーを環境変数から取得（または直接記述）
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

// Base64をUint8Arrayに変換するヘルパー関数
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Service Workerを登録し、プッシュ通知の購読を開始する関数
export async function subscribeUser() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return;
  }

  try {
    // Service Workerを登録
    const swReg = await navigator.serviceWorker.register('/sw.js/sw.js');
    console.log('Service Worker registered', swReg);

    // 購読情報を取得
    let subscription = await swReg.pushManager.getSubscription();

    if (subscription === null) {
      // 新しく購読を開始
      console.log('Not subscribed, creating new subscription...');
      subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      console.log('New subscription created:', subscription);

      // 新しい購読情報をバックエンドに送信
      await fetch('http://localhost:3001/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription.toJSON()),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('プッシュ通知が有効になりました！');
    } else {
      console.log('User is already subscribed.');
      alert('すでに通知は有効です。');
    }
  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    alert('通知の有効化に失敗しました。');
  }
}