//*
//
// Sheet save format:
//
// linetype:param1:param2:...
//
// Linetypes are:
//
//    version:versionname - version of this format. Currently 1.5.
//
//    cell:coord:type:value...:type:value... - Types are as follows:
//
//       v:value - straight numeric value
//       t:value - straight text/wiki-text in cell, encoded to handle \, :, newlines
//       vt:fulltype:value - value with value type/subtype
//       vtf:fulltype:value:formulatext - formula resulting in value with value type/subtype, value and text encoded
//       vtc:fulltype:value:valuetext - formatted text constant resulting in value with value type/subtype, value and text encoded
//       vf:fvalue:formulatext - formula resulting in value, value and text encoded (obsolete: only pre format version 1.1)
//          fvalue - first char is "N" for numeric value, "T" for text value, "H" for HTML value, rest is the value
//       e:errortext - Error text. Non-blank means formula parsing/calculation results in error.
//       b:topborder#:rightborder#:bottomborder#:leftborder# - border# in sheet border list or blank if none
//       l:layout# - number in cell layout list
//       f:font# - number in sheet fonts list
//       c:color# - sheet color list index for text
//       bg:color# - sheet color list index for background color
//       cf:format# - sheet cell format number for explicit format (align:left, etc.)
//       cvf:valueformat# - sheet cell value format number (obsolete: only pre format v1.2)
//       tvf:valueformat# - sheet cell text value format number
//       ntvf:valueformat# - sheet cell non-text value format number
//       colspan:numcols - number of columns spanned in merged cell
//       rowspan:numrows - number of rows spanned in merged cell
//       cssc:classname - name of CSS class to be used for cell when published instead of one calculated here
//       csss:styletext - explicit CSS style information, encoded to handle :, etc.
//       mod:allow - if "y" allow modification of cell for live "view" recalc
//       comment:value - encoded text of comment for this cell (added in v1.5)
//
//    col:
//       w:widthval - number, "auto" (no width in <col> tag), number%, or blank (use default)
//       hide: - yes/no, no is assumed if missing
//    row:
//       hide - yes/no, no is assumed if missing
//
//    sheet:
//       c:lastcol - number
//       r:lastrow - number
//       w:defaultcolwidth - number, "auto", number%, or blank (default->80)
//       h:defaultrowheight - not used
//       tf:format# - cell format number for sheet default for text values
//       ntf:format# - cell format number for sheet default for non-text values (i.e., numbers)
//       layout:layout# - default cell layout number in cell layout list
//       font:font# - default font number in sheet font list
//       vf:valueformat# - default number value format number in sheet valueformat list (obsolete: only pre format version 1.2)
//       ntvf:valueformat# - default non-text (number) value format number in sheet valueformat list
//       tvf:valueformat# - default text value format number in sheet valueformat list
//       color:color# - default number for text color in sheet color list
//       bgcolor:color# - default number for background color in sheet color list
//       circularreferencecell:coord - cell coord with a circular reference
//       recalc:value - on/off (on is default). If not "off", appropriate changes to the sheet cause a recalc
//       needsrecalc:value - yes/no (no is default). If "yes", formula values are not up to date
//       usermaxcol:value - maximum column to display, 0 for unlimited (default=0)
//       usermaxrow:value - maximum row to display, 0 for unlimited (default=0)
//
//    name:name:description:value - name definition, name in uppercase, with value being "B5", "A1:B7", or "=formula";
//                                  description and value are encoded.
//    font:fontnum:value - text of font definition (style weight size family) for font fontnum
//                         "*" for "style weight", size, or family, means use default (first look to sheet, then builtin)
//    color:colornum:rgbvalue - text of color definition (e.g., rgb(255,255,255)) for color colornum
//    border:bordernum:value - text of border definition (thickness style color) for border bordernum
//    layout:layoutnum:value - text of vertical alignment and padding style for cell layout layoutnum (* for default):
//                             vertical-alignment:vavalue;padding:topval rightval bottomval leftval;
//    cellformat:cformatnum:value - text of cell alignment (left/center/right) for cellformat cformatnum
//    valueformat:vformatnum:value - text of number format (see FormatValueForDisplay) for valueformat vformatnum (changed in v1.2)
//    clipboardrange:upperleftcoord:bottomrightcoord - ignored -- from wikiCalc
//    clipboard:coord:type:value:... - ignored -- from wikiCalc
//
// If this is clipboard contents, then there is also information to facilitate pasting:
//
//    copiedfrom:upperleftcoord:bottomrightcoord - range from which this was copied
//

