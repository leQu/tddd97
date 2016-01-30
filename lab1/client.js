window.onload = function(){
    var token = localStorage.getItem("token");
    if (token === 'undefined' || token === null ){
        displayView("welcomeView");
        addPasswordListeners();
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
        // if email is undefined it is assumed that the logged in user's home page
        // is supposed to be displayed.
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

// Not working when messages being added from other places. Probable reason:
// http://stackoverflow.com/questions/7374355/localstorage-setitem-not-persisting-on-refresh
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

function sign_up() {
    var dataObject = signUpFormToDataObject();
    var response = serverstub.signUp(dataObject);

    if (response.success) document.getElementsByName("signUpForm")[0].reset();
    document.getElementById("status").innerHTML = response.message;
}

function signIn(){
    var username = document.forms["signInForm"]["email"].value;
    var password = document.forms["signInForm"]["password"].value;

    var response = serverstub.signIn(username, password);
    if (response.success){
        localStorage.setItem("token", response.data);
        displayView("profileView");
    }
    else document.getElementById("login-status").innerHTML = response.message;
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
    document.getElementById("password-message").innerHTML = response.message;
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
