/// BackfireObj.js - Firing back CSS changes made with FireBug or the Webkit Developer Toolbar
/// (c) 2010 by Martin Kool and Q42
/// Written to be used in Quplo prototypes: http://quplo.com
/// Twitter: @mrtnkl (me), @quplo and @q42. See you there.

var Backfire = (function () {

  // the private Backfire singleton
  var BackfireObj =
  {
    styleSheets: {},

    changes: {},

    messageHandler: function (message) {
      switch (message) {
        case "AccessGranted":
          break;
        case "AccessDenied":
          alert("Backfire is loaded, but you don't seem to have access to save your changes.");
          break;
        case "SaveSuccessful":
          BackfireObj.refresh();
          alert("Your changes have been saved.");
          break;
        case "SaveFailed":
          alert("Saving failed.");
          break;
      }
    },

    // Initialize Backfire, load up the original stylesheets collection and memorize the url to post changes to.
    load: function (backfireOptions) {
      // map the url and handler
      if (backfireOptions.messageHandler)
        this.messageHandler = backfireOptions.messageHandler;
      var sss = document.styleSheets;
      if (!sss) console.log("No stylesheets available during load.");
      for (var i = 0; i < sss.length; i++) {
        var ss = sss[i];
        var pbs = new BackfireStyleSheet(ss);
        BackfireObj.styleSheets[pbs.href] = pbs;
      }

      var initialIframeUrl = backfireOptions.verifyAccessOnLoad ? backfireOptions.url : "about:blank";
      
      // prepare a form with a hidden iframe for posting
      setTimeout(function () {
        var div = document.createElement("div");
        div.setAttribute("id", "Backfire");
        div.setAttribute("style", "display:none");
        
        var html = "<form id='backfire-form' onsubmit='return false;' method='post' action=\"" + backfireOptions.url + "\" target='backfire-iframe'>";
        var csrf = document.getElementById("csrftip").value;
        if ( csrf ) { html += "<input type=hidden name=csrfmiddlewaretoken value=\"" + csrf +'">' }; // django csrf hack
        html += "<textarea id='backfire-changes' name='backfire-changes'></textarea>";
        html += "</form>";
        html += "<iframe id='backfire-iframe' name='backfire-iframe' src='" + initialIframeUrl + "'/>";
        div.innerHTML = html;
        document.documentElement.appendChild(div);
      }, 0);
    },

    // Post changes back to the server
    save: function () {
        postMessage("Saving", "*")
      BackfireObj.processChanges();
      var str = [];
      for (var uri in BackfireObj.changes) {
        if (!uri) {
          console.log("Empty uri found. Skipping.");
          continue;
        }
        str.push("u:", uri, "\n");
        for (var selector in BackfireObj.changes[uri]) {
          str.push("s:", selector, "\n");
          if (!BackfireObj.changes[uri][selector]) console.log("No changes found for " + selector + " at " + uri);
          for (var i = 0; i < BackfireObj.changes[uri][selector].length; i++) {
            var c = BackfireObj.changes[uri][selector][i];
            str.push(c[0], ":", c[1], ":", c[2], "\n");
          }
        }
      }
      str = str.join("").replace(/\n*$/gi, "");
      document.getElementById("backfire-changes").value = str;
      document.getElementById("backfire-form").submit();
    },

    // Clean up changes log to allow further changes
    refresh: function () {
      BackfireObj.changes = {};
      BackfireObj.styleSheets = {};
      var sss = document.styleSheets;
      if (!sss) console.log("No stylesheets found during refresh.");
      for (var i = 0; i < sss.length; i++) {
        var ss = sss[i];
        var pbs = new BackfireStyleSheet(ss);
        BackfireObj.styleSheets[pbs.href] = pbs;
      }
    },

    processChanges: function () {
      var sss = document.styleSheets;
      BackfireObj.changes = {};
      if (!sss) console.log("No stylesheets found during processChanges.");
      for (var i = 0; i < sss.length; i++) {
        var ss = sss[i];
        var oldPbs = BackfireObj.styleSheets[ss.href];
        var newPbs = new BackfireStyleSheet(ss);
        if (newPbs && oldPbs) {

          // check for removed rules
          for (var selectorText in oldPbs.rules) {
            //console.log(selectorText);
            var oldRule = oldPbs.rules[selectorText];
            var newRule = newPbs.rules[selectorText];
            for (var declaration in oldRule.declarations) {
              var oldDeclaration = oldRule.declarations[declaration];
              if (!newRule || !newRule.declarations[declaration])
                BackfireObj.addChange("r", ss.href, selectorText, declaration, oldDeclaration);
            }
          }

          // check for changed or new rules
          for (var selectorText in newPbs.rules) {
            var oldRule = oldPbs.rules[selectorText];
            var newRule = newPbs.rules[selectorText];
            if (newRule && oldRule) {
              for (var declaration in newRule.declarations) {
                var oldDeclaration = oldRule.declarations[declaration];
                var newDeclaration = newRule.declarations[declaration];
                if (!oldDeclaration)
                  BackfireObj.addChange("a", ss.href, selectorText, declaration, newDeclaration);
                else if (oldDeclaration != newDeclaration)
                  BackfireObj.addChange("c", ss.href, selectorText, declaration, newDeclaration);
              }
            } else {
                console.log( newRule )
            }
          }
        }
      }
    },

    addChange: function (changeType, uri, selector, declaration, value) {
      var uriObj = BackfireObj.changes[uri];
      if (!uriObj) {
        uriObj = {};
        BackfireObj.changes[uri] = uriObj;
      }
      var selectorObj = uriObj[selector];
      if (!selectorObj) {
        selectorObj = [];
        uriObj[selector] = selectorObj;
      }
      selectorObj.push([changeType, declaration, value]);
    },

    postMessageListener: function (message) {
      BackfireObj.messageHandler(message.data);
    }
  }

  // BackfireStyleSheet knows its source and contents
  var BackfireStyleSheet = function (styleSheet) {
    this.styleSheet = styleSheet;
    this.href = styleSheet.href;
    this.parseRules();
  };

  BackfireStyleSheet.prototype =
    {
      styleSheet: null,
      rules: {},
      parseRules: function () {
        this.rules = {};
        var cssRules;
        
        try { cssRules = this.styleSheet.cssRules; }
        catch (e) { console.log("Error trying to access stylesheet."); }

        if (!cssRules) console.log("No cssRules found during parseRules.");
        else {
          for (var i = 0; i < cssRules.length; i++) {
            var rule = cssRules[i];
            this.rules[rule.selectorText] = new BackfireStyleSheetRule(rule);
          }
        }
      }
    };

  // the BackfireStyleSheetRule contains the identifier, and declaration
  var BackfireStyleSheetRule = function (cssRule) {
    this.cssRule = cssRule;
    this.selectorText = cssRule.selectorText;
    this.parseDeclarations();
  };

  BackfireStyleSheetRule.prototype =
  {
    cssRule: null,
    selectorText: "",
    declarations: {},
    parseDeclarations: function () {
      this.declarations = {};
      var text = this.cssRule.cssText.replace(/^.*?\{\s*(.*?)\s*\}/gi, "$1");
      var pairs = text.split(';');
      if (!pairs) console.log("No pairs found during parseDeclarations.");
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].replace(/^\s*|\s*$/gi, "");
        if (pair == "") continue;
        var nameValue = (pairs[i] + "").split(':');
        var name = nameValue[0].replace(/^\s*|\s*$/gi, "");
        
        if ( nameValue[1] == undefined ) {
            console.log(text)
            alert("There been error during parsing the CSS. Saving can produce unpredictable results!")
        } else {
            var value = nameValue[1].replace(/^\s*|\s*$/gi, "");
            this.declarations[name] = value;
        }

      }
    }
  };
  if ( window.addEventListener ) {
      window.addEventListener("message", BackfireObj.postMessageListener, false)
  } else {
      window.attachEvent("message", BackfireObj.postMessageListener, false)
  }

  // Create the public Backfire object
  var Backfire = {};
  Backfire.load = function (postbackUrl, ajaxHandler) { BackfireObj.load(postbackUrl, ajaxHandler); };
  Backfire.save = function () { BackfireObj.save(); };
  Backfire.refresh = function () { BackfireObj.refresh(); };
  return Backfire;
})();

// when the script is loaded dynamically, notify that it's ready
if (window.BackfireLoadedCallback) window.BackfireLoadedCallback();