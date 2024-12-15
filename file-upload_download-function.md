# ファイルのアップロード・ダウンロード機能
VBベースのASP（Classic ASP）のWebアプリケーションにおける**「ファイルのアップロード・ダウンロード機能」**のIE依存からEdge対応に際する調査ポイントを以下にまとめました。

## 1. 懸念事項

### 1.1 ファイルアップロードの懸念
1. ActiveX依存  
IEではActiveXを利用してファイル操作（選択、アップロード）を簡単に実現していましたが、Edgeでは非対応です。
   - 例: ファイル選択やバイナリデータ送信にActiveXが使用されている場合、動作しません。
2. ファイルサイズ制限
   - Classic ASPでは、アップロード可能なファイルサイズの上限がある（デフォルトは約200KB）
   - Edge対応に伴い、アップロードサイズの制限緩和が必要になる場合があります。
3. MIMEタイプの厳格化  
Edgeでは送信されるファイルのMIMEタイプが正しく設定されていないとリクエストが拒否される可能性があります。
4. HTTPリクエスト形式の違い  
IEとEdgeではフォームデータ（multipart/form-data）の送信形式に違いがある場合があります。

####  既知の不具合や互換性の問題
- Edgeでファイル選択ダイアログが表示されない
- 選択したファイルパスの取得方法の違い
- プログレスバーの表示が機能しない
- 大容量ファイルのアップロード時のタイムアウト
- IEモードとEdgeモード間でのファイル処理の挙動の違い

#### フォーム構成の確認
```html
<!-- 従来のIEでよく使用されていた形式 -->
<form method="post" enctype="multipart/form-data" action="upload.asp">
    <input type="file" name="fileUpload">
</form>
```

#### サーバーサイドの実装確認：
```vbscript
' Classic ASPでよく使用されるコンポーネント
Set Upload = Server.CreateObject("Persits.Upload")
' または
Set Upload = Server.CreateObject("ADODB.Stream")
```

#### 主な懸念事項
- ActiveXコンポーネントの使用有無
- ファイルパス取得方法の違い（IE vs Edge）
- マルチファイルアップロード対応状況
- プログレスバーの実装方法
- アップロードサイズの制限値


### 1.2 ファイルダウンロードの懸念
1. ActiveXを利用したダウンロード  
IEでよく使用されたActiveXObject（例: ADODB.Stream）によるファイルダウンロードはEdgeでは動作しません。
   - 例: msSaveBlob APIはIE特有の仕様であり、Edgeでは標準的なBlobオブジェクトやURL.createObjectURLを使用する必要があります。
2. セキュリティ制限  
Edgeではファイルダウンロードのポップアップや「保存/開く」のプロンプトがIEと異なる動作をする場合があります。
3. CORSポリシー  
ファイルダウンロード時にサーバー間通信（クロスドメイン）を行う場合、EdgeではCORSの適切な設定が必須です。

####  既知の不具合や互換性の問題
- ダウンロードの保存先指定ダイアログの挙動の違い
- 日本語ファイル名の文字化け
- ダウンロード完了通知の挙動の違い
- セキュリティ警告の表示パターンの変化


#### レスポンスヘッダーの確認

```vbscript
Response.AddHeader "Content-Disposition", "attachment; filename=" & fileName
Response.AddHeader "Content-Type", "application/octet-stream"
```

#### 主な懸念事項
- ダウンロードファイル名の文字化け
- Content-Dispositionヘッダーの設定
- ファイルの開き方の制御（直接開く vs 保存）
- ダウンロード進捗の表示方法
- キャッシュ制御の実装


## 2. 調査事項

### 2.1 ファイルアップロードの調査事項
1. HTMLフォームの確認
   - <input type="file">タグが使用されているか
   - ActiveXや独自プラグインに依存していないか
2. ファイル送信ロジックの確認
   - クライアント側でどのようにファイルをサーバーに送信しているか
   - jQueryの$.ajaxでファイルアップロードを行っている場合、Edgeで正しく動作するか
3. Classic ASPの制約
   - サーバー側でファイルの保存処理をどのように行っているか（例: Request.BinaryRead）
   - ファイルサイズの制限（MaxRequestEntityAllowed）が適切に設定されているか
4. セキュリティ設定  
サーバー側でアップロード可能なファイルタイプの制限（例: MIMEタイプチェック）が実装されているか

