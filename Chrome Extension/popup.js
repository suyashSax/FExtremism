var img = document.getElementById('spinner');
var content = document.getElementById('content');

chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
      var url = tabs[0].url;
      console.log(url);
      chrome.runtime.sendMessage({url:url, from_popup:true},null);
  });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) { 
    console.log('Got message');
    if (request.to_popup == true){
      content.innerHTML = request.text;
      img.setAttribute('hidden','true');
    }
  });