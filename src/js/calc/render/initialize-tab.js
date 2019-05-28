SocialCalc.InitializeTable = function(context, tableobj) {

/*

Uses border-collapse so corners don't have holes
Note: IE and Firefox handle <col> differently (IE adds borders and padding)
under border-collapse and Safari has problems with <col> and wide text
Tablelayout "fixed" also leads to problems

*/

/*

*** Discussion ***

The rendering assumes fixed column widths, even though SocialCalc allows "auto".
There may be issues with "auto" and it is hard to make it work cross-browser
with border-collapse, etc.

This and the RenderSheet routine are where in the code the specifics of
table attributes and column size definitions are set. As the browsers settle down
and when we decide if we don't need auto width, we may want to revisit the way the
code does this (e.g., use table-layout:fixed).

*/
   tableobj.style.borderCollapse="collapse";
   tableobj.cellSpacing="0";
   tableobj.cellPadding="0";

   tableobj.style.width=context.totalwidth+"px";

   }