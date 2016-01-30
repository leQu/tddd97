// users online
// total number of messages
//

var messages = 0;

$(document).ready(function(){

    connectStats();

    var data = {
        labels: ["Users online", "Total messages", "???"],
        datasets: [
            {
                label: "My Second dataset",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: [0, 0, 0]
            }
        ]
    };

    var updateData = function(oldData){
        var dataSetA = oldData["datasets"][0]["data"];
         dataSetA[0] = messages;
    };

    var options = {
        animation : false,
        scaleOverride : false,
        scaleSteps : 5,
        scaleStepWidth : 2,
        scaleStartValue : 0
    }


    var ctx = document.getElementById("chart").getContext("2d");
    var myNewChart = new Chart(ctx);

    setInterval(function(){
            updateData(data);
            myNewChart.Bar(data, options)
            ;}, 1000
    );
});


function connectStats() {
    var ws = new WebSocket("ws://localhost:5000/stats-connect");

    ws.onopen = function() {
        //ws.send(email);
    };

    ws.onmessage = function(response) {
        console.log(response.data.size);

        messages = response.data.size;
    };

    ws.onclose = function() {
        console.log("WebSocket closed");
    };

    ws.onerror = function() {
        console.log("ERROR!");
    };
}/**
 * Created by henha972 on 30/01/16.
 */
