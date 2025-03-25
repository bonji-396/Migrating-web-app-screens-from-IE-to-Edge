# Webアプリ画面をIEからEdgeへの移行
WebアプリをIEからEdgeに移行時に対応する際の一般的予備知識

## IDからEdgeへの移行についての注意点
- [アーキテクチャー構造の違いによるUIへの影響](./impact-of-architectural-differences-on-ui.md)
- [システム構成の違いでの帳票への影響](./impact-of-differences-in-system-configuration-on-reports.md)
- [ASP.NET およびJavaの現行システム延命のために、アプリ画面をIEからEdgeへの移行とは](./how-to-migrate-app-screens-from-ie-to-edge-to-extend-the-life-of-current-asp.net-and-java-systems.md)
- [懸念・必須の確認事項](concerns_required-checks.md)
- [リセットCSS](resetCSS.md)

## 調査、分析
- [調査手法](./Research-methodology.md)
- [問題の分類]

### 調査確認する項目
- [画面の崩れ](./screen-corruption.md)
- [画面機能（検索、更新、遷移、連動、切替）](./screen-functions.md)
- [帳票出力処理](./report-output-processing.md)
- [csv/Excel出力](./csv_excel-output.md)
- [ファイルのアップロード・ダウンロード機能](file-upload_download-function.md)
- [iFrameを使っている画面](screens-using-iframe.md)
- [IME制御機能がある画面]
- [`window.showModalDialog`及び`window.close`]
- [各画面の各イベントで使用しているクライアントスクリプトの確認]
- [文字化け・文字フォント]
- [サードパーティ]
<!-- - [IME制御機能がある画面](screens-with-ime-control-function.md) -->
<!-- - [`window.showModalDialog`及び`window.close`](window.showmodaldialog-and-window.close.md) -->
<!-- - [各画面の各イベントで使用しているクライアントスクリプトの確認](check-the-client-scripts-used-in-each-event-on-each-screen.md) -->
<!-- - [文字化け・文字フォント](./garbaged-characters_character-fonts.md) -->
<!-- - [サードパーティ] -->

## ツール
- [各種ツール](./tools.md)
