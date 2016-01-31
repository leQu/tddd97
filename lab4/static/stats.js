// users online
// total number of messages
//

var messages_count = 0;
var users_count = 0;
var page_views_count = 0;


function updateData(oldData){
    var dataSetA = oldData["datasets"][0]["data"];
    dataSetA[0] = users_count;
    dataSetA[1] = messages_count;
    dataSetA[2] = page_views_count;
}

function loadChart() {

    var options = {
        animation : false,
        scaleOverride : false
    };

    var data = {
        labels: ["Users online", "My received messages", "My homepage views"],
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

    var ctx = document.getElementById("chart").getContext("2d");
    var chart = new Chart(ctx);


    setInterval(function(){
        requestStats();
        updateData(data);
        chart.Bar(data, options)
        ;}, 1000
    );

}

function requestStats(){
    var data = {};
    data["type"] = "stats";
    data["token"] = localStorage.getItem("token");
    console.log(data);
    if (typeof ws !== 'undefined')
        ws.send(JSON.stringify(data));
}