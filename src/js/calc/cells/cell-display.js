//
// Routines translated from the SocialCalc 1.1.0 Perl code:
//
// (Makes use of the FormatNumber JavaScript code translated from the Perl.)
//

//
// displayvalue = FormatValueForDisplay(sheetobj, value, cr, linkstyle)
//
// Returns a string, in HTML, for the contents of a cell.
//
// The value is a either numeric or text, the cr is the coord of the cell
// (its cell properties are used to determine formatting), and linkstyle
// is a value passed to wiki-text expansion routines specifying the
// purpose of the rendering so, for example, links can be rendered differently
// during edit than with plain HTML.
//

SocialCalc.FormatValueForDisplay = function(sheetobj, value, cr, linkstyle) {

   var valueformat, has_parens, has_commas, valuetype, valuesubtype;
   var displayvalue;

   var sheetattribs=sheetobj.attribs;
   var scc=SocialCalc.Constants;

   var cell=sheetobj.cells[cr];

   if (!cell) { // get an empty cell if not there
      cell=new SocialCalc.Cell(cr);
   }

   displayvalue = value;

   valuetype = cell.valuetype || ""; // get type of value to determine formatting
   valuesubtype = valuetype.substring(1);

   // eddy setup display cell {
   valueinputwidget = valuetype.charAt(1);
   var formula_name= valuetype.substring(2);
   var html_display_value = null;
   var html_formated_value = null;
   // }

   valuetype = valuetype.charAt(0);


   if (cell.errors || valuetype=="e") {
      displayvalue = cell.errors || valuesubtype || "Error in cell";
      return displayvalue;
   }

   if (valuetype=="t") {
      valueformat = sheetobj.valueformats[cell.textvalueformat-0] || sheetobj.valueformats[sheetattribs.defaulttextvalueformat-0] || "";
      if (valueformat=="formula") {
         if (cell.datatype=="f") {
            displayvalue = SocialCalc.special_chars("="+cell.formula) || "&nbsp;";
         }
         else if (cell.datatype=="c") {
            displayvalue = SocialCalc.special_chars("'"+cell.formula) || "&nbsp;";
         }
         else {
            displayvalue = SocialCalc.special_chars("'"+displayvalue) || "&nbsp;";
         }
         return displayvalue;
      }
    var html_display_value = displayvalue; // eddy
      displayvalue = SocialCalc.format_text_for_display(displayvalue, cell.valuetype, valueformat, sheetobj, linkstyle, cell.nontextvalueformat);
    var html_formated_value = displayvalue; // eddy

   }

   else if (valuetype=="n") {
      valueformat = cell.nontextvalueformat;
      if (valueformat==null || valueformat=="") { //
         valueformat = sheetattribs.defaultnontextvalueformat;
      }
      valueformat = sheetobj.valueformats[valueformat-0];
      if (valueformat==null || valueformat=="none") {
         valueformat = "";
      }


      if (valueformat=="formula") {
         if (cell.datatype=="f") {
            displayvalue = SocialCalc.special_chars("="+cell.formula) || "&nbsp;";
         }
         else if (cell.datatype=="c") {
            displayvalue = SocialCalc.special_chars("'"+cell.formula) || "&nbsp;";
         }
         else {
            displayvalue = SocialCalc.special_chars("'"+displayvalue) || "&nbsp;";
         }
         return displayvalue;
      }
      else if (valueformat=="forcetext") {
         if (cell.datatype=="f") {
            displayvalue = SocialCalc.special_chars("="+cell.formula) || "&nbsp;";
         }
         else if (cell.datatype=="c") {
            displayvalue = SocialCalc.special_chars(cell.formula) || "&nbsp;";
         }
         else {
            displayvalue = SocialCalc.special_chars(displayvalue) || "&nbsp;";
         }
         return displayvalue;
      }

    var html_display_value = displayvalue; // eddy
      displayvalue = SocialCalc.format_number_for_display(displayvalue, cell.valuetype, valueformat);
    var html_formated_value = displayvalue; // eddy

   }
   else { // unknown type - probably blank
      displayvalue = "&nbsp;";
   }


   // eddy display cell HTML {
   if(valueinputwidget=="i" && html_display_value!=null && html_formated_value!=null) {
     var parameters = sheetobj.ioParameterList[cr];

     var formula_details = SocialCalc.Formula.FunctionList[formula_name];
//   var ecell = SocialCalc.GetSpreadsheetControlObject().editor.ecell; // check if widget has focus
//   SocialCalc.GetSpreadsheetControlObject().debug.push({formula_name:formula_name});
     if( formula_details) {
       var cell_html = formula_details[5];
       // var cell_html = "<button type='button' onclick=\"SocialCalc.TriggerIoAction('<%=cell_reference%>');\"><%=display_value%></button>";

       var checkedValue = (html_display_value == 0) ? "" : "checked"; // for checkbox
       cell_html = cell_html.replace(/<%=checked%>/g, checkedValue);
       cell_html = cell_html.replace(/<%=formated_value%>/g, html_formated_value);
       cell_html = cell_html.replace(/<%=display_value%>/g, html_display_value);
       // replace widget HTML with parameter
       // FOR each parameter
       var parameterValue; // set to value of param for if coord, value of cell
       if(parameters) {
         // add forumla parameters to widget html
         for(var index=0; index < parameters.length; index ++) {
           // IF coord THEN replace with cell value
           if(parameters[index].type == 'coord') {
             parameterValue = sheetobj.GetAssuredCell(parameters[index].value).datavalue;
        } else {
             // ELSE with param value
             parameterValue = parameters[index].value;
        }
           var paramRegExp = new RegExp("<%=parameter"+index+"_value%>",'g');
           cell_html = cell_html.replace(paramRegExp, parameterValue);
      }
         if(parameters.html) { // add html created in formula1.js to widget
           for(var htmlIndex=0; htmlIndex < parameters.html.length; htmlIndex ++) {
             var paramRegExp = new RegExp("<%=html"+htmlIndex+"_value%>",'g');
             cell_html = cell_html.replace(paramRegExp, parameters.html[htmlIndex]);
        }
      }
         if(parameters.css) { // add style(css) formula css value, if any - e.g. =textbox("")+style("margin: 8px 0;")
           // * RegEx Unit Test **  https://regex101.com/r/oV7wU5/2
           cell_html = cell_html.replace(/^(<\w+)(\W)/, "$1 style='"+parameters.css+ "'$2");
      }

    }

       return cell_html.replace(/<%=cell_reference%>/g, cr);
    }
     return "error:Widget HTML missing";
}
   // }



   return displayvalue;

}



