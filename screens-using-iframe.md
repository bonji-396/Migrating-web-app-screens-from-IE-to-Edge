# iFrameを使っている画面

VBベースのASP（Classic ASP）のWebアプリケーションにおける**「iFrameを使っている画面」**について、IE依存からEdge対応への移行時に懸念事項、調査事項、および既知の不具合とその対策を以下にまとめました。

## 1. 懸念事項

### 1.1 IE固有の挙動への依存
- ドキュメント間のスクリプト通信（Cross-Frame Scripting）  
IEでは、親ページとiframe間でのスクリプト通信に特定の緩和措置がありましたが、EdgeではSame-Origin Policy（同一生成元ポリシー）が厳格に適用され、異なるオリジン間でのDOM操作やデータアクセスが制限されます。

- iframeのスタイル崩れ  
IE特有のCSS処理に依存したスタイルがEdgeで正しく表示されない可能性があります。

- JavaScriptのイベントモデルの違い  
IEではiframe内のDOMイベントの処理に特有の挙動があり、Edgeではモダンブラウザ標準仕様に準拠するため動作が変わる場合があります。

### 1.2 セキュリティ制限の強化
- サンドボックス属性の影響  
Edgeではiframeに対してサンドボックス属性（sandbox）を適用することでセキュリティを強化しますが、意図しない動作制限が生じる可能性があります。
   - 例: sandbox 属性がデフォルトで JavaScript 実行やポップアップを制限。

- CSP（Content Security Policy）対応   
EdgeではCSP設定が適用されるため、iframe内のコンテンツロードやスクリプト実行が制限されることがあります。

### 1.3 パフォーマンスと互換性
- 遅延読み込み  
IEではiframeの読み込みが即時に行われますが、Edgeではパフォーマンス改善のためにiframeコンテンツが遅延ロードされる場合があります。

- 古いJavaScript APIの非互換  
IEで動作していたiframe関連の古いAPI（例: frames コレクション）を使用している場合、Edgeでは動作しません。

## 2. 調査事項

### 2.1 iframeの配置と役割
1. 配置場所の確認
   - どの画面にiframeが利用されているか、使用目的を特定
   - 他システムや外部Webサイトを表示するためのiframe
   - 同一システム内の別ページを埋め込むためのiframe

2. iframeでロードするコンテンツ  
iframe内で読み込むページのオリジン（同一オリジンかクロスオリジンか）を特定

3. iframeの構造と親ページとの関係  
iframe内のスクリプトが親ページや他のiframeとどのように連携しているか

### 2.2 JavaScriptとイベント処理
1. 親ページとiframe間の通信  
親ページからiframe、またはiframe内スクリプトから親ページのDOMを操作している場合、その方式（例: window.parent、window.frames）を確認。

2. イベント伝播
   - IE固有のcancelBubbleが使用されていないか
   - EdgeではaddEventListenerと標準的なイベントモデルが必要

3. 古いAPIの使用確認  
framesコレクションやdocument.allのような非標準APIが使用されていないか

### 2.3 CSSとスタイル
1. iframeのサイズと配置  
CSSでwidth、heightを固定値で指定している場合、レスポンシブ対応が必要かを確認

2. スクロールバーの表示  
IEでは自動的に非表示になる場合があるが、Edgeでは明示的な設定（例: overflowプロパティ）が必要

### 2.4 セキュリティ設定
1. iframe属性の確認
   - Edgeではsandbox属性やallow属性を適切に設定しないと、一部機能が制限される。
   - 例: sandbox="allow-scripts allow-same-origin"
2. CORSポリシーの適用確認  
iframe内で読み込むコンテンツが別ドメインの場合、CORS（Cross-Origin Resource Sharing）エラーが発生する可能性がある。

## 3. IE依存からEdge対応での既知の不具合と対策

### 3.1 親ページとiframeの連携
#### 問題
IE依存のframesコレクション使用
#### 状況
IEではframes["iframeName"]でiframeにアクセス可能だった。
#### 対策
`window.frames`や`document.getElementById`で`iframe`要素を明示的に取得する。

```js
// IEのコード
var iframeDoc = frames["iframeName"].document;

// Edge対応コード
var iframeDoc = document.getElementById("iframeName").contentDocument;
```


### 3.2 クロスオリジン制約
#### 問題
親ページからiframe内のDOMへの直接アクセス
#### 状況
別オリジンのiframeに親ページがアクセスする場合、IEでは制限が緩かったが、Edgeでは厳密に制限される。
#### 対策
親とiframe間の通信にはpostMessage APIを使用する。

```js
// 親ページからiframeへメッセージ送信
var iframe = document.getElementById("iframeName");
iframe.contentWindow.postMessage("Hello from parent", "https://example.com");

// iframe内でメッセージ受信
window.addEventListener("message", function(event) {
  if (event.origin === "https://example.com") {
    console.log("Received from parent:", event.data);
  }
});
```

### 3.3 サンドボックス制限
#### 問題
サンドボックス属性の誤用
#### 状況
sandbox属性が意図せず設定され、iframe内のスクリプトが動作しない。
#### 対策
必要な属性を追加する。

`<iframe src="page.html" sandbox="allow-scripts allow-same-origin"></iframe>`


### 3.4 スタイルの崩れ
#### 問題
レスポンシブ対応不足
#### 状況
固定サイズのiframeが画面サイズに応じて崩れる。
#### 対策
CSSでレスポンシブ対応を設定。

```css
iframe {
  width: 100%;
  height: 100%;
  border: none;
}
```

## 4. 検討すべき代替案
1. iframeからモダンなWeb技術への移行  
iframe依存を最小限に抑え、モダンなWebコンポーネント（例: React、Vue.js）やAPI連携に置き換える。
2. iframeの役割の分割  
iframeが担っている機能を小さなモジュールに分割し、各機能を個別に改善。
3. CSPの緩和を最小限に設定  
必要な範囲でCSPポリシーを調整しつつ、セキュリティを確保。

## まとめ

|項目|懸念事項|対策|
|---|---|---|
|DOMアクセス|IE特有のframesやdocument.allが使用されている可能性|モダンなDOM API（getElementById、contentDocument）に置き換え|
|クロスオリジン制約|Edgeでは同一オリジン制約が厳密化|postMessageを使用して親とiframe間の通信を実現
|スタイル崩れ|固定サイズやIE特有のCSS処理が原因でレイアウトが崩れる|CSSでレスポンシブ対応を適用|
|セキュリティ設定|sandboxやCSPによる動作制限が影響|必要な許可を明示的に設定（例: allow-scripts allow-same-origin）|


## サンプルコード

### ケース１
- [旧IE版](./framsetToiFrameSample/ie-1)
- [対策Edge版](./framsetToiFrameSample/new-1/)

### ケース２
- [旧IE版](./framsetToiFrameSample/ie-2)
- [対策Edge版](./framsetToiFrameSample/new-2/)
