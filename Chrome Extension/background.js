var serverURL = 'http://localhost:3000/';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) { 
    var xmlhttp = new XMLHttpRequest();
    console.log("Analyzing URL: "+request.url);
    xmlhttp.open("POST",serverURL,true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
            var response = xmlhttp.responseText;
            if (request.from_popup == true){
                chrome.runtime.sendMessage({text:response, to_popup:true});
            }
            console.log(response); // analyse response here
        }
    };
    xmlhttp.send(JSON.stringify({url:request.url}));
  });