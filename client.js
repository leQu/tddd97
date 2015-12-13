displayView = function(viewId){
    var view = document.getElementById(viewId).innerHTML;
    document.getElementById("content").innerHTML = view;
}

window.onload = function(){
    displayView("welcomeView");
}

function validateSignUpForm() {
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
}