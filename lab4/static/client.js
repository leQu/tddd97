

window.onload = function(){
    var token = localStorage.getItem("token");
    if (token != 'undefined' && token != null ){
        sendGETrequest("/is-logged-in/" + token, function (response){
            console.log(response);
            if (response.message) {
                displayView("profileView");
                loadChart();
            }
            else displayView("welcomeView");
        });
    }
    else{
        displayView("welcomeView");
    }}

function displayView(viewId){
    var view = document.getElementById(viewId).innerHTML;
    document.getElementById("content").innerHTML = view;

    if(viewId === "profileView"){
        displayTab("home");
    }
}

function displayTab(tabId, email){
    document.getElementById("home").style.display = "none";
    document.getElementById("browse").style.display = "none";
    document.getElementById("account").style.display = "none";
    document.getElementById(tabId).style.display = "block";

    if (tabId === "home") {
        // if email is undefined it is assumed that the logged in user's home page
        // is supposed to be displayed.
        if (typeof email === 'undefined'){
            var token = localStorage.getItem("token");
            sendGETrequest("/get-user-data-by-token/" + token, function (response){
                if(response.success) updateHomeTab(response.data.email)
            });
        }
        else updateHomeTab(email);
    }
}


function updateHomeTab(email){
    // This classname keeps track of whose wall we are watching.
    document.getElementById("wall").className = email;

    updateUserInfo(email);
    updateWall(email);
    increasePageViews(email);

}

function increasePageViews(email){
    var token = localStorage.getItem("token");

    var postData = "&token=" + token + "&email=" + email;

    sendPOSTrequest("/increase-page-views", postData, function(response){
        console.log(response.message);
    });

}

function getMessagesString(messages){
    var string = "";
    for (var i=0;i<messages.length; i++){
        string += messages[i].fromUser + ":<br>";
        string += messages[i].content + "<br><br>";
    }
    return string;
}
function sendMessage(toEmail){
    var message = document.forms["wallForm"]["message"].value;
    var token = localStorage.getItem("token");
    var postData = "message=" + message + "&token=" + token + "&email=" + toEmail;
    sendPOSTrequest("/add-message", postData, function(response){
        updateWall(toEmail);
    });
}

function updateWall(email){
    var token = localStorage.getItem("token");
    var messagesDiv  = document.getElementById("messages");
    sendGETrequest("/get-user-messages-by-email/" + token + "/" + email, function(response){
        if (response.success){
            messagesDiv.innerHTML = getMessagesString(response.data);
        }
        else messagesDiv.innerHTML = response.message;
    });
}

function browseUser(){
    var email = document.forms["browseForm"]["userEmail"].value;
    displayTab("home", email);
}

function signIn(){
    var email = document.forms["signInForm"]["email"].value;
    var password = document.forms["signInForm"]["password"].value;
    var postData = "username="+email+"&password="+password;
    sendPOSTrequest("/sign-in", postData, function(response){
        if (response.success){
            connectSocket(email);
            localStorage.setItem("token", response.data);
            displayView("profileView");
            loadChart();
        }
        else document.getElementById("login-status").innerHTML = response.message;

    });
}

function signOut(){
    var postData = "token="+localStorage.getItem("token");
    sendPOSTrequest("/sign-out",postData,function(response){
        delete ws;
        localStorage.removeItem("token");
        displayView("welcomeView");
    });
}

function changePassword(){
    var newPassword = document.forms["changePasswordForm"]["newPassword"].value;
    var oldPassword = document.forms["changePasswordForm"]["oldPassword"].value;
    var token = localStorage.getItem("token");
    var postData = "token=" + token + "&old_password=" + oldPassword + "&new_password=" + newPassword;
    sendPOSTrequest("/change-password",postData, function(response){
        document.getElementById("password-message").innerHTML = response.message;
    });
}


function getUserString(user){
    return "" +
        user.firstname + "<br>" +
        user.familyname + "<br>" +
        user.gender + "<br>" +
        user.city + "<br>" +
        user.country + "<br>" +
        user.email;
}

function updateUserInfo(email){
    var token = localStorage.getItem("token");
    var userInfoDiv = document.getElementById("userInfo");
    sendGETrequest("/get-user-data-by-email/" + token + "/" + email, function (response){
        if(response.success){
            userInfoDiv.innerHTML = "Email: " + response.data.email + "<br>";
            userInfoDiv.innerHTML += "Firstname: " + response.data.firstname + "<br>";
            userInfoDiv.innerHTML += "Familyname: " + response.data.familyname + "<br>";
            userInfoDiv.innerHTML += "Gender: " + response.data.gender + "<br>";
            userInfoDiv.innerHTML += "City: " + response.data.city + "<br>";
            userInfoDiv.innerHTML += "Country: " + response.data.country + "<br>";
        }
    });
}

