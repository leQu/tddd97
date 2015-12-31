window.onload = function(){
    var token = localStorage.getItem("token");
    if (token === 'undefined' || token === null ){
        displayView("welcomeView");
    }
    else displayView("profileView");
}

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
        if (typeof email === 'undefined'){
            var token = localStorage.getItem("token");
            email = serverstub.getUserDataByToken(token).data.email;
        }
        updateUserInfo(email);
        updateWall(email);
    }
}

function getMessagesString(messages){
    var string = "";
    for (var i=0;i<messages.data.length; i++){
        string += messages.data[i].writer + ":<br>";
        string += messages.data[i].content + "<br><br>";
    }
    return string;
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

function sendMessage(toEmail){
    var message = document.forms["wallForm"]["message"].value;
    var token = localStorage.getItem("token");
    serverstub.postMessage(token,message,toEmail);
    updateWall(toEmail);
}

function updateUserInfo(email){
    var token = localStorage.getItem("token");
    var user = serverstub.getUserDataByEmail(token,email);
    var userInfoDiv = document.getElementById("userInfo");
    userInfoDiv.innerHTML = getUserString(user.data);
}

function updateWall(email){
    var token = localStorage.getItem("token");
    var messages = serverstub.getUserMessagesByEmail(token,email);
    var messagesDiv  = document.getElementById("messages");
    messagesDiv.innerHTML = getMessagesString(messages);
    console.log(messages);
    // This classname keeps track of whose wall we are watching.
    document.getElementById("wall").className = email;
}

function browseUser(){
    var email = document.forms["browseForm"]["userEmail"].value;
    displayTab("home", email);
}


function signIn(){
    var username = document.forms["signInForm"]["email"].value;
    var password = document.forms["signInForm"]["password"].value;

    var response = serverstub.signIn(username, password);

    if (response.success){
        localStorage.setItem("token", response.data);
        displayView("profileView");
    }
    else alert(response.message);
}

function signOutUser(){
    var response = serverstub.signOut(localStorage.getItem("token"));
    if (response.success){
        localStorage.removeItem("token");
        displayView("welcomeView");
    }
}

function changePassword(){
    var newPassword = document.forms["changePasswordForm"]["newPassword"].value;
    var oldPassword = document.forms["changePasswordForm"]["oldPassword"].value;
    var response = serverstub.changePassword(localStorage.getItem("token"),oldPassword,newPassword);
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

function signUp() {
    if (!isSignUpFormValid()) return false;
    // Create data object
    var dataObject = signUpFormToDataObject();

    var params = "email="+dataObject.email+"&";
    params += "password="+dataObject.password+"&";
    params += "firstname="+dataObject.firstname+"&";
    params += "familyname="+dataObject.familyname+"&";
    params += "gender="+dataObject.gender+"&";
    params += "city="+dataObject.city+"&";
    params += "country="+dataObject.country;

    //var respons = serverstub.signUp(dataObject);
    var response = sendPOSTrequest("/add-user", params);
    // Successful signup
    //if (response.success){
    alert(response);
    //}
    return 0;
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

function isSignUpFormValid() {
    // Passwords must be equal
    var password1 = document.forms["signUpForm"]["password1"].value;
    var password2 = document.forms["signUpForm"]["password2"].value;
    if (password1 != password2) {
        alert("Password must be the same");
        return false;
    }
    if (password1.length < 8){
        alert("Password must be at least 8 characters.");
        return false;
    }
    return true;
}

function sendPOSTrequest(url, postData){

    var http = new XMLHttpRequest();
    http.open("POST", url, true);

//Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState == 4 && http.status == 200) {
            alert(http.responseText);
        }
    }
    http.send(postData);



    /*var method = "POST";
     var async = true;
     var request = new XMLHttpRequest();

     // Specifies how the HTTP response will be handled.
     request.onload = function () {
     return request.responseText;
     }

     request.open(method, url, async);
     request.setRequestHeader("Content-Type", "application/content;charset=UTF-8");
     request.send(postData);
     */
}