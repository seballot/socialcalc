SocialCalc.InputConstants = { // strings that turn into constants for SocialCalc.DetermineValueType
      "TRUE": "1,nl", "FALSE": "0,nl", "#N/A": "0,e#N/A", "#NULL!": "0,e#NULL!", "#NUM!": "0,e#NUM!",
      "#DIV/0!": "0,e#DIV/0!", "#VALUE!": "0,e#VALUE!", "#REF!": "0,e#REF!", "#NAME?": "0,e#NAME?"};

//
// result = default_expand_markup(displayvalue, sheetobj, linkstyle)
//
// Processes wiki-text -- this is a placeholder.
// Reference to here in SocialCalc.expand_markup should be replaced by application-specific routine.
//

SocialCalc.default_expand_markup = function(displayvalue, sheetobj, linkstyle) {

   var result = displayvalue;

   result = SocialCalc.special_chars(result); // do special chars
   result = result.replace(/  /g, "&nbsp; "); // keep multiple spaces
   result = result.replace(/\n/g, "<br>"); // keep line breaks

   return result; // do very little by default

   result = result.replace(/('*)'''(.*?)'''/g, "$1<b>$2<\/b>"); // Wiki-style bold/italics
   result = result.replace(/''(.*?)''/g, "<i>$1<\/i>");

   return result;

   }


//
// result = SocialCalc.expand_text_link(displayvalue, sheetobj, linkstyle, valueformat)
//
// Parses link text (URL, descriptions, pagenames, workspace names) and returns HTML
//

SocialCalc.expand_text_link = function(displayvalue, sheetobj, linkstyle, valueformat) {

   var desc, tb, str;

   var scc = SocialCalc.Constants;

   var url = "";
   var parts = SocialCalc.ParseCellLinkText(displayvalue+"");

   if (parts.desc) {
      desc = SocialCalc.special_chars(parts.desc);
      }
   else {
      desc = parts.pagename ? scc.defaultPageLinkFormatString : scc.defaultLinkFormatString;
      }

   if (displayvalue.length > 7 && displayvalue.substring(0,7).toLowerCase()=="http://"
      && displayvalue.charAt(displayvalue.length-1)!=">") {
      desc = desc.substring(7); // remove http:// unless explicit
      }

   tb = (parts.newwin || !linkstyle) ? ' target="_blank"' : "";

   if (parts.pagename) {
      if (SocialCalc.Callbacks.MakePageLink) {
         url = SocialCalc.Callbacks.MakePageLink(parts.pagename, parts.workspacename, linkstyle, valueformat);
         }
//      else if (parts.workspace) {
//         url = "/" + encodeURI(parts.workspace) + "/" + encodeURI(parts.pagename);
//         }
//      else {
//         url = parts.pagename;
//         }
      }
   else {
      url = encodeURI(parts.url);
      }
   str = '<a href="' + url + '"' + tb + '>' + desc + '</a>';

   return str;

   }