//
// displayvalue = format_text_for_display(rawvalue, valuetype, valueformat, sheetobj, linkstyle, nontextvalueformat)
//

SocialCalc.format_text_for_display = function(rawvalue, valuetype, valueformat, sheetobj, linkstyle, nontextvalueformat) {

   var valueformat, valuesubtype, dvsc, dvue, textval;
   var displayvalue;

   valuesubtype = valuetype.substring(1);

   displayvalue = rawvalue;

   if (valueformat=="none" || valueformat==null) valueformat="";
   if (!/^(text-|custom|hidden)/.test(valueformat)) valueformat="";
   if (valueformat=="" || valueformat=="General") { // determine format from type
      if (valuesubtype=="h") valueformat="text-html";
      if (valuesubtype=="w" || valuesubtype=="r") valueformat="text-wiki";
      if (valuesubtype=="l") valueformat="text-link";
      if (!valuesubtype) valueformat="text-plain";
   }
   if (valueformat=="text-html") { // HTML - output as it as is
      ;
   }
   else if (SocialCalc.Callbacks.expand_wiki && /^text-wiki/.test(valueformat)) { // do general wiki markup
      displayvalue = SocialCalc.Callbacks.expand_wiki(displayvalue, sheetobj, linkstyle, valueformat);
   }
   else if (valueformat=="text-wiki") { // wiki text
      displayvalue = (SocialCalc.Callbacks.expand_markup
                      && SocialCalc.Callbacks.expand_markup(displayvalue, sheetobj, linkstyle)) || // do old wiki markup
                     SocialCalc.special_chars("wiki-text:"+displayvalue);
   }
   else if (valueformat=="text-url") { // text is a URL for a link
      dvsc = SocialCalc.special_chars(displayvalue);
      dvue = encodeURI(displayvalue);
      displayvalue = '<a href="'+dvue+'">'+dvsc+'</a>';
   }
   else if (valueformat=="text-link") { // more extensive link capabilities for regular web links
      displayvalue = SocialCalc.expand_text_link(displayvalue, sheetobj, linkstyle, valueformat);
   }
   else if (valueformat=="text-image") { // text is a URL for an image
      dvue = encodeURI(displayvalue);
      displayvalue = '<img src="'+dvue+'">';
   }
   else if (valueformat.substring(0,12)=="text-custom:") { // construct a custom text format: @r = text raw, @s = special chars, @u = url encoded
      dvsc = SocialCalc.special_chars(displayvalue); // do special chars
      dvsc = dvsc.replace(/  /g, "&nbsp; "); // keep multiple spaces
      dvsc = dvsc.replace(/\n/g, "<br>");  // keep line breaks
      dvue = encodeURI(displayvalue);
      textval={};
      textval.r = displayvalue;
      textval.s = dvsc;
      textval.u = dvue;
      displayvalue = valueformat.substring(12); // remove "text-custom:"
      displayvalue = displayvalue.replace(/@(r|s|u)/g, function(a,c){return textval[c];}); // replace placeholders
   }
   else if (valueformat.substring(0,6)=="custom") { // custom
      displayvalue = SocialCalc.special_chars(displayvalue); // do special chars
      displayvalue = displayvalue.replace(/  /g, "&nbsp; "); // keep multiple spaces
      displayvalue = displayvalue.replace(/\n/g, "<br>"); // keep line breaks
      displayvalue += " (custom format)";
   }
   else if (valueformat=="hidden") {
      displayvalue = "&nbsp;";
   }
   else if (nontextvalueformat != null && nontextvalueformat != "" && sheetobj.valueformats[nontextvalueformat-0] != "none" && sheetobj.valueformats[nontextvalueformat-0] != "" ) {
      valueformat = sheetobj.valueformats[nontextvalueformat];
      displayvalue = SocialCalc.format_number_for_display(rawvalue, valuetype, valueformat);
   }
   else { // plain text
      displayvalue = SocialCalc.special_chars(displayvalue); // do special chars
      displayvalue = displayvalue.replace(/  /g, "&nbsp; "); // keep multiple spaces
      displayvalue = displayvalue.replace(/\n/g, "<br>"); // keep line breaks
   }

   return displayvalue;

}


