var feeds = new Set();
var style = 'border-radius: 27px;font-family: Arial;color: #ff3838;background: #ffffff;padding: 10px 20px 10px 20px;border: solid #ff3333 2px;';
var serverURL = 'http://localhost:3000/';

function sendPostRequest(url, params, success, error){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST",url,true);
    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
            success();
        }
        else{
            error();
        }
    };
    xmlhttp.send(params);
}

function extractFacebookUrl(u) {
    u = u.substr(u.indexOf('l.php?u=') + 8); // remove before ?u=
    u = u.substr(0, u.indexOf('&')); // remove after &

    return decodeURIComponent(u);
}

// setInterval(function() {
// // Runs every second
// 	var test = document.getElementsByClassName('_4-u2 mbm _5v3q _4-u8');

// 	for(var i=0; i<test.length; i++) {

// 		var data = test[i];

// 		// Check if feed needs to be modified

// 		if(!feeds.has(data)) {
// 			feeds.add(data);

// 			// Send server requests

// 			var processed = false;

// 			var linked = test[i].querySelector('._6ks');
// 			if(!processed && linked != null && linked.querySelector('a') != null) {
// 				processed = true;
//                 linked.innerHTML = linked.innerHTML + "<p style='"+style+"'> FAKE NEWS </p>";
//                 // var URL = extractFacebookUrl(linked.querySelector('a').href);
//                 // console.log("FEXTREMISM: Got url1 "+URL);
//                 // chrome.runtime.sendMessage({url:URL},null);
//                 // // sendPostRequest(serverURL,{"url":url}, function(){
//                 // //     linked.innerHTML = linked.innerHTML + "<p style='"+style+"'> FAKE NEWS </p>";
//                 // // }, function(){
//                 // //     console.log("ERROR: in request");
//                 // // })
// 			}


// 			var link = test[i].querySelector('._5pbx.userContent');
// 			if(!processed && link != null && link.querySelector('a') != null && link.querySelector('a').href != null && link.querySelector('a').href != undefined) {
// 				processed = true;
//                 link.innerHTML = link.innerHTML + "<p style='"+style+"'> FAKE NEWS </p>"
//                 // var URL = extractFacebookUrl(link.href);
//                 // console.log("FEXTREMISM: Got url2 "+URL);
//                 // chrome.runtime.sendMessage({url:URL},null);
//                 // // sendPostRequest(serverURL,{"url":url}, function(){
//                 // //     link.innerHTML = link.innerHTML + "<p style='"+style+"'> FAKE NEWS </p>"
//                 // // }, function(){
//                 // //     console.log("ERROR: in request");
//                 // // })
// 			}

// 		}
// 	}

// }, 1000);