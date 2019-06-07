//
// SocialCalc.CellFromStringParts(sheet, cell, parts, j)
//
// Takes string that has been split by ":" in parts, starting at item j,
// and fills in cell assuming save format.
//

SocialCalc.CellFromStringParts = function(sheet, cell, parts, j) {

   var cell, t, v;

   while (t=parts[j++]) {
      switch (t) {
         case "v":
            cell.datavalue=SocialCalc.decodeFromSave(parts[j++])-0;
            cell.datatype="v";
            cell.valuetype="n";
            break;
         case "t":
            cell.datavalue=SocialCalc.decodeFromSave(parts[j++]);
            cell.datatype="t";
            cell.valuetype=SocialCalc.Constants.textdatadefaulttype;
            break;
         case "vt":
            v=parts[j++];
            cell.valuetype=v;
            if (v.charAt(0)=="n") {
               cell.datatype="v";
               cell.datavalue=SocialCalc.decodeFromSave(parts[j++])-0;
            }
            else {
               cell.datatype="t";
               cell.datavalue=SocialCalc.decodeFromSave(parts[j++]);
            }
            break;
         case "vtf":
            v=parts[j++];
            cell.valuetype=v;
            if (v.charAt(0)=="n") {
               cell.datavalue=SocialCalc.decodeFromSave(parts[j++])-0;
            }
            else {
               cell.datavalue=SocialCalc.decodeFromSave(parts[j++]);
            }
            cell.formula=SocialCalc.decodeFromSave(parts[j++]);
            cell.datatype="f";
            break;
         case "vtc":
            v=parts[j++];
            cell.valuetype=v;
            if (v.charAt(0)=="n") {
               cell.datavalue=SocialCalc.decodeFromSave(parts[j++])-0;
            }
            else {
               cell.datavalue=SocialCalc.decodeFromSave(parts[j++]);
            }
            cell.formula=SocialCalc.decodeFromSave(parts[j++]);
            cell.datatype="c";
            break;
         case "ro":
            ro=SocialCalc.decodeFromSave(parts[j++]);
            cell.readonly=ro.toLowerCase()=="yes";
            break;
         case "e":
            cell.errors=SocialCalc.decodeFromSave(parts[j++]);
            break;

         // Begin of backward compatibilty
         case "b":
            cell.bt=parts[j++]-0;
            cell.br=parts[j++]-0;
            cell.bb=parts[j++]-0;
            cell.bl=parts[j++]-0;
            break;
         case "l":
            cell.layout=parts[j++]-0;
            break;
         case "f":
            cell.font=parts[j++]-0;
            break;
         case "c":
            cell.color=parts[j++]-0;
            break;
         case "bg":
            cell.bgcolor=parts[j++]-0;
            break;
         case "cf":
            cell.cellformat=parts[j++]-0;
            break;
         // end of backward compatibilty

         case "s":
            cell.styleId=parts[j++]-0;
            break;
         case "ntvf":
            cell.nontextvalueformat=parts[j++]-0;
            break;
         case "tvf":
            cell.textvalueformat=parts[j++]-0;
            break;
         case "colspan":
            cell.colspan=parts[j++]-0;
            break;
         case "rowspan":
            cell.rowspan=parts[j++]-0;
            break;
         case "cssc":
            cell.cssc=parts[j++];
            break;
         case "csss":
            cell.csss=SocialCalc.decodeFromSave(parts[j++]);
            break;
         case "mod":
            j+=1;
            break;
         case "comment":
            cell.comment=SocialCalc.decodeFromSave(parts[j++]);
            break;
         default:
            throw SocialCalc.Constants.s_cfspUnknownCellType+" '"+t+"'";
            break;
      }
   }

}
