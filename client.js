displayView = function(viewId){
    var view = document.getElementById(viewId).innerHTML;
    document.getElementById("content").innerHTML = view;
    if(viewId === "profileView") displayTab('home');
}

window.onload = function(){
    var token = localStorage.getItem("token");
    if (token === 'undefined' || token === null ){
        displayView("welcomeView");
    }
    else displayView("profileView");
}

function displayTab(tabId){
    document.getElementById("home").style.display = "none";
    document.getElementById("browse").style.display = "none";
    document.getElementById("account").style.display = "none";
    document.getElementById(tabId).style.display = "block";

    if (tabId === "home"){
        updateUserInfo();
        updateWall();
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

function sendMessage(){
    var message = document.forms["wallForm"]["message"].value;
    var token = localStorage.getItem("token");
    var email = serverstub.getUserDataByToken(token).email;
    serverstub.postMessage(token,message,email);
}

function updateUserInfo(){
        var token = localStorage.getItem("token");
        var user = serverstub.getUserDataByToken(token);
        var userInfoDiv = document.getElementById("userInfo");
        userInfoDiv.innerHTML = getUserString(user.data);
}

function updateWall(){
    var token = localStorage.getItem("token");
    var messages = serverstub.getUserMessagesByToken(token)
    var wallDiv = document.getElementById("wall");

    wallDiv.innerHTML += getMessagesString(messages);
}

function signUp() {
    if (!isSignUpFormValid()) return false;
    // Create data object
    var dataObject = signUpFormToDataObject();

    var response = serverstub.signUp(dataObject);
    // Successful signup
    if (response.success){
        alert(response.message);
    }
    else alert(response.message);
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
    serverstub.changePassword(localStorage.getItem("token"),oldPassword,newPassword);
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

    var respons = serverstub.signUp(dataObject);
    console.log(dataObject.country);
    console.log(respons);
    // Successful signup
    if (respons.success){
        alert(respons.message);
    }

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