// Functions:

SocialCalc.ParseSheetSave = function(savedsheet,sheetobj) {

   var lines=savedsheet.split(/\r\n|\n/);
   var parts=[];
   var line;
   var i, j, t, v, coord, cell, attribs, name;
   var scc = SocialCalc.Constants;

   for (i=0;i<lines.length;i++) {
      line=lines[i];
      parts = line.split(":");
      switch (parts[0]) {
         case "cell":
            cell=sheetobj.GetAssuredCell(parts[1]);
            j=2;
            sheetobj.CellFromStringParts(cell, parts, j);
            break;

         case "col":
            coord=parts[1];
            j=2;
            while (t=parts[j++]) {
               switch (t) {
                  case "w":
                     sheetobj.colattribs.width[coord]=parts[j++]; // must be text - could be auto or %, etc.
                     break;
                  case "hide":
                     sheetobj.colattribs.hide[coord]=parts[j++];
                     break;
                  default:
                     throw scc.s_pssUnknownColType+" '"+t+"'";
                     break;
               }
            }
            break;

         case "row":
            coord=parts[1]-0;
            j=2;
            while (t=parts[j++]) {
               switch (t) {
                  case "h":
                     sheetobj.rowattribs.height[coord]=parts[j++]-0;
                     break;
                  case "hide":
                     sheetobj.rowattribs.hide[coord]=parts[j++];
                     break;
                  default:
                     throw scc.s_pssUnknownRowType+" '"+t+"'";
                     break;
               }
            }
            break;

         case "sheet":
            attribs=sheetobj.attribs;
            j=1;
            while (t=parts[j++]) {
               switch (t) {
                  case "c":
                     attribs.lastcol=parts[j++]-0;
                     break;
                  case "r":
                     attribs.lastrow=parts[j++]-0;
                     break;
                  case "w":
                     attribs.defaultcolwidth=parts[j++]+"";
                     break;
                  case "h":
                     attribs.defaultrowheight=parts[j++]-0;
                     break;
                  case "tf":
                     attribs.defaulttextformat=parts[j++]-0;
                     break;
                  case "ntf":
                     attribs.defaultnontextformat=parts[j++]-0;
                     break;
                  case "tvf":
                     attribs.defaulttextvalueformat=parts[j++]-0;
                     break;
                  case "ntvf":
                     attribs.defaultnontextvalueformat=parts[j++]-0;
                     break;

                  // TODO use a style object property instead just like for cells
                  case "layout":
                     attribs.defaultlayout=parts[j++]-0;
                     break;
                  case "font":
                     attribs.defaultfont=parts[j++]-0;
                     break;
                  case "color":
                     attribs.defaultcolor=parts[j++]-0;
                     break;
                  case "bgcolor":
                     attribs.defaultbgcolor=parts[j++]-0;
                     break;

                  case "circularreferencecell":
                     attribs.circularreferencecell=parts[j++];
                     break;
                  case "recalc":
                     attribs.recalc=parts[j++];
                     break;
                  case "needsrecalc":
                     attribs.needsrecalc=parts[j++];
                     break;
                  case "usermaxcol":
                     attribs.usermaxcol=parts[j++]-0;
                     break;
                  case "usermaxrow":
                     attribs.usermaxrow=parts[j++]-0;
                     break;
                  default:
                     j+=1;
                     break;
               }
            }
            break;

         case "name":
            name = SocialCalc.decodeFromSave(parts[1]).toUpperCase();
            sheetobj.names[name] = {desc: SocialCalc.decodeFromSave(parts[2])};
            sheetobj.names[name].definition = SocialCalc.decodeFromSave(parts[3]);
            break;

         // Following are no more used for saving since 1.6. We are still using them for backward compatibility
         case "layout":
            parts=lines[i].match(/^layout\:(\d+)\:(.+)$/); // layouts can have ":" in them
            sheetobj.layouts[parts[1]-0]=parts[2];
            sheetobj.layouthash[parts[2]]=parts[1]-0;
            break;

         case "font":
            sheetobj.fonts[parts[1]-0]=parts[2];
            sheetobj.fonthash[parts[2]]=parts[1]-0;
            break;

         case "color":
            sheetobj.colors[parts[1]-0]=parts[2];
            sheetobj.colorhash[parts[2]]=parts[1]-0;
            break;

         case "border":
            sheetobj.borderstyles[parts[1]-0]=parts[2];
            sheetobj.borderstylehash[parts[2]]=parts[1]-0;
            break;

         case "cellformat":
            v=SocialCalc.decodeFromSave(parts[2]);
            sheetobj.cellformats[parts[1]-0]=v;
            sheetobj.cellformathash[v]=parts[1]-0;
            break;
         // end of backward compatibility

         case "style":
            sheetobj.styles[parts[1]-0] = JSON.parse(SocialCalc.decodeFromSave(parts[2]));
            sheetobj.stylehash[parts[2]] = parts[1]-0;
            break;

         case "valueformat":
            v=SocialCalc.decodeFromSave(parts[2]);
            sheetobj.valueformats[parts[1]-0]=v;
            sheetobj.valueformathash[v]=parts[1]-0;
            break;

         case "version":
            break;

         case "copiedfrom":
            sheetobj.copiedfrom = parts[1]+":"+parts[2];
            break;

         case "clipboardrange": // in save versions up to 1.3. Ignored.
         case "clipboard":
            break;

         case "":
            break;

         default:
            alert(scc.s_pssUnknownLineType+" '"+parts[0]+"'");
            throw scc.s_pssUnknownLineType+" '"+parts[0]+"'";
            break;
      }
      parts = null;
   }

   // Update cell styles, using backward compatibilty with old way of saving styling
   for(var cellCoord in sheetobj.cells) {
      var cell = sheetobj.cells[cellCoord];
      cell.style = sheetobj.styles[cell.styleId]
      if (cell.bt) cell.style['border-top']    = sheetobj.borderstyles[cell.bt];
      if (cell.br) cell.style['border-right']  = sheetobj.borderstyles[cell.br];
      if (cell.bb) cell.style['border-bottom'] = sheetobj.borderstyles[cell.bb];
      if (cell.bl) cell.style['border-left']   = sheetobj.borderstyles[cell.bl];
      if (cell.color) cell.styles['color']     = sheetobj.colors[cell.color];
      if (cell.bgcolor) cell.styles['background-color'] = sheetobj.colors[cell.color];
      if (cell.cellformat) cell.styles['text-align']    = sheetobj.colors[cell.cellformat];
      if (cell.font) {
         var fontParts = sheetobj.fonts[cell.font].split(' ');
         if (fontParts[2] != "*") cell.styles['font-size'] = fontParts[2];
         if (font.search('bold')) cell.styles['font-weight'] = "bold";
         if (font.search('italic')) cell.styles['font-style'] = "italic";
      }
      if (cell.layout) {
         var result = /vertical-align:(\w+);/g.exec(sheetobj.layouts[cell.layout]);
         if (result) cell.style["vertical-align"] = result[1];
      }
   }

}