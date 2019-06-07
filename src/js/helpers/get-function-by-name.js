/**
* Returns the function that you want to execute through its name.
* It returns undefined if the function || property doesn't exists
*
* @param functionName {String}
* @param context {Object || null}
*/
SocialCalc.GetFunctionByName = function (functionName, context) {
   // If using Node.js, the context will be an empty object
   if (typeof(window) == "undefined") {
     context = context || global;
   } else{
     // U se the window (from browser) as context if none providen.
     context = context || window;
   }

   // Retrieve the namespaces of the function you want to execute
   // e.g Namespaces of "MyLib.UI.alerti" would be ["MyLib","UI"]
   var namespaces = functionName.split(".");

   // Retrieve the real name of the function i.e alerti
   var functionToExecute = namespaces.pop();

   // Iterate through every namespace to access the one that has the function
   // you want to execute. For example with the alert fn "MyLib.UI.SomeSub.alert"
   // Loop until context will be equal to SomeSub
   for (var i = 0; i < namespaces.length; i++) {
     context = context[namespaces[i]];
   }

   // If the context really exists (namespaces), return the function or property
   if (context){
     return context[functionToExecute];
   } else {
     return undefined;
   }
}