### 2.2 ファイルダウンロードの調査事項
 1. ダウンロード方法の確認
   - ファイルダウンロードがどのように実現されているか
   - サーバーから直接レスポンスヘッダーを送信（例: Content-Disposition）
   - ActiveXやプラグインに依存しているか
 2. ダウンロードヘッダーの確認
   - レスポンスヘッダーがEdgeの仕様に適合しているか。
   - Content-Disposition: attachment; filename="example.txt"
   - Content-Typeが適切か（例: application/octet-stream）
 3. ブラウザ依存のJavaScript API  
 msSaveBlob や window.navigator.msSaveOrOpenBlob が使用されている場合、モダンなBlobやURL.createObjectURLに置き換える必要があります。
 4. Edgeでの動作確認  
ダウンロードリンクがクリックできない、もしくはエラーになる場合、ブラウザのDevToolsでエラー内容を確認する。

### 2.3 重点的な調査が必要な実装パターン：

```javascript
// アップロード処理の実装パターン
function uploadFile() {
    var form = document.forms[0];
    var file = form.elements['fileUpload'];
    // IEに依存した実装がないか確認
    if (window.ActiveXObject) {  // 要改修
        // ActiveXを使用した処理
    }
}

// ダウンロード処理の実装パターン
function downloadFile() {
    // window.openを使用したダウンロード
    window.open('download.asp?file=' + fileName);
    // または
    location.href = 'download.asp?file=' + fileName;
}
```


## 3. IE依存からEdge対応での既知の不具合と対策

### 3.1 アップロードの既知の不具合
#### 1. 問題: ActiveXの非対応
- 状況  
ActiveXによるファイル選択や送信が使用されている場合、Edgeでは動作しない。
- 対策  
`<input type="file">`とJavaScript（例: FormData API）を利用してモダンなアップロード機能を実装。

```js
var formData = new FormData();
formData.append("file", fileInput.files[0]);

fetch("/upload", {
    method: "POST",
    body: formData,
}).then(response => {
    console.log("Upload successful");
});
```

#### 2. 問題: ファイルサイズ制限
- 状況  
Classic ASPのRequest.BinaryReadの制限（約200KB）がある。
- 対策  
   - IIS設定でMaxRequestEntityAllowedの値を調整
   - 必要に応じてサーバーサイドでファイル分割処理を行う。

### 3.2 ダウンロードの既知の不具合
#### 1. 問題: ActiveXObjectの使用
- 状況  
IEでは以下のようなコードでファイルをダウンロードしていたケースがある。

```js
var stream = new ActiveXObject("ADODB.Stream");
```

- 対策  
Edgeでは以下のようにBlobオブジェクトを使用する。

```js
var blob = new Blob([data], { type: "application/octet-stream" });
var url = URL.createObjectURL(blob);
var link = document.createElement("a");
link.href = url;
link.download = "example.txt";
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
```


#### 2. 問題: セキュリティ制約
- 状況  
EdgeではContent-Dispositionヘッダーが適切でないとダウンロードが失敗
- 対策  
サーバーサイドでレスポンスヘッダーを正しく設定

```js
Response.AddHeader "Content-Disposition", "attachment; filename=example.txt"
Response.ContentType = "application/octet-stream"
```

## 4. 改善アプローチ：
1. ActiveXコンポーネントの依存度チェックと代替実装の検討
2. プログレスバーの実装見直し
3. エラーハンドリングの強化
4. セキュリティヘッダーの見直し
5. 文字コード処理の統一
6. クロスブラウザ対応のテスト計画策定

アップロード機能の現代化：
```html
<!-- モダンな実装例 -->
<form id="uploadForm" enctype="multipart/form-data">
    <input type="file" id="fileInput" multiple>
</form>

<script>
const form = document.getElementById('uploadForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    try {
        const response = await fetch('upload.asp', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        // 処理結果の表示
    } catch (error) {
        console.error('Upload failed:', error);
    }
});
</script>
```

ダウンロード機能の改善：
```javascript
// Blobを使用したダウンロード処理
async function downloadFile(url, fileName) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Download failed:', error);
    }
}
```

5. まとめ

|項目|IE依存の懸念事項|Edge対応の対策|
|---|---|---|
|アップロード|ActiveXによるファイル操作。ファイルサイズ制限。| <input type="file">とFormData APIを利用。IISのサイズ設定を更新|
|ダウンロード|ActiveXObjectやmsSaveBlobの使用|レスポンスヘッダーが適切でない。 BlobとURL.createObjectURLを利用。Content-Dispositionヘッダーを正しく設定。|
|セキュリティ設定|ファイルタイプやエンコード形式が厳密でない場合、ダウンロードが失敗する可能性|MIMEタイプとCORSポリシーを適切に設定|
