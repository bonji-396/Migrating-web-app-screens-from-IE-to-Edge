# ブラウザ固有のスタイルシートを解除する

以下、ブラウザ固有のスタイルシートをリセットする方法です。
Egde以外にもFirefox、Chrome、Safariなどのブラウザにて固有のスタイルシートが設定されています。

以下は、簡易的によく使われるものです。僕もよく使います。  
より厳密なものは一番下に`リセットCSS例`にて、提示してます。

```css
html, body, h1, h2, h3, p, ul, li, dl, dt, dd {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  line-height: 1.0;
}
ul {
  list-style: none;
}
a {
  text-decoration: none;
}
img {
  vertical-align: bottom;
  max-width: 100%;
  height: auto;
}
```

現在はフロントエンドのUIフレームワークなどを利用することが多いかと思いますが、これらを利用するとほとんど対応済みなので、フレームワークの導入も検討に値するかもしれません。


## 1. ブラウザごとの余白の違い

デフォルトの margin や padding は、ブラウザごとに異なる設定がされているため、リセットが必要です

- 対象要素: html, body, h1, h2, h3, p, ul, ol, li, dl, dt, dd。

```css
html, body, h1, h2, h3, p, ul, li, dl, dt, dd {
  margin: 0;
  padding: 0;
}
```

## 2. リストスタイルの初期化

ブラウザごとに異なるリストのデフォルトスタイル（例: list-style）を統一するため。

- 対象要素: ul, ol
```css
ul, ol {
  list-style: none;
}
```
## 3. アンカータグの装飾

デフォルトのリンク装飾（例: 下線や色）を統一し、独自のスタイルを適用しやすくするため

- 対象要素: a

```css
a {
  text-decoration: none;
  color: inherit;
}
```

## 4. 画像の表示方式

デフォルトで画像がインラインボックスとして扱われることによるずれを防ぎ、レスポンシブデザインを意識したスタイルを適用するため

- 対象要素: img

```css
img {
  vertical-align: bottom;
  max-width: 100%;
  height: auto;
}
```

## 5. 表やフォーム要素の初期化
デフォルトでは、width と height に padding や border が含まれない挙動を変更し、サイズ指定を意図通りに管理するため。

- 対象要素: 全要素（特にフォーム要素）

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```
## 6. 表やフォーム要素の初期化

テーブルやフォーム要素（例: input, button, textarea, select）のデフォルトスタイルはブラウザごとに異なるため、統一が必要です。

- 対象要素: table, th, td, fieldset, legend, button, input, textarea, select

```css
table {
  border-collapse: collapse;
  border-spacing: 0;
}
button, input, textarea, select {
  margin: 0;
  font: inherit;
  color: inherit;
}
```

## 7. 行間のリセット
ブラウザ固有の line-height が異なるため。

```css
body {
  line-height: 1.0;
}
```



## 8. デフォルトのフォントスタイルの統一
各ブラウザのデフォルトフォントやサイズを統一するため。

```css
body {
  font-family: sans-serif;
  font-size: 100%;
}
```

## 9. box-sizing の統一
デフォルトでは、width と height に padding や border が含まれない挙動を変更し、サイズ指定を意図通りに管理するため。

- 対象要素: 全要素（特にフォーム要素）

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

## 10. 見出し要素のリセット
各ブラウザで異なる見出し要素（例: h1, h2）のデフォルトサイズや余白を統一するため。

```css
h1, h2, h3, h4, h5, h6 {
  font-size: inherit;
  font-weight: inherit;
}
```

## リセットCSS例

以下は、業界標準的なリセットCSSを参考にした、総合的なリセット例です

```css
/* リセットCSS */
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

/* HTML5 要素のリセット */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
  display: block;
}

/* テーブル要素のリセット */
table {
  border-collapse: collapse;
  border-spacing: 0;
}
```