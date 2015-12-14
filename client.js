displayView = function(viewId){
    var view = document.getElementById(viewId).innerHTML;
    document.getElementById("content").innerHTML = view;
}

window.onload = function(){
    displayView("welcomeView");
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