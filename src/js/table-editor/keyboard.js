// *************************************
//
// Keyboard functions:
//
// For more information about keyboard handling, see: http://unixpapa.com/js/key.html
//
// *************************************

SocialCalc.keyboardTables = {

   specialKeysCommon: {
      8: "[backspace]", 9: "[tab]", 13: "[enter]", 25: "[tab]", 27: "[esc]", 33: "[pgup]", 34: "[pgdn]",
      35: "[end]", 36: "[home]", 37: "[aleft]", 38: "[aup]", 39: "[aright]", 40: "[adown]", 45: "[ins]",
      46: "[del]", 113: "[f2]"
   },

   specialKeysIE: {
      8: "[backspace]", 9: "[tab]", 13: "[enter]", 25: "[tab]", 27: "[esc]", 33: "[pgup]", 34: "[pgdn]",
      35: "[end]", 36: "[home]", 37: "[aleft]", 38: "[aup]", 39: "[aright]", 40: "[adown]", 45: "[ins]",
      46: "[del]", 113: "[f2]"
   },

   controlKeysIE: {
      65: "[ctrl-a]",
      67: "[ctrl-c]",
      83: "[ctrl-s]",
      86: "[ctrl-v]",
      88: "[ctrl-x]",
      90: "[ctrl-z]"
   },

   specialKeysOpera: {
      8: "[backspace]", 9: "[tab]", 13: "[enter]", 25: "[tab]", 27: "[esc]", 33: "[pgup]", 34: "[pgdn]",
      35: "[end]", 36: "[home]", 37: "[aleft]", 38: "[aup]", 39: "[aright]", 40: "[adown]",
      45: "[ins]", // issues with releases before 9.5 - same as "-" ("-" changed in 9.5)
      46: "[del]", // issues with releases before 9.5 - same as "." ("." changed in 9.5)
      113: "[f2]"
   },

   controlKeysOpera: {
      65: "[ctrl-a]",
      67: "[ctrl-c]",
      83: "[ctrl-s]",
      86: "[ctrl-v]",
      88: "[ctrl-x]",
      90: "[ctrl-z]"
   },

   specialKeysSafari: {
      8: "[backspace]", 9: "[tab]", 13: "[enter]", 25: "[tab]", 27: "[esc]", 63232: "[aup]", 63233: "[adown]",
      63234: "[aleft]", 63235: "[aright]", 63272: "[del]", 63273: "[home]", 63275: "[end]", 63276: "[pgup]",
      63277: "[pgdn]", 63237: "[f2]"
   },

   controlKeysSafari: {
      97: "[ctrl-a]",
      99: "[ctrl-c]",
      115: "[ctrl-s]",
      118: "[ctrl-v]",
      120: "[ctrl-x]",
      122: "[ctrl-z]"
   },

   ignoreKeysSafari: {
      63236: "[f1]", 63238: "[f3]", 63239: "[f4]", 63240: "[f5]", 63241: "[f6]", 63242: "[f7]",
      63243: "[f8]", 63244: "[f9]", 63245: "[f10]", 63246: "[f11]", 63247: "[f12]", 63289: "[numlock]"
   },

   specialKeysFirefox: {
      8: "[backspace]", 9: "[tab]", 13: "[enter]", 25: "[tab]", 27: "[esc]", 33: "[pgup]", 34: "[pgdn]",
      35: "[end]", 36: "[home]", 37: "[aleft]", 38: "[aup]", 39: "[aright]", 40: "[adown]", 45: "[ins]",
      46: "[del]", 113: "[f2]"
   },

   controlKeysFirefox: {
      97: "[ctrl-a]",
      99: "[ctrl-c]",
      115: "[ctrl-s]",
      118: "[ctrl-v]",
      120: "[ctrl-x]",
      122: "[ctrl-z]"
   },

   ignoreKeysFirefox: {
      16: "[shift]", 17: "[ctrl]", 18: "[alt]", 20: "[capslock]", 19: "[pause]", 44: "[printscreen]",
      91: "[windows]", 92: "[windows]", 112: "[f1]", 114: "[f3]", 115: "[f4]", 116: "[f5]",
      117: "[f6]", 118: "[f7]", 119: "[f8]", 120: "[f9]", 121: "[f10]", 122: "[f11]", 123: "[f12]",
      144: "[numlock]", 145: "[scrolllock]", 224: "[cmd]"
   }
}

SocialCalc.Keyboard = {
   areListener: false, // if true, we have been installed as a listener for keyboard events
   focusTable: null, // the table editor object that gets keystrokes or null
   passThru: null, // if not null, control element with focus to pass keyboard events to (has blur method), or "true"
   didProcessKey: false, // did SocialCalc.ProcessKey in keydown
   statusFromProcessKey: false, // the status from the keydown SocialCalc.ProcessKey
   repeatingKeyPress: false, // some browsers (Opera, Gecko Mac) repeat special keys as KeyPress not KeyDown
   chForProcessKey: "" // remember so can do repeat in those cases
};

