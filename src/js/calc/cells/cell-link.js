//
// result = SocialCalc.ParseCellLinkText(str)
//
// Given: url = http://www.someurl.com/more, desc = Some descriptive text
//
// Takes the following:
//
//    url
//    <url>
//    desc<url>
//    "desc"<url>
//    <<>> instead of <> => target="_blank" (new window)
//
//    [page name]
//    "desc"[page name]
//    desc[page name]
//    {workspace name [page name]}
//    "desc"{workspace name [page name]}
//    [[]] instead of [] => target="_blank" (new window)
//
//
// Returns: {url: url, desc: desc, newwin: t/f, pagename: pagename, workspace: workspace}
//

SocialCalc.ParseCellLinkText = function(str) {

   var result = {url: "", desc: "", newwin: false, pagename: "", workspace: ""};

   var pageform = false;
   var urlend = str.length - 1;
   var descstart = 0;
   var lastlt = str.lastIndexOf("<");
   var lastbrkt = str.lastIndexOf("[");
   var lastbrace = str.lastIndexOf("{");
   var descend = -1;

   if ((str.charAt(urlend) != ">" || lastlt == -1)
         && (str.charAt(urlend) != "]" || lastbrkt == -1)
         && (str.charAt(urlend) != "}" || str.charAt(urlend-1) != "]" ||
             lastbrace == -1 || lastbrkt == -1 || lastbrkt < lastbrace)) { // plain url
      urlend++;
      descend = urlend;
   }
   else { // some markup
      if (str.charAt(urlend)==">") { // url form
         descend = lastlt - 1;
         if (lastlt > 0 && str.charAt(descend) == "<" && str.charAt(urlend-1) == ">") {
            descend--;
            urlend--;
            result.newwin = true;
         }
      }

      else if (str.charAt(urlend)=="]") { // plain page form
         descend = lastbrkt - 1;
         pageform = true;
         if (lastbrkt > 0 && str.charAt(descend) == "[" && str.charAt(urlend-1) == "]") {
            descend--;
            urlend--;
            result.newwin = true;
         }
      }

      else if (str.charAt(urlend)=="}") { // page and workspace form
         descend = lastbrace - 1;
         pageform = true;
         wsend = lastbrkt;
         urlend--;
         if (lastbrkt > 0 && str.charAt(lastbrkt-1) == "[" && str.charAt(urlend-1) == "]") {
            wsend = lastbrkt-1;
            urlend--;
            result.newwin = true;
         }
         if (str.charAt(wsend-1)==" ") { // trim trailing space in workspace name
            wsend--;
         }
         result.workspace = str.substring(lastbrace+1, wsend) || "";
      }

      if (str.charAt(descend)==" ") { // trim trailing space on desc
         descend--;
      }

      if (str.charAt(descstart) == '"' && str.charAt(descend) == '"') {
         descstart++;
         descend--;
      }
   }

   if (pageform) {
      result.pagename = str.substring(lastbrkt+1, urlend) || "";
   }
   else {
      result.url = str.substring(lastlt+1, urlend) || "";
   }

   if (descend >= descstart) {
      result.desc = str.substring(descstart, descend+1);
   }

   return result;

}