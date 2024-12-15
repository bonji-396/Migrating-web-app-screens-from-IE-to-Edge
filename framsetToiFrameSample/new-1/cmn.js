function togglePanel() {
  const leftPanel = document.getElementById('leftFrame');
  const button = document.querySelector('#rightFrame iframe').contentWindow.document.querySelector('input[type="button"]');
  
  if (button.value === "<<") {
      leftPanel.style.width = "0";
      button.value = ">>";
  } else {
      leftPanel.style.width = "30%";
      button.value = "<<";
  }
}

// DOMContentLoadedイベントでiframeのロードを待つ
document.addEventListener('DOMContentLoaded', function() {
  const rightFrame = document.querySelector('#rightFrame iframe');
  rightFrame.addEventListener('load', function() {
      // iframeがロードされた後の初期化処理をここに書くことができます
      console.log('iframes loaded');
  });
});