SocialCalc.KeyboardSetFocus = function(editor) {

   SocialCalc.Keyboard.focusTable = editor;

   if (!SocialCalc.Keyboard.areListener) {
      document.onkeydown = SocialCalc.ProcessKeyDown;
      document.onkeypress = SocialCalc.ProcessKeyPress;
      SocialCalc.Keyboard.areListener = true;
   }
   if (SocialCalc.Keyboard.passThru) {
      if (SocialCalc.Keyboard.passThru.blur) {
         SocialCalc.Keyboard.passThru.blur();
      }
      SocialCalc.Keyboard.passThru = null;
   }
   window.focus();
}

SocialCalc.KeyboardFocus = function() {

   SocialCalc.Keyboard.passThru = null;
   window.focus();

}

SocialCalc.ProcessKeyDown = function(e) {

   var kt = SocialCalc.keyboardTables;
   kt.didProcessKey = false; // always start false
   kt.statusFromProcessKey = false;
   kt.repeatingKeyPress = false;

   var ch="";
   var status=true;

   if (SocialCalc._app) return; // // ignore in app - widgets need control
   if (SocialCalc.Keyboard.passThru) return; // ignore

   e = e || window.event;

   if (e.which==undefined) { // IE
      ch = kt.specialKeysCommon[e.keyCode];
      if (!ch) {
         if (e.ctrlKey) {
            ch=kt.controlKeysIE[e.keyCode];
         }
         if (!ch)
            return true;
      }
      status = SocialCalc.ProcessKey(ch, e);

      if (!status) {
         if (e.preventDefault) e.preventDefault();
            e.returnValue = false;
      }
   }

   else {
      ch = kt.specialKeysCommon[e.keyCode];
      if (!ch) {
//         return true;
         if (e.ctrlKey || e.metaKey) {
            ch=kt.controlKeysIE[e.keyCode]; // this works here
         }
         if (!ch)
            return true;
      }

      status = SocialCalc.ProcessKey(ch, e); // process the key
      kt.didProcessKey = true; // remember what happened
      kt.statusFromProcessKey = status;
      kt.chForProcessKey = ch;
   }

   return status;

}

SocialCalc.ProcessKeyPress = function(e) {

   var kt = SocialCalc.keyboardTables;

   var ch="";

   e = e || window.event;
   if (SocialCalc._app) return; // // ignore in app - widgets need control

   if (SocialCalc.Keyboard.passThru) return; // ignore
   if (kt.didProcessKey) { // already processed this key
      if (kt.repeatingKeyPress) {
         return SocialCalc.ProcessKey(kt.chForProcessKey, e); // process the same key as on KeyDown
      }
      else {
         kt.repeatingKeyPress = true; // see if get another KeyPress before KeyDown
         return kt.statusFromProcessKey; // do what it said to do
      }
   }

   if (e.which==undefined) { // IE
      // Note: Esc and Enter will come through here, too, if not stopped at KeyDown
      ch=String.fromCharCode(e.keyCode); // convert to a character (special chars handled at ev1)
   }

   else { // not IE
      if (!e.which)
         return false; // ignore - special key
      if (e.charCode==undefined) { // Opera
         if (e.which!=0) { // character
            if (e.which<32 || e.which==144) { // special char (144 is numlock)
               ch = kt.specialKeysOpera[e.which];
               if (ch) {
                  return true;
               }
            }
            else {
               if (e.ctrlKey) {
                  ch=kt.controlKeysOpera[e.keyCode];
               }
               else {
                  ch = String.fromCharCode(e.which);
               }
            }
         }
         else { // special char
            return true;
         }
      }

      else if (e.keyCode==0 && e.charCode==0) { // OLPC Fn key or something
         return; // ignore
      }

      else if (e.keyCode==e.charCode) { // Safari
         ch = kt.specialKeysSafari[e.keyCode];
         if (!ch) {
            if (kt.ignoreKeysSafari[e.keyCode]) // pass this through
               return true;
            if (e.metaKey) {
               ch=kt.controlKeysSafari[e.keyCode];
            }
            else {
               ch = String.fromCharCode(e.which);
            }
         }
      }

      else { // Firefox
         if (kt.specialKeysFirefox[e.keyCode]) {
            return true;
         }
         ch = String.fromCharCode(e.which);
         if (e.ctrlKey || e.metaKey) {
            ch = kt.controlKeysFirefox[e.which];
         }
      }
   }

   var status = SocialCalc.ProcessKey(ch, e);

   if (!status) {
      if (e.preventDefault) e.preventDefault();
      e.returnValue = false;
   }

   return status;

}

//
// status = SocialCalc.ProcessKey(ch, e)
//
// Take a key representation as a character string and dispatch to appropriate routine
//

SocialCalc.ProcessKey = function (ch, e) {
   var ft = SocialCalc.Keyboard.focusTable;
   if (!ft) return true; // we're not handling it -- let browser do default
   return ft.EditorProcessKey(ch, e);
}

