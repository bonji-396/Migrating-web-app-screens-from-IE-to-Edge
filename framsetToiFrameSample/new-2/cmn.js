function toggleFrameset() {
  var frm = document.getElementById('frm');
  var btn = window.parent.frames[1].document.querySelector('input[type="button"]');
  
  if (btn.value === "<<") {
      // Aフレームを非表示（幅0%）にする
      frm.cols = "0%, 100%";
      btn.value = ">>";
  } else {
      // Aフレームを表示（幅30%）に戻す
      frm.cols = "30%, 70%";
      btn.value = "<<";
  }
}