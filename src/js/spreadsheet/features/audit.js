SocialCalc.SpreadsheetControlAuditOnclick = function(s, t) {
   var SCLoc = SocialCalc.LocalizeString;
   var i, j;
   var str = '<table cellspacing="0" cellpadding="0" style="margin-bottom:10px;"><tr><td style="font-size:small;padding:6px;"><b>'+SCLoc("Audit Trail This Session")+':</b><br><br>';
   var stack = s.sheet.changes.stack;
   var tos = s.sheet.changes.tos;
   for (i=0; i<stack.length; i++) {
      if (i==tos+1) str += '<br></td></tr><tr><td style="font-size:small;background-color:#EEE;padding:6px;">'+SCLoc("UNDONE STEPS")+':<br>';
      for (j=0; j<stack[i].command.length; j++) {
         str += SocialCalc.special_chars(stack[i].command[j]) + "<br>";
      }
   }
   var ObjToSource = function(o){
     if (typeof(o) == "string") return o;
     if (!o) return 'null';
     if (typeof(o) == "object") {
       if (!ObjToSource.check) ObjToSource.check = new Array();
       for (var i=0, k=ObjToSource.check.length ; i<k ; ++i) {
         if (ObjToSource.check[i] == o) {return '{}';}
       }
       ObjToSource.check.push(o);
     }
     var k="",na=typeof(o.length)=="undefined"?1:0,str="";
     for(var p in o){
       if (na) k = "'"+p+ "':";
       if (typeof o[p] == "string") str += k + "'" + o[p]+"',";
       else if (typeof o[p] == "object") str += k + ObjToSource(o[p])+",";
       else str += k + o[p] + ",";
     }
     if (typeof(o) == "object") ObjToSource.check.pop();
     if (na) return "{"+str.slice(0,-1)+"}";
     else return "["+str.slice(0,-1)+"]";
   }

   if(typeof SocialCalc.debug_log != 'undefined') {
     for(var index in SocialCalc.debug_log) {
       str += ObjToSource(SocialCalc.debug_log[index]) + "<br>";
     }
   }

   s.$container.find('.panel[name=audit]').html(str+"</td></tr></table>");
   SocialCalc.CmdGotFocus(true);
}