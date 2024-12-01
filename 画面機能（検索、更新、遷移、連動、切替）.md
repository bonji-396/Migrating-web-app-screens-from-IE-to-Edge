# 画面機能（検索、更新、遷移、連動、切替）

ブラウザの動作差異（DOM 操作、フォーム送信、非同期通信、イベント処理）の観点から確認します。  
特に Edge では IE と比べてモダンな仕様に準拠しているため、IE 固有の技術や古い JavaScript API を使用している場合に問題が発生しやすいです。

## 1. 検索機能の確認
フォーム入力やリクエスト送信に関連する API やイベント（`submit`、`keypress`）の処理は、IE と Edge で仕様が異なることがあります。  
特に JavaScript に依存した DOM 操作（例: `attachEvent` vs `addEventListener`）が原因で動作不良が発生する場合があります。

### 確認内容
1. 入力フォームの動作
   - 検索条件入力欄で日本語や特殊文字（例: 絵文字、アクセント付き文字）が正しく入力できるか
   - 入力補完やフォーカス移動が適切に動作するか。
2. 検索結果の表示
   - 検索ボタンや Enter キーでリクエストが正しく送信され、結果が表示されるか
   - サーバー側からのレスポンスデータが正常に描画されるか（例: JSON レスポンスの処理）
3. ページング・ソート
   - 大量データの検索時、ページングやソート機能が正しく動作するか


### `attachEven`
非標準 API の`attachEven`を利用している場合、以下のように`addEventListener`との差異が発生し、動作不良を起こす可能性があります。
|問題|IE（attachEvent）|Edge（addEventListener）|
|---|---|---|
|submit|onsubmit、event.returnValue = false;|submit、event.preventDefault();|
|keypress|非標準、event.keyCode|keydown または keyup を使用|
|イベントの複数登録|上書きされる|両方実行|
|this のスコープ|window を指す|イベント発生元要素を指す|
|キャプチャフェーズのサポート|サポートなし|サポートあり|
|イベントのバブリング停止|cancelBubble|stopPropagation|
|イベントの登録解除|個別解除できない|個別解除可能|

### 非標準のイベント登録　 `onsubmit`

- IE では attachEvent('onsubmit') を使用
   ```js
   var form = document.getElementById('myForm');
   form.attachEvent('onsubmit', function (event) {
     console.log('Form submitted');
     event.returnValue = false; // デフォルトアクションをキャンセル
   });
   ```
- Edge では addEventListener('submit') を使用
- また、IE11 およびそれ以前のブラウザでは、submit イベントはバブリングしません。
   ```js
   var form = document.getElementById('myForm');
   form.addEventListener('submit', function (event) {
     console.log('Form submitted');
     event.preventDefault(); // デフォルトアクションをキャンセル
   });
   ```

### 非標準のイベント登録 `keypress`
モダンブラウザ（Edge 含む）では、keypress イベントは非推奨となり、keydown または keyup を使用することが推奨されています。
- IE コード（非標準）
   ```js
   var input = document.getElementById('myInput');
   input.attachEvent('onkeypress', function (event) {
     if (event.keyCode === 13) { // Enter キー
       console.log('Enter pressed');
     }
   });
   ```
- Edge コード（標準）
   ```js
   var input = document.getElementById('myInput');
   input.addEventListener('keydown', function (event) {
     if (event.key === 'Enter') { // Enter キー
       console.log('Enter pressed');
     }
   });
   ```

### フォーム内のボタンのデフォルト動作
- IE では、submit ボタンをクリックしない限りフォームの送信イベントが発生しない場合があります。
   ```js
   var input = document.getElementById('myInput');
   input.attachEvent('onkeypress', function (event) {
     if (event.keyCode === 13) {
       document.getElementById('myForm').submit();
     }
   });
   ```
- Edge では、Enter キー押下時にもフォームが送信されます（submit イベントが発生）。
   ```js
   var form = document.getElementById('myForm');
   form.addEventListener('submit', function (event) {
     console.log('Form submitted via Enter');
   });
   ```

