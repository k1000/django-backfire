// This is a custom client-side implementation example of Backfire.

function showBackfireBar() {
    var bar = document.getElementById('backfireBar');
    if (bar.className == '')
      bar.className = 'show';
  }
  function hideBackfireBar() {
    var bar = document.getElementById('backfireBar');
    if (bar.className == 'show')
      bar.className = '';
  }

function startBackfireExample() {
  
  // Create my custom backfireOptions object.
  var backfireOptions = {
    
    // Give it the url to save to, cross-domain allowed.
    url: "/backfire/",
    
    // Optionally do an initial check if saving to that url is allowed.
    verifyAccessOnLoad: true,
    
    // Handle incoming messages from the server.
    messageHandler: function(message) {
      switch (message) {

        // With verifyAccessOnLoad enabled, AccessGranted is returned when all is okay.
        // This allows you to show a button or toolbar if you like.
        case "AccessGranted":
          // Let's create a simple button that calls Backfire.save() when pressed.
          var button = document.createElement("button");
          button.innerHTML = "Save CSS";
          button.setAttribute("style", "position: fixed; left: 20px; top: 100px;")
          button.onclick = function() { Backfire.save(); }
          document.body.appendChild(button);
          break;

        // With verifyAccessOnLoad enabled, AccessDenied is returned if the server is set up 
        // correctly, but you don't have access to save changes.
        case "AccessDenied":
          alert("Access was denied!");
          break;
        
        // After saving went okay, refresh Backfire to clean up its collection of changes.
        case "SaveSuccessful":
          Backfire.refresh();
          alert("Your changes have been saved.");
          break;
          
        // When saving failed, show it.
        case "SaveFailed":
          alert("Saving failed.");
          break;
      }
    }
  };

  // Go
  Backfire.load(backfireOptions);
}



function BackfireLoadedCallback() {
  var prototypeName = document.location.host.replace(/^(.*?)\..*$/g, "$1");
  var host = document.location.host.substr(prototypeName.length + 1);
  var url = "/backfire/";

  // debug code
  //if (host != "quplo.com") {
  //  url = "http://quploeditor/workon/" + prototypeName + "/backfire";
  //}

  function showBackfireBar() {
    var bar = document.getElementById('backfireBar');
    if (bar.className == '')
      bar.className = 'show';
  }
  function hideBackfireBar() {
    var bar = document.getElementById('backfireBar');
    if (bar.className == 'show')
      bar.className = '';
  }

  var backfireOptions = {
    url: url,
    verifyAccessOnLoad: true,
    messageHandler: function (message) {
      switch (message) {
        case "AccessGranted":

          var enabled = true;
          if (enabled) {
            // add the css
            var link = document.createElement('link');
            link.href = "/media/css/backfire.css";
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('media', 'screen');

            // add the backfire bar
            var div = document.createElement("div");
            div.id = "backfireBar";
            var button = document.createElement("a");
            button.href = "#";
            button.className = "button small";
            button.innerHTML = "Save CSS changes";
            button.onclick = function () { Backfire.save(); return false; }
            div.appendChild(button);

            window.setTimeout(function () {
              document.getElementsByTagName('head')[0].appendChild(link);
              document.body.appendChild(div);
              showBackfireBar();
            }, 1000);
          }

          break;
        case "AccessDenied":
          //alert("Access denied.\n\nAre you signed in to Quplo?");
          break;
        case "SaveSuccessful":
          Backfire.refresh();
          alert("Your changes have been saved.");
          break;
        case "SaveFailed":
          alert("The changes could not be saved.\n\nVisit http://support.quplo.com to report this error.");
          break;
      }
    }
  };
  Backfire.load(backfireOptions);
}

$(document).ready( BackfireLoadedCallback() )
