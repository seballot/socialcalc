//
// str = SocialCalc.EditorGetStatuslineString(editor, status, arg, params)
//
// Assumes params is an object where it can use "calculating" and "command"
// to keep track of state.
// Returns string for status line.
//

SocialCalc.EditorGetStatuslineString = function(editor, status, arg, params) {

   var scc = SocialCalc.Constants;

   var sstr, progress, coord, circ, r, c, cell, sum, ele;

   progress = "";

   switch (status) {
      case "moveecell":
      case "rangechange":
      case "startup":
         break;
      case "cmdstart":
         params.command = true;
         document.body.style.cursor = "progress";
         editor.griddiv.style.cursor = "progress";
         progress = scc.s_statusline_executing;
         break;
      case "cmdextension":
         progress = "Command Extension: "+arg;
         break;
      case "cmdend":
         params.command = false;
         break;
      case "schedrender":
         progress = ""; // scc.s_statusline_displaying;
         break;
      case "renderdone":
         progress = " ";
         break;
      case "schedposcalc":
         progress = ""; //scc.s_statusline_displaying;
         break;
      case "cmdendnorender":
      case "doneposcalc":
         document.body.style.cursor = "default";
         editor.griddiv.style.cursor = "default";
         // all updates done, So let future event clear the "sent" message in the status bar
         if(params.emailing == "sent") {
           progress = params.emailreponse;
           params.emailreponse = "";
           params.emailing = "done";
         }
         break;
      case "calcorder":
         progress = scc.s_statusline_ordering+Math.floor(100*arg.count/(arg.total||1))+"%";
         break;
      case "calcstep":
         progress = scc.s_statusline_calculating+Math.floor(100*arg.count/(arg.total||1))+"%";
         break;
      case "calcloading":
         progress = scc.s_statusline_calculatingls+": "+arg.sheetname;
         break;
      case "calcserverfunc":
         progress = scc.s_statusline_calculating+Math.floor(100*arg.count/(arg.total||1))+"%, "+scc.s_statusline_doingserverfunc+arg.funcname+scc.s_statusline_incell+arg.coord;
         break;
      case "calcstart":
         params.calculating = true;
         document.body.style.cursor = "progress";
         editor.griddiv.style.cursor = "progress"; // griddiv has an explicit cursor style
         progress = scc.s_statusline_calcstart;
         break;
      case "calccheckdone":
         break;
      case "calcfinished":
         params.calculating = false;
         break;
      case "emailing":
       params.emailing = "sending";
       params.emailreponse ="";
         break;
      case "confirmemailsent":
        params.emailing = "sent";
        if(typeof params.emailreponse === 'undefined') params.emailreponse ="";
        params.emailreponse += arg;
         break;
      default:
         progress = status;
         break;
   }

   // if send email then update status bar with "sending" and then "sent"
   if(params.emailing == "sending") {
     progress += scc.s_statusline_sendemail;
   }
   if(params.emailing == "sent") {
     progress += params.emailreponse;
   }

   if (!progress && params.calculating) {
      progress = scc.s_statusline_calculating;
   }

   // if there is a range, calculate sum (not during busy times)
   if (!params.calculating && !params.command && !progress && editor.range.hasrange
       && (editor.range.left!=editor.range.right || editor.range.top!=editor.range.bottom)) {
      sum = 0;
      for (r=editor.range.top; r <= editor.range.bottom; r++) {
         for (c=editor.range.left; c <= editor.range.right; c++) {
            cell = editor.context.sheetobj.cells[SocialCalc.crToCoord(c, r)];
            if (!cell) continue;
            if (cell.valuetype && cell.valuetype.charAt(0)=="n") {
               sum += cell.datavalue-0;
            }
         }
      }

      sum = SocialCalc.FormatNumber.formatNumberWithFormat(sum, "[,]General", "");

      coord = SocialCalc.crToCoord(editor.range.left, editor.range.top) + ":" +
         SocialCalc.crToCoord(editor.range.right, editor.range.bottom);
      progress = coord + " (" + (editor.range.right-editor.range.left+1) + "x" + (editor.range.bottom-editor.range.top+1) +
                 ") "+scc.s_statusline_sum+"=" + sum + " " + progress;
   }
   sstr = (editor.ecell || {}).coord;
   if (progress) sstr += " | "+progress;

   if (!params.calculating && editor.context.sheetobj.attribs.needsrecalc=="yes") {
      sstr += ' &nbsp; '+scc.s_statusline_recalcneeded;
   }

   circ = editor.context.sheetobj.attribs.circularreferencecell;
   if (circ) {
      circ = circ.replace(/\|/, " referenced by ");
      sstr += ' &nbsp; '+scc.s_statusline_circref + circ + '</span>';
   }
   sstr += "";
   return sstr;
}