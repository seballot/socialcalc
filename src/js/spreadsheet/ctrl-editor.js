/**********************
*
* CtrlSEditor implementation for editing SocialCalc.OtherSaveParts
*
*/

SocialCalc.OtherSaveParts = {}; // holds other parts to save - must be set when loaded if you want to keep

SocialCalc.CtrlSEditor = function(whichpart) {

   var strtoedit, partname;
   if (whichpart.length > 0) {
      strtoedit = SocialCalc.special_chars(SocialCalc.OtherSaveParts[whichpart] || "");
   }
   else {
      strtoedit = "Listing of Parts\n";
      for (partname in SocialCalc.OtherSaveParts) {
         strtoedit += SocialCalc.special_chars("\nPart: "+partname+"\n=====\n"+SocialCalc.OtherSaveParts[partname]+"\n");
      }
   }
   var editbox = document.createElement("div");
   editbox.style.cssText = "position:absolute;z-index:500;width:300px;height:300px;left:100px;top:200px;border:1px solid black;background-color:#EEE;text-align:center;";
   editbox.id = "socialcalc-editbox";
   editbox.innerHTML = whichpart+'<br><br><textarea id="socialcalc-editbox-textarea" style="width:250px;height:200px;">'+
      strtoedit + '</textarea><br><br><input type=button ' +
      'onclick="SocialCalc.CtrlSEditorDone (\'socialcalc-editbox\', \''+whichpart+'\');" value="OK">';
   document.body.appendChild(editbox);

   var ebta = document.getElementById("socialcalc-editbox-textarea");
   ebta.focus();
   SocialCalc.CmdGotFocus(ebta);

}

SocialCalc.CtrlSEditorDone = function(idprefix, whichpart) {

   var edittextarea = document.getElementById(idprefix+"-textarea");
   var text = edittextarea.value;
   if (whichpart.length > 0) {
      if (text.length > 0) {
         SocialCalc.OtherSaveParts[whichpart] = text;
      }
      else {
         delete SocialCalc.OtherSaveParts[whichpart];
      }
   }

   var editbox = document.getElementById(idprefix);
   SocialCalc.KeyboardFocus();
   editbox.parentNode.removeChild(editbox);

}