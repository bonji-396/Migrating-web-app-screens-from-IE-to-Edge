# CSV/Excel 出力

CSV/Excel 出力の確認事項と注意点

IE から Edge に移行する際、CSV/Excel 出力に関する以下の違いが確認の中心となります。ブラウザ間で API の仕様や非標準的な機能のサポート状況が異なるため、コードの見直しや再設計が必要になる場合があります。

## 1. JavaScript による CSV/Excel ファイル生成

JavaScript による CSV/Excel生成している箇所は、IE 依存の非標準 API を使用している場合、Edge で動作しないため修正が必要

### 確認事項

1. JavaScript を利用してクライアント側で動的に生成される CSV/Excel ファイルが正しく作成されるか
2. ファイルの内容やエンコード形式（例: `UTF-8`, `Shift-JIS`）が適切か
3. ブラウザが生成されたファイルを正しくダウンロードできるか

### 注意点

- IE 特有の非標準 API
   - IE では `msSaveBlob` や `msSaveOrOpenBlob` を使用していた場合、Edge ではこれらがサポートされない。
   - Edge では `Blob` と `URL.createObjectURL` を使用してファイルを生成・ダウンロードする必要がある。
- エンコード形式の確認
   - CSV ファイルではエンコード形式が異なると文字化けが発生する場合があります。
   - 特に日本語対応では `UTF-8` または `Shift-JIS` の選択が重要です。
   - Edge は `UTF-8` を推奨しているため、従来の `Shift-JIS` コードが使用されている場合、変換が必要になる。

### 修正例

IE 用コード（非標準）
```js
if (window.navigator.msSaveBlob) {
  var blob = new Blob(['data'], { type: 'text/csv;charset=Shift-JIS;' });
  window.navigator.msSaveBlob(blob, 'file.csv');
}
```
Edge 用コード（標準）
```js
var blob = new Blob(['data'], { type: 'text/csv;charset=utf-8;' });
var url = URL.createObjectURL(blob);
var a = document.createElement('a');
a.href = url;
a.download = 'file.csv';
a.click();
URL.revokeObjectURL(url);
```

## 2. サーバーサイドで生成された CSV/Excel ファイルのダウンロード
サーバーサイドので CSV/Excelを生成している場合、その対象のダウンロード時に、 Edgeでは、CORS 設定や HTTP ヘッダーの仕様が厳格化されているため適切な設定が必要です。

### 確認事項

1. サーバーから生成された CSV/Excel ファイルが正しくダウンロードされるか
2. HTTP ヘッダー（例: `Content-Dispositio`n, `Content-Type`）が正しい形式で設定されているか
3. CORS（クロスオリジンリソース共有）に問題がないか

### 注意点

- HTTP ヘッダーの違い  
   - Edge はブラウザでのダウンロード処理に厳格な仕様を採用しています。
   - サーバーから返されるヘッダーが不適切な場合、ダウンロードが失敗する可能性があります。

### 適切なヘッダー設定
例）
```
Content-Disposition: attachment; filename="file.csv"
Content-Type: text/csv; charset=utf-8
```

### 適切なCORS の設定  
   - サーバーとクライアントが異なるドメインの場合、`Access-Control-Allow-Origin` ヘッダーを正しく設定する必要があります。
   - Edge では、CORS の設定が不十分な場合、エラーが発生する可能性があります。


## 3. Excel ファイル生成の方法
Excel ファイル生成を `ActiveX`で行なっている場合、 Egdeでは非対応であるため、JavaScript ライブラリや`WebAssembly`への移行が必要です。

### 確認事項

1. Excel ファイルの生成に ActiveX やサードパーティライブラリを使用していないか
2. JavaScript ベースのライブラリ（例: SheetJS）で期待通りに動作しているか


### 注意点

- ActiveX の非対応
   - IE では `ActiveX` を使用して Excel ファイルを直接操作するコードが存在する場合があります（例: `ActiveXObject('Excel.Application')`）
   - Edge は `ActiveX` を完全にサポートしていないため、別のアプローチ（例: クライアント側でのファイル生成）を採用する必要があります

### 修正例

ActiveX を使用した IE 用コード（非推奨）
```js
var excel = new ActiveXObject('Excel.Application');
excel.Workbooks.Add();
excel.Cells(1, 1).Value = 'Sample Data';
excel.SaveAs('file.xlsx');
excel.Quit();
```

Edge 対応コード（JavaScript ライブラリ）
```js
var workbook = XLSX.utils.book_new();
var worksheet = XLSX.utils.aoa_to_sheet([['Sample Data']]);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
XLSX.writeFile(workbook, 'file.xlsx');
```


## 4. エンコードの確認
Shift-JIS は Edge で文字化けする可能性があるため、UTF-8 BOM の利用が推奨されているため、エンコードの確認を行う必要がある。

### 確認事項

1. CSV のエンコード形式が期待通りか（例: `UTF-8`, `Shift-JIS`）
2. Excel ファイルの文字化けが発生していないか

### 注意点

- Edge は `UTF-8` を推奨  
   - `Shift-JIS` で作成された CSV ファイルを Edge でダウンロードすると文字化けする場合があります。
   - `UTF-8 BOM（Byte Order Mark）`を付加することで、日本語対応を強化できます。


### 修正例
CSV ファイルの UTF-8 BOM 対応

```js
var BOM = '\uFEFF'; // UTF-8 BOM
var csvContent = BOM + 'Header1,Header2\nData1,Data2';
var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
var url = URL.createObjectURL(blob);
var a = document.createElement('a');
a.href = url;
a.download = 'file.csv';
a.click();
URL.revokeObjectURL(url);
```


## 5. ダウンロード処理のイベント操作
Edge のセキュリティ強化により、自動ダウンロードはポップアップブロックの影響を受けやすいため、ダウンロード処理のイベント操作を行い確認してみる必要がある。

### 確認事項

1. ダウンロード時のクリックイベントが適切にトリガーされるか
2. Edge のセキュリティポリシー（ポップアップブロックなど）によりダウンロードが妨げられていないか

### 注意点

- ポップアップブロックの影響  
   - Edge では、ユーザーの操作が伴わないダウンロードがブロックされる場合があります（例: 自動クリックイベント）
   - ボタンのクリックイベントなど、ユーザー操作に関連付けることで回避可能。

### 修正例

ユーザー操作に関連付ける
```js
document.getElementById('downloadButton').addEventListener('click', function () {
  var blob = new Blob(['data'], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'file.csv';
  a.click();
  URL.revokeObjectURL(url);
});
```



