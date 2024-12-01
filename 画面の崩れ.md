# 画面の崩れ

画面の崩れについてのチェック項目とその理由を以下に整理

IEからEdgeへの移行での画面の崩れなど見た目での確認を重点的に、IE は非標準的な HTML 要素や属性、CSS プロパティ、JavaScript API を許容する場合があり、これらが Edge などのモダンブラウザで動作しない原因になります。


## 1 レイアウトの検証

HTML の構造、CSS のスタイル、レイアウト全体の表示を検証します。

- 画面が Microsoft Edge のレンダリングエンジン（Chromium ベース）で崩れていないか
- 要素の位置（ボタン、フォーム、画像）が適切に配置されているか
- レスポンシブデザイン（モバイルや異なる解像度）の対応状況

Edge は Chromium をベースとしているため、IE のレンダリングエンジン（Trident）とは異なる仕様で HTML/CSS を解釈します。  
IE 固有の CSS プロパティやベンダープレフィックス（例: `-ms-`）が原因でレイアウトが崩れる可能性があります。


## 2 標準仕様の要素と属性差異
IE では非標準仕様を許容するケースが多いですが、モダンブラウザでは、タグのネストや構文エラーに対して厳格であり、IE の許容範囲内の誤りが原因で崩れが発生する場合があります。

- IE でのみ動作する非標準仕様（例: `<bgsound>`、`<marquee>`、`align` 属性）なタグや属性が使用されていないか
- HTML5 で廃止された要素や属性が利用されていないか

### 2.1 対象となるHTMLの違い

|IE|Edge|
|---|---|
|HTML4（1999年に策定された仕様）|完全な HTML5|
|一部の HTML5（IE9 以降で部分対応）||
|XHTML 1.0/1.1（HTML4 の XML 準拠版）|HTML Living Standard|
|非標準仕様が存在する|非標準仕様の廃止|


### 2.2 HTML の非標準要素

|要素|説明|廃止理由|
|---|---|---|
|`<marquee>`|テキストや画像をスクロール表示|ユーザー体験の悪化。CSS アニメーションで代替可能|
|`<bgsound>`|ページに背景音を設定|モダンブラウザでは `<audio>` で代替|
|`<font>`|テキストのフォント、色、サイズを指定|CSS で代替可能|
|`<center>`|コンテンツを中央揃え|CSS の text-align: center で代替|
|`<isindex>`|単一行の検索ボックスを表示|廃止

### 2.3 HTML の非標準属性

