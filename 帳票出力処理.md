# 帳票出力処理

IE から Edge に移行する際の帳票出力処理では、主に以下の要素が異なるため確認が必要です。

帳票出力処理の確認では、以下に注意してください。

1. 非標準仕様の使用: IE 固有の技術（ActiveX、非標準 API）に依存していないか確認。
2. モダン API の利用: Edge の標準仕様（Fetch API、Blob、URL.createObjectURL）に対応する必要があります。
3. 印刷スタイル: @media print の適用状況を確認し、印刷時の見栄えを調整。

## 1. HTML ベースの帳票出力

HTMLベースの帳票出力については、[`画面の崩れ`](./画面の崩れ.md)を参照してください。  
また、システムアーキテクチャー構造の違いによって、UIへの影響も配慮するべき事項もあるため、[`アーキテクチャー構造の違いによるUIへの影響`](./アーキテクチャー構造の違いによるUIへの影響.md)も参照してください。

## 2. クライアント側でのファイルダウンロード処理

### 確認事項

帳票をファイルとしてダウンロードする際、以下を確認します
1. JavaScript で動的に生成した帳票ファイル（`PDF`, `CSV`, `Excel`）のダウンロードが期待通り動作するか
2. Blob オブジェクトや `URL.createObjectURL` を使用したダウンロード処理が正しく動作するか
3. MIME タイプの指定が正しいか（例: `application/pdf`, `text/csv`）


### 非標準 API の廃止
- IE では `msSaveBlob` や `msSaveOrOpenBlob` が利用可能でしたが、Edge ではこれらがサポートされません。
   ```js
   if (window.navigator.msSaveOrOpenBlob) {
     window.navigator.msSaveOrOpenBlob(blob, 'report.pdf');
   }
   ```
- Edge では標準 API（例:`Blob`、`URL.createObjectUR`L）を使用する必要があります。
   ```js
   var url = URL.createObjectURL(blob);
   var a = document.createElement('a');
   a.href = url;
   a.download = 'report.pdf';
   a.click();
   URL.revokeObjectURL(url);
   ```

### セキュリティ仕様の強化
Edge はダウンロードに関するセキュリティポリシーが厳格化されており、適切な MIME タイプやファイル名の設定が求められる。

### イベント処理の違い
IE は click() メソッドのシミュレーションが制限される場合があるが、Edge では自由に使用可能です。

## 3. サードパーティライブラリの互換性

### 確認事項

- 帳票生成に使用しているライブラリ（例: PDF.js、Excel.js）が Edge に対応しているか
- IE 固有のコード（例: attachEvent や document.all）に依存しているか

### 古いライブラリの非互換性
- 古いサードパーティライブラリ（例: 古い jQuery プラグインや ActiveX ベースの帳票ツール）は Edge でサポートされない。
- 特に IE 固有の API（attachEvent や document.all）を使用している場合、Edge 環境で動作しない。


## 4. 印刷スタイル（@media print）の動作

### 確認事項

印刷用のスタイルシートが正しく適用されているか
1. 帳票を印刷した際、レイアウトが崩れていないか。(印刷用スタイルシート（@media print）が正しく適用されているか)
2. 印刷時に不要な要素（例: メニューや広告）が非表示になっているか。

### 注意点
IE では非標準的な CSS 指定（`-ms-`）で動作していた印刷用のスタイルが、Edge では無効になる。
Edge は @media print の仕様に完全準拠していますが、IE では一部が正しく解釈されない場合がありました。そのため、IE 用の修正コードが残っている場合、Edge 環境で問題を引き起こす可能性があります。

```css
@media print {
  body {
    font-size: 12pt;
    margin: 1in;
  }
  .no-print {
    display: none;
  }
}
```
## 5. ActiveX や COM コンポーネントの使用

### 確認事項

- 帳票出力に ActiveX コントロールや COM コンポーネントを使用していないか。
- 帳票データの生成や表示に Internet Explorer のみ対応の技術が組み込まれていないか。

### 注意点

ActiveX の非対応
- Edge では ActiveX が完全に非サポートです。帳票出力に ActiveX を使用している場合、完全な作り直しが必要です。
- 例: ActiveXObject('Excel.Application') のようなコード。
- ActiveX や COM コンポーネントはセキュリティ上のリスクが高く、モダンブラウザでは使用が推奨されていない。

ActiveX を使用して Excel を操作する代わりに、クライアント側で JavaScript ライブラリ（例: SheetJS）を使用して Excel ファイルを生成します。

```js
var workbook = XLSX.utils.book_new();
var worksheet = XLSX.utils.aoa_to_sheet([
  ['Column 1', 'Column 2'],
  ['Data 1', 'Data 2']
]);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
XLSX.writeFile(workbook, 'report.xlsx');
```

## 推奨ツールとデバッグ方法

1. Edge DevTools
   - DOM 構造や CSS の適用状態を確認
   - コンソールで JavaScript のエラーを調査
2. ブラウザ互換性チェック
   - Microsoft の Edge Webdriver や Playwright を使用して動作確認
3. 帳票ツールの見直し