//
// displayvalue = format_number_for_display(rawvalue, valuetype, valueformat)
//

SocialCalc.format_number_for_display = function(rawvalue, valuetype, valueformat) {

   var value, valuesubtype;
   var scc = SocialCalc.Constants;

   value = rawvalue-0;

   valuesubtype = valuetype.substring(1);

   if (valueformat=="Auto" || valueformat=="") { // cases with default format
      if (valuesubtype=="%") { // will display a % character
         valueformat = scc.defaultFormatp;
      }
      else if (valuesubtype=='$') {
         valueformat = scc.defaultFormatc;
      }
      else if (valuesubtype=='dt') {
         valueformat = scc.defaultFormatdt;
      }
      else if (valuesubtype=='d') {
         valueformat = scc.defaultFormatd;
      }
      else if (valuesubtype=='t') {
         valueformat = scc.defaultFormatt;
      }
      else if (valuesubtype=='l') {
         valueformat = 'logical';
      }
      else {
         valueformat = "General";
      }
   }

   if (valueformat=="logical") { // do logical format
      return value ? scc.defaultDisplayTRUE : scc.defaultDisplayFALSE;
   }

   if (valueformat=="hidden") { // do hidden format
      return "&nbsp;";
   }

   // Use format

   return SocialCalc.FormatNumber.formatNumberWithFormat(rawvalue, valueformat, "");

}

//
// valueinfo = DetermineValueType(rawvalue)
//
// Takes a value and looks for special formatting like $, %, numbers, etc.
// Returns the value as a number or string and the type as {value: value, type: type}.
// Tries to follow the spec for spreadsheet function VALUE(v).
//