### イベントリスナーが複数回登録されない
IE 用に attachEvent で実装されたコードが Edge に移行した際、想定通りに動作しない可能性があります（イベントが複数登録されている前提のコードで動作不良が発生）

- `attachEvent` は同じイベントリスナーを複数回登録できず、最後に登録されたものだけが有効になります。
   ```js
   var element = document.getElementById('myButton');
   function handler1() {
     console.log('Handler 1 executed');
   }
   function handler2() {
     console.log('Handler 2 executed');
   }
 
   element.attachEvent('onclick', handler1);
   element.attachEvent('onclick', handler2); // 上書きされる
   ```
- `addEventListener` では同じイベントを複数回登録でき、それぞれが実行されます。
   ```js
   element.addEventListener('click', handler1);
   element.addEventListener('click', handler2); // Handler 1 と Handler 2 の両方が実行される
   ```

### this のスコープが異なる
IE 用コードで this を使用して DOM 要素にアクセスしている場合、Edge 移行時に this が異なるオブジェクトを指してしまい、意図した動作が実現できなくなる。

- `attachEvent` では、this は window を指すため、id プロパティは未定義
   ```js
   var element = document.getElementById('myButton');
   element.attachEvent('onclick', function () {
     console.log(this.id); // undefined
   });
   ```

- `addEventListener`では、this はクリックされた要素を指す
   ```js
   var element = document.getElementById('myButton');
   element.addEventListener('click', function () {
     console.log(this.id); // "myButton"
   });
   ```

this のスコープが変わる場合、アロー関数や .bind() を使用して意図通りのスコープを設定する必要があります。


### イベント伝播の制御
- `attachEvent` はイベントキャプチャ（捕捉）フェーズをサポートしておらず、バブリング（伝播）フェーズのみで動作します。
   ```js
   var parent = document.getElementById('parent');
   var child = document.getElementById('child');
 
   parent.attachEvent('onclick', function () {
     console.log('Parent clicked');
   });
 
   child.attachEvent('onclick', function () {
     console.log('Child clicked');
   });
   ```
- `addEventListener` はキャプチャフェーズとバブリングフェーズの両方でイベントを処理できます。
   ```js
   var parent = document.getElementById('parent');
   var child = document.getElementById('child');
 
   // キャプチャフェーズで処理
   parent.addEventListener('click', function () {
     console.log('Parent clicked (capture)');
   }, true);
 
   // バブリングフェーズで処理
   child.addEventListener('click', function () {
     console.log('Child clicked');
   });
   ```

> [!NOTE]
> イベント伝播の順序は以下の 3 つの段階からなります。
> |順序|フェーズ|説明|
> |---|---|---|
>	|1|キャプチャフェーズ<br>（イベントが親から子へ伝播）|ルート（最上位の document）から開始し、イベント発生元の要素に向かって伝播します。<br>親要素で早期にイベントを処理したい場合などに利用されます。|
>	|2|ターゲットフェーズ<br>（イベント発生元での処理）|イベントが発生した要素自体で処理されます。|
>	|3|バブリングフェーズ<br>（イベントが子から親へ伝播）|イベント発生元の要素から親要素に向かって逆方向に伝播します。<br>子要素のイベントを親要素で処理したい場合に使われます。|

### イベントのバブリング停止　`cancelBubble`
- `attachEvent` では、イベントのバブリングを止めるために `cancelBubble` を使用します。
   ```js
   var child = document.getElementById('child');
   child.attachEvent('onclick', function (event) {
     event.cancelBubble = true; // バブリングを止める
     console.log('Child clicked');
   });
   ```
- `addEventListener `では、`stopPropagation` メソッドを使用します。
   ```js
   var child = document.getElementById('child');
   child.addEventListener('click', function (event) {
     event.stopPropagation(); // バブリングを止める
     console.log('Child clicked');
   });
   ```

