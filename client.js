displayView = function(viewId){
    var view = document.getElementById(viewId).innerHTML;
    document.getElementById("content").innerHTML = view;
}

window.onload = function(){
displayView("welcomeView");
//code that is executed as the page is loaded.
//You shall put your own custom code here.
}