|要素|説明|廃止理由|
|---|---|---|
|`align`|`<div align="center">`|CSS の text-align で代替可能|
|`bgcolor`|`<table bgcolor="#FFFFFF">`|CSS の background-color で代替可能|
|`border`|`<table border="1">`|CSS の border で代替可能|
|`frameborder`|`<iframe frameborder="0">`|`CSS と border プロパティで代替可能|
|`hspace`/`vspace`|`<img hspace="10" vspace="10">`|CSS の margin で代替可能|

### 2.4 参照ツール
- [W3C Validator](https://validator.w3.org): HTML を標準仕様に準拠しているか確認します。

## 3 CSS プロパティの互換性確認

CSS の使用方法

- IE 固有の CSS プロパティ（例: `-ms-grid`）や古い仕様のプロパティを利用していないか
- Flexbox や Grid Layout などモダンなレイアウト方式が正しく表示されているか
- Edge に非対応のプロパティが含まれていないか（古い CSS バージョンを使用している場合）

IE はモダンな CSS レイアウト（Flexbox、Grid）への対応が不完全で、古い技術が利用されている場合があります。  
Edge は最新仕様を基準としているため、非互換部分を修正する必要があります。


### 3.1 対応CSSの違い
既存のコードは、新しいCSSで追加されたプロパティは使われいないと思もわれるので、ベンダープレフィックスに主眼を置き対応する

|IE|Edge|
|---|---|
|CSS2.1に対応し、CSS3 は部分的対応|CSS3/Living Standard|
|一部の CSS プロパティはベンダープレフィックス（`-ms-`）が必要|ベンダープレフィックス不要（標準プロパティのみ対応）|


### 3.2 CSS の非標準プロパティ
標準化されていないプロパティや値が使用されていないか確認します

|プロパティ|説明|代替手段|
|---|---|---|
|`filter:progid:DXImageTransform`|フィルタ効果を適用（IE 独自仕様）|CSS の filter または SVG を使用|
|`zoom`|ズームレベルの調整|CSS transform: scale() を使用|
|`-ms-grid`|グリッドレイアウト（IE 固有のプレフィックス）|CSS Grid レイアウトを使用|


### 3.3 モダンプロパティの代替と旧仕様での表現方法

モダンプロパティを使えば解決できることも、古い方法で表現されている可能性もあり、刷新する場合はこの項目にも注目すべき。  
例えば、現在なら、`display: flex;`を、子要素を横並びにする際に `float: left;`、親要素に clearfix を設定（例: `overflow: hidden;`）、テーブルレイアウトなど利用している

|モダンプロパティ|旧代替手法（IE対応）|問題点|
|---|---|---|
|`display: flex`|`float` と `clearfix` を利用|要素の整列や間隔調整が複雑<br>レスポンシブ対応が困難|
||`display: table` と `table-cell` を利用|レイアウト変更時に制約が多い|
|`display: grid`|`float + 固定幅`（width: 33%; など）|行揃えが困難。レスポンシブや動的調整に非対応|
||`Bootstrap 3` のような古いフレームワーク|フレームワーク依存が強く、カスタマイズが手間|
|`position: sticky`|JavaScript でスクロールイベントを監視して position: fixed に変更|パフォーマンスが低下し、コードが煩雑化|
|`background-size: cover`|固定サイズの画像をデザインで作成して利用|解像度変更やレスポンシブ対応が困難|
|`border-radius`|角丸の画像を利用|サイズ変更時に画像の修正が必要|
|`transition`|JavaScript のタイマー（setTimeout, setInterval）を利用|タイミング管理が複雑で、スムーズな動作が難しい|
|`animation`|GIF アニメーションを利用|制御ができず、変更があるたびに画像の差し替えが必要|
||JavaScript を利用|アニメーションの記述が煩雑化し、パフォーマンスに影響を与える場合がある|
|`clip-path`|画像を直接切り抜いて利用|動的な変更が困難。デザイン変更時に再生成が必要|
|`text-shadow`|擬似要素（::before、::after）で同じテキストを重ねて表現|コードが冗長で、微調整が手間|
|`font-feature-settings`|特定のフォントを画像化して埋め込む|動的なスタイリングが不可能|
|`@media print`|印刷用の別 HTML ページを用意|ページ管理が複雑になり、メンテナンスが困難|
|`@media`|JavaScript で画面サイズを監視して動的に適用|パフォーマンス低下。視覚的スタイル変更が遅延する可能性|


### 3.4 参照ツール
- `CSS Lint`: CSS の非標準プロパティやエラーをチェックします。[Stylelint](https://stylelint.io)


## 4 JavaScript による スタイル操作の確認

JavaScript を使用して動的に適用されるスタイル

- JavaScript による DOM 操作でスタイルが正しく適用されているか。
- IE 固有の API（例: `document.all`、`attachEvent`）が原因でスタイルが崩れていないか。

Edge では標準的な DOM 操作 API（querySelector、addEventListener など）が利用されるため、非互換な操作方法があるとスタイルの適用が失敗する可能性があります。

非効率なスタイル変更を見直し、`classList` や CSS カスタムプロパティを活用し、非標準 API を排除し、モダンな標準 API に置き換える必要があります。

### 4.1 動的なクラス操作
- `classList.add` や `classList.remove` が使用されていない場合、文字列操作に依存しているため、複雑なクラス構成でミスが起きやすい。
- Edge では `classList` をサポートしているため、`className` 操作は非効率であり、移行時に置き換えるべき。

#### `className` を直接操作しているケース
既存コードが以下のように記述されていないかを確認
```js
element.className = element.className + ' active'; // Edgeでは、`element.classList.add('active');`で良い
```

#### クラス削除時の正確性
クラス削除が文字列置換で行われている場合、エラーや未削除のリスクがないか確認

```js
element.className = element.className.replace('active', '');　// Edgeでは、`classList.remove('active')`で良い
```


### 4.2 JavaScript の非標準 API

#### `attachEvent`

非推奨のイベントバインディング方法
```js
element.attachEvent('onclick', handler); // Edgeでは、`element.addEventListener('click', handler); `
```

#### `currentStyle`

要素のスタイル取得に使用
```js
var color = element.currentStyle.color; // Edgeでは、`var color = window.getComputedStyle(element).color;`
```

#### `document.all`
非標準の DOM アクセス方法で、Edge では未対応

```js
var element = document.all['myElementId']; //通常のjavascriptでは、document.getElementById('myElementId');
```

#### `innerText`
テキスト内容を取得・設定する非標準 AP

```js
element.innerText = 'Hello World'; // 通常のjavascriptでは、element.textContent = 'Hello World';
```

### 4.3 スタイルプロパティの直接操作

- `element.style` による個別設定はメンテナンス性が低く、コードの可読性が損なわれるため。
- Edge 環境では、特に動的な UI 操作（モーダルの表示/非表示など）が複雑化する可能性がある。

#### style プロパティで個別設定
以下のように、`element.style` を用いてスタイルを直接設定している箇所を確認

```js
var element = document.getElementById('myDiv');
element.style.color = 'blue';
...
element.style.display = 'none';
element.style.backgroundColor = '#fff';
element.style.color = 'red'; // 上書き
```

- 複数のスタイル設定を都度直接操作している場合、スタイルの適用順序や競合が発生していないかを確認
- 同じ要素に複数のスクリプトが競合していないか
- スタイルの初期状態が明確でない場合、意図しない結果になるケースを確認

#### Edgeでの対応策

- スタイルオブジェクトのまとめて適用  
   ```js
   Object.assign(element.style, {
     display: 'block',
     color: 'red'
   });
   ```
- クラスを使用する  
   ```js
   var element = document.getElementById('myDiv');
   element.classList.add('highlight');
   ```
   ```css
   .highlight {
     color: red;
     background-color: yellow;
   }
   ```
- CSS カスタムプロパティ（CSS Variables）を活用
   ```js
   document.documentElement.style.setProperty('--main-color', 'red');
   ```
   ```css
   :root {
     --main-color: blue;
   }
   #myDiv {
     color: var(--main-color);
   }
   ```

## 5 フォントと文字サイズの確認
> [!CAUTION]
> こちらは別途、[文字化け・文字フォント](./文字化け・文字フォント.md)を参照してください。

フォントや文字サイズは、ブラウザのレンダリングエンジンの違いにより表示結果が変わる場合があります。特に、IE から Edge への移行では、フォントの互換性やレンダリングアルゴリズムの違いに注意が必要です。以下に具体的なチェック項目を詳しく解説します。

フォントファミリー、サイズ、行間、文字間

- 使用されているフォントが Edge 上で正しく表示されているか
- フォントサイズや行間が崩れていないか
- フォールバックフォントが適切か（指定されたフォントが利用できない場合の対応）

### 理由
IE と Edge ではフォントレンダリングエンジンが異なるため、特定のフォントやフォールバックフォントが原因で文字の見え方が変わることがあります。


## 6 印刷スタイルの確認

> [!CAUTION]
> こちらは別途、[システム構成の違いでの帳票への影響](./システム構成の違いでの帳票への影響.md)を参照してください。

印刷用スタイルシート（@media print）

印刷用スタイルは特に IE 固有の指定がある場合、Edge で正しく機能しない可能性があります。帳票出力に影響するため、必須の確認事項です。

- 印刷用のスタイルが Edge 上で適切に適用されているか。
- レイアウトが崩れていないか（特に帳票やレポート画面で重要）



## 7 レスポンシブデザインの動作確認

ビューポートサイズの変更に応じた画面の動作

Edge はレスポンシブデザインに完全対応していますが、古い CSS の指定が原因で意図しない動作をする可能性があります。
特に、E11 以前は CSS メディアクエリに部分的にしか対応しておらず、複雑な条件を使用した場合に正しく評価されないことがあります。
また、IE は `max-width` や `height: auto` の解釈が Edge とは異なる場合があります。

- モバイルやタブレットでの表示が崩れていないか。
- メディアクエリ（`@media`）が正しく適用されているか。

### 7.1 相対単位の使用
IE11 以前ではモダンな単位（例: `vw`, `vh`）がサポートされていないため、`px` 固定で書かれた箇所を見直す

- フォントサイズや要素の幅が、相対単位（例: `%`, `em`, `rem`, `vw`, `vh`）を適切に使用しているか確認

### 7.2 最小・最大サイズ
- `min-width`, `max-width`, `min-height`, `max-height` で定義された条件が適切に機能しているか確認

### 7.3 CSS Grid と Flexbox 
IE 用に float や table ベースのレイアウトが使用されている場合、モダンな CSS レイアウトに置き換えが必要
- レイアウトで使用されている display: grid; や display: flex; が期待通りに動作しているか確認

### 7.4 ビューポートの設定
HTML 内で正しいビューポート設定がされているか確認

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### 7.5 画像と動画
画像や動画のサイズが、デバイス幅に応じて適切にスケーリングされているか。
特に以下の属性や CSS が利用されている場合、Edge 上で意図通り動作しているか確認

```html
<img src="example.jpg" style="max-width: 100%; height: auto;">
```

### 7.6 隠し要素の切り替え
レスポンシブデザインで非表示に設定された要素（例: モバイル版で非表示のメニュー）が正しく切り替わるか
```css
@media (max-width: 600px) {
  .menu {
    display: none;
  }
}
```

### 7.7 テキストの改行と配置
- 長いテキストが小さい画面で適切に改行されているか
- 特に、`word-wrap: break-word;` などが必要な場合を確認

### 7.8 インタラクションの確認
1. クリック領域
2. メニューとナビゲーション
3. ホバー効果



---

1. 確認手順の具体化
   - 各項目について、「何をどうやって確認するか」をさらに詳細に記載すると、実務での確認漏れを防げます。
   - 例: 「DevTools を使った確認手順」や「具体的なチェックツール」のステップを記載。
2. 優先度の明示
   - 移行プロジェクトでは限られたリソースの中で対応を進める必要があるため、各項目に優先度（高・中・低）を付けると、効率的な計画が立てやすくなります。
3. エビデンス記録のフォーマット
   - 各確認項目について、結果を記録するテンプレートを用意すると、プロジェクトチーム全体で進捗や問題箇所を共有しやすくなります。
   - 例: 「確認項目」「期待結果」「確認結果」「対応要否」のようなシンプルな表形式。
4. 関連するモダンブラウザ対応ツールの紹介
   - Can I Use や Modernizr など、ブラウザ対応を効率化するツールの活用方法を提案。
5. FAQ や共通トラブル事例
   - 過去の移行プロジェクトでよく見られる問題や、その対応方法を簡潔にまとめると、実務で役立ちます。