### イベントの登録解除
- `attachEvent` では、特定のイベントリスナーを個別に解除する方法がありません。
   ```js
   var element = document.getElementById('myButton');
   function handler() {
     console.log('Handler executed');
   }
   element.attachEvent('onclick', handler);
   // イベント解除はできない
   ```
- `addEventListener` では、登録時と同じ関数を指定することで解除できます。
   ```js
   var element = document.getElementById('myButton');
   function handler() {
     console.log('Handler executed');
   }
   element.addEventListener('click', handler);
   element.removeEventListener('click', handler); // イベント解除
   ```

### 古いライブラリの`attachEvent`の依存
古いライブラリ（例: jQuery 1.x）が attachEvent に依存している場合、最新バージョンへのアップデートを検討すべきです。

## 2. 更新機能の確認

ブラウザ間でのフォーム送信や非同期通信（AJAX）処理の違いにより、Edge では期待通りにデータが送信・保存されない可能性があります。
また、Edge では、セキュリティポリシー（CORS、SameSite Cookie 設定など）が厳格化されているため、これらに適合していない場合、通信がブロックされることがあります。

### 確認内容

1. データの入力と検証
   - 入力フォームで数値、日付、文字列のバリデーションが正しく動作するか（例: 必須項目の確認、フォーマットチェック）
   - Edge の新しいバリデーション機能（例: type="email" のネイティブチェック）に適合しているか
2. データ送信
   - フォーム送信後、データがサーバーに正しく保存されるか
   - AJAX リクエストを使用している場合、HTTP ステータスコードやエラーハンドリングが正常に動作するか
3. トランザクション処理
   - 更新処理中に他の操作を行った場合のエラーハンドリング（例: 二重送信の防止）が適切かs

### IEとEdgeの違い

|項目|IE|Edge|
|---|---|---|
|API|`XMLHttpRequest`, `XDomainRequest`|`Fetch API`|
|セキュリティポリシー|CORS の部分対応、SameSite 未対応|CORS の完全対応、SameSite サポート|
|同期リクエスト|可能|非推奨|
|JSON 対応|IE8 以降標準対応|完全標準対応|
|ヘッダー操作|一部制限あり|標準対応|

### 使用する AJAX API の違い

|API|IE|Edge|
|---|---|---|
|`XMLHttpRequest` (XHR) |◯|◯|
|`Fetch API`|×|◯|

※ Edgeは、XHR はサポートされるが、モダンな仕様として Fetch API の利用が推奨される。（PWAなどので利用する、Service WorkerなどはFetch APIのみ利用可能）

- IEでは、の主流 API として`XMLHttpRequest`が使用され、全バージョンでサポート。IEではFetch APIは未サポート
   ```js
   // XMLHttpRequest (IE 対応)
   var xhr = new XMLHttpRequest();
   xhr.open('GET', '/api/data', true);
   xhr.onload = function () {
     if (xhr.status === 200) {
       console.log(xhr.responseText);
     }
   };
   xhr.send();
   ```
- Edgeでは、XHR はサポートされるが、モダンな仕様として Fetch API の利用が推奨される。
   ```js
   // Fetch API (Edge 推奨)
   fetch('/api/data')
     .then(response => {
       if (response.ok) {
         return response.json();
       }
       throw new Error('Network response was not ok');
     })
     .then(data => console.log(data))
     .catch(error => console.error('Fetch error:', error));
   ```

### セキュリティポリシーの違い
- IE9 以前は CORS をサポートしておらず、クロスドメイン通信には非標準の XDomainRequest を使用していました。
- IE10/11では CORS に対応していますが、仕様に差異があります（例: 一部のカスタムヘッダーがサポートされない）。
   ```js
   // XDomainRequest (IE 専用)
   var xdr = new XDomainRequest();
   xdr.open('GET', 'https://example.com/api/data');
   xdr.onload = function () {
     console.log(xdr.responseText);
   };
   xdr.send();
   ```
