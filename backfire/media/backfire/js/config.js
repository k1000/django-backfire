// This is a custom client-side implementation example of Backfire.

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
            link.href = "/media/backfire/css/backfire.css";
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('type', 'text/css');
            link.setAttribute('media', 'screen');

            // add the backfire bar
            var div = document.createElement("div");
            div.id = "backfireBar";
            var button = document.createElement("a");
            button.href = "#";
            button.id = "backfireBtn";
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
        case "Saving":
          var btn = document.getElementById("backfireBtn")
          btn.innerHTML = "Saving..."
          btn.bgColor = "yellow"
          break;
        case "SaveSuccessful":
          var btn = document.getElementById("backfireBtn")
          btn.innerHTML = "Changes Saved"
          btn.bgColor = "green"
          Backfire.refresh();
          break;
        case "SaveFailed":
          var btn = document.getElementById("backfireBtn")
          btn.innerHTML = "The changes could not be saved.";
          break;
      }
    }
  };
  function update_status( msg, color ){
    
  }
  Backfire.load(backfireOptions);
}
window.BackfireLoadedCallback()