SocialCalc.DetermineValueType = function(rawvalue) {

   var value = rawvalue + "";
   var type = "t";
   var tvalue, matches, year, hour, minute, second, denom, num, intgr, constr;

   tvalue = value.replace(/^\s+/, ""); // remove leading and trailing blanks
   tvalue = tvalue.replace(/\s+$/, "");

   if (value.length==0) {
      type = "";
   }
   else if (value.match(/^\s+$/)) { // just blanks
      ; // leave type "t"
   }
   else if (tvalue.match(/^[-+]?\d*(?:\.)?\d*(?:[eE][-+]?\d+)?$/)) { // general number, including E
      value = tvalue - 0; // try converting to number
      if (isNaN(value)) { // leave alone - catches things like plain "-"
         value = rawvalue + "";
      }
      else {
         type = "n";
      }
   }
   else if (tvalue.match(/^[-+]?\d*(?:\.)?\d*\s*%$/)) { // percent form: 15.1%
      value = (tvalue.slice(0, -1) - 0) / 100; // convert and scale
      type = "n%";
   }
   else if (tvalue.match(/^[-+]?\$\s*\d*(?:\.)?\d*\s*$/) && tvalue.match(/\d/)) { // $ format: $1.49
      value = tvalue.replace(/\$/, "") - 0;
      type = "n$";
   }
   else if (tvalue.match(/^[-+]?(\d*,\d*)+(?:\.)?\d*$/)) { // number format ignoring commas: 1,234.49
      value = tvalue.replace(/,/g, "") - 0;
      type = "n";
   }
   else if (tvalue.match(/^[-+]?(\d*,\d*)+(?:\.)?\d*\s*%$/)) { // % with commas: 1,234.49%
      value = (tvalue.replace(/[%,]/g, "") - 0) / 100;
      type = "n%";
   }
   else if (tvalue.match(/^[-+]?\$\s*(\d*,\d*)+(?:\.)?\d*$/) && tvalue.match(/\d/)) { // $ and commas: $1,234.49
      value = tvalue.replace(/[\$,]/g, "") - 0;
      type = "n$";
   }
   else if (matches=value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{1,4})\s*$/)) { // MM-DD-YYYY, MM/DD/YYYY
      year = matches[3] - 0;
      year = year < 1000 ? year + 2000 : year;
      value = ((navigator.language).indexOf("fr") === 0)  ? (SocialCalc.FormatNumber.convert_date_gregorian_to_julian(year, matches[2]-0, matches[1]-0)-2415019) : (SocialCalc.FormatNumber.convert_date_gregorian_to_julian(year, matches[1]-0, matches[2]-0)-2415019);
      type = "nd";
   }
   else if (matches=value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s*$/)) { // YYYY-MM-DD, YYYY/MM/DD
      year = matches[1]-0;
      year = year < 1000 ? year + 2000 : year;
      value = SocialCalc.FormatNumber.convert_date_gregorian_to_julian(year, matches[2]-0, matches[3]-0)-2415019;
      type = "nd";
   }
   else if (matches=value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2}) (\d{1,2}):(\d{1,2})\s*$/)) { // YYYY-MM-DD, YYYY/MM/DD HH:MM
     // eddy added YYYY-MM-DD, YYYY/MM/DD HH:MM
     year = matches[1]-0;
     year = year < 1000 ? year + 2000 : year;
     hour = matches[4]-0;
     minute = matches[5]-0;
     value = SocialCalc.FormatNumber.convert_date_gregorian_to_julian(year, matches[2]-0, matches[3]-0)-2415019;
     type = "nd";
     if (hour < 24 && minute < 60) {
       value += hour/24 + minute/(24*60);
       type = "ndt";
    }
  }
   else if (matches=value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})\s*$/)) { // YYYY-MM-DD, YYYY/MM/DD HH:MM:SS
     // eddy added YYYY-MM-DD, YYYY/MM/DD HH:MM:SS
     year = matches[1]-0;
     year = year < 1000 ? year + 2000 : year;
     hour = matches[4]-0;
     minute = matches[5]-0;
     second = matches[6]-0;
     value = SocialCalc.FormatNumber.convert_date_gregorian_to_julian(year, matches[2]-0, matches[3]-0)-2415019;
     type = "nd";
     if (hour < 24 && minute < 60 && second < 60) {
       value += hour/24 + minute/(24*60) + second/(24*60*60);
       type = "ndt";
    }
  }
   else if (matches=value.match(/^(\d{1,2}):(\d{1,2})\s*$/)) { // HH:MM
      hour = matches[1]-0;
      minute = matches[2]-0;
      if (hour < 24 && minute < 60) {
         value = hour/24 + minute/(24*60);
         type = "nt";
      }
   }
   else if (matches=value.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})\s*$/)) { // HH:MM:SS
      hour = matches[1]-0;
      minute = matches[2]-0;
      second = matches[3]-0;
      if (hour < 24 && minute < 60 && second < 60) {
         value = hour/24 + minute/(24*60) + second/(24*60*60);
         type = "nt";
      }
   }
   else if (matches=value.match(/^\s*([-+]?\d+) (\d+)\/(\d+)\s*$/)) { // 1 1/2
      intgr = matches[1]-0;
      num = matches[2]-0;
      denom = matches[3]-0;
      if (denom && denom > 0) {
         value = intgr + (intgr < 0 ? -num/denom : num/denom);
         type = "n";
      }
   }
   else if (constr=SocialCalc.InputConstants[value.toUpperCase()]) { // special constants, like "false" and #N/A
      num = constr.indexOf(",");
      value = constr.substring(0,num)-0;
      type = constr.substring(num+1);
   }
   else if (tvalue.length > 7 && tvalue.substring(0,7).toLowerCase()=="http://") { // URL
      value = tvalue;
      type = "tl";
   }
   else if (tvalue.match(/<([A-Z][A-Z0-9]*)\b[^>]*>[\s\S]*?<\/\1>/i)) { // HTML
      value = tvalue;
      type = "th";
   }

   return {value: value, type: type};

}