- Edgeでは、W3C の標準 CORS に完全準拠しており、非標準の XDomainRequest は使用できません。
   ```js
   // Fetch API with CORS (Edge)
   fetch('https://example.com/api/data', {
     method: 'GET',
     headers: {
       'Content-Type': 'application/json'
     }
   })
     .then(response => response.json())
     .then(data => console.log(data))
     .catch(error => console.error('CORS error:', error));
   ```

### 同期リクエストの非推奨化
- IE: 同期リクエスト（async = false）が可能。
   ```js
   var xhr = new XMLHttpRequest();
   xhr.open('GET', '/api/data', false); // false = 同期
   xhr.send();
   console.log(xhr.responseText);
   ```
- Edge: 同期リクエストは非推奨であり、エラーや警告が表示される場合があり、非同期リクエストに書き換える必要があります


## 3. 画面遷移の確認
Edge では URL エンコードの仕様や DOM 操作の挙動が IE と異なるため、リンク先の動作が異なる場合があります。
非同期通信を伴う画面遷移（SPA 構造）は、状態管理（例: sessionStorage）が影響することがあります。

### 確認内容

1. リンクやボタンによる遷移
   - メニューリンクやボタンによる遷移が正しく行われるか
   - JavaScript を利用した動的遷移（例: window.location や history.pushState）が動作するか
   - URL 内のハッシュ（#）やクエリパラメータが適切に処理されるか
2. クエリパラメータの維持
   - URL パラメータが正しく引き継がれるか（例: 検索条件やページ番号）
      - IE の場合、パラメータが特殊文字を含むと正しく送信されない場合があります（URL エンコードが適切でないケース）
3. バック・フォワード操作
   - ブラウザの戻るボタンや進むボタンで、期待通りの状態に復帰するか
   - IE では window.history API の一部機能（例: history.replaceState）がサポートされていません。

```js
// IE 用のクエリ文字列操作
function getQueryParams(url) {
  var queryString = url.split('?')[1] || '';
  var params = {};
  queryString.split('&').forEach(function (param) {
    var [key, value] = param.split('=');
    params[key] = decodeURIComponent(value);
  });
  return params;
}

// Edge では標準的な API を利用可能
var url = new URL(window.location.href);
var params = new URLSearchParams(url.search);
params.set('page', 2);
console.log(params.toString()); // page=2
```

## 4. 連動機能の確認
フィールド間の連動は、古い JavaScript API（document.all や attachEvent）を利用している場合、Edge では動作しない可能性があります。
非同期データ取得に失敗すると、連動が破綻することがあります。

### 確認内容

1. 複数フィールドの連動
   - プルダウンメニューやチェックボックスの変更時に他のフィールドが正しく更新されるか
   - JavaScript を利用したフィールド間の相互更新が動作するか
2. 依存データの取得
   - マスタデータなど、依存関係のあるデータが非同期で正しく取得されるか
   - 例: プルダウン A の選択に応じてプルダウン B の選択肢を動的に変更


## 5. 切替機能の確認
切替時の描画は、IE 固有のイベントモデル（attachEvent）やスタイル操作が原因で動作しないことがあります。
Edge ではモダンな CSS と DOM 操作を期待しているため、古い方法は動作不良を起こす可能性があります。

### 確認内容

1. タブ切替
   - タブやセクションの切替が正常に動作するか
   - 切替に伴うコンテンツの描画（例: display: none; から display: block; への変更）がスムーズか
2. 表示状態の維持
   - 切替後の状態が期待通り維持されるか
   - ページリロード後も前回の状態を保持する機能がある場合、その動作が正しいか


## その他の補足
- ツールの活用:
   - Edge DevTools でネットワーク通信や JavaScript エラーを確認
   - 自動化ツール（Selenium、Playwright）を活用した動作確認
- シナリオベースのテスト:
   - エンドユーザーの操作シナリオを再現し、検索から更新、遷移、連動、切替といった一連の操作が正しく機能するかを確認