function signUpFormToDataObject(){
    var dataObject = new Object();
    dataObject.email = document.forms["signUpForm"]["email"].value;
    dataObject.password = document.forms["signUpForm"]["password1"].value;
    dataObject.firstname = document.forms["signUpForm"]["firstname"].value;
    dataObject.familyname = document.forms["signUpForm"]["familyname"].value;
    dataObject.gender = getOptionsSelectedValue("gender");
    dataObject.city = document.forms["signUpForm"]["city"].value;
    dataObject.country = document.forms["signUpForm"]["country"].value;
    return dataObject;
}

function getOptionsSelectedValue(optionName) {
    var element = document.getElementsByName(optionName)[0];
    if (element.selectedIndex == -1)return null;
    return element.options[element.selectedIndex].text;
}

function sign_up() {
    // Create data object
    var dataObject = signUpFormToDataObject();
    var postData = "email="+dataObject.email+"&";
    postData += "password="+dataObject.password+"&";
    postData += "firstname="+dataObject.firstname+"&";
    postData += "familyname="+dataObject.familyname+"&";
    postData += "gender="+dataObject.gender+"&";
    postData += "city="+dataObject.city+"&";
    postData += "country="+dataObject.country;

    sendPOSTrequest("/add-user", postData, function(response){
        if (response.success) document.getElementsByName("signUpForm")[0].reset();

        document.getElementById("status").innerHTML = response.message;
    });
}


function signUpFormToDataObject(){
    var dataObject = new Object();
    dataObject.email = document.forms["signUpForm"]["email"].value;
    dataObject.password = document.forms["signUpForm"]["password1"].value;
    dataObject.firstname = document.forms["signUpForm"]["firstname"].value;
    dataObject.familyname = document.forms["signUpForm"]["familyname"].value;
    dataObject.familyname = document.forms["signUpForm"]["familyname"].value;
    dataObject.gender = getOptionsSelectedValue("gender");
    dataObject.city = document.forms["signUpForm"]["city"].value;
    dataObject.country = document.forms["signUpForm"]["country"].value;
    return dataObject;
}

function getOptionsSelectedValue(optionName) {
    var element = document.getElementsByName(optionName)[0];
    if (element.selectedIndex == -1)return null;
    return element.options[element.selectedIndex].text;
}

function addPasswordListeners(){
    var p1 = document.forms["signUpForm"]["password1"];
    var p2 = document.forms["signUpForm"]["password2"];

    p1.addEventListener('change', checkPasswordValidity, false);
    p2.addEventListener('change', checkPasswordValidity, false);
}

function checkPasswordValidity(){

    var password1 = document.forms["signUpForm"]["password1"];
    var password2 = document.forms["signUpForm"]["password2"];

    if (password1.value.length < 8){
        password2.setCustomValidity("Password must be at least 8 characters.");
    }
    else if (password1.value != password2.value) {
        password2.setCustomValidity("Passwords don't Match");
    }
    else password2.setCustomValidity("");
}

function sendPOSTrequest(url, postData, callback){
    var xmlHttp = new XMLHttpRequest();
    var async = true;
    xmlHttp.open("POST", url, async);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.onreadystatechange = function() {//Call a function when the state changes.
        if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(JSON.parse(xmlHttp.responseText));
        }
    }
    xmlHttp.send(postData);
}

function sendGETrequest(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    var async = true;
    xmlHttp.open("GET", url, async);
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(JSON.parse(xmlHttp.responseText));
        }
    }
    xmlHttp.send(null);
}


var ws;
function connectSocket(email) {
    ws = new WebSocket("ws://localhost:5000/socket-connect");

    ws.onopen = function() {
        var data = {};
        data["type"] = "email";
        data["data"] = email;
        ws.send(JSON.stringify(data));
    };

    ws.onmessage = function(response) {
        var response = JSON.parse(response.data);

        console.log(response);

        if (response.type == "logout") signOut();
        else if (response.type == "stats") {
            messages_count = response.messages;
            users_count = response.users;
            page_views_count = response.pageviews;
        }
    };

    ws.onclose = function() {
        console.log("WebSocket closed");
    };

    ws.onerror = function() {
        console.log("ERROR!");
    };
}
