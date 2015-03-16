function newExport(store_hash){
    document.getElementById('overlay').style.display = 'block';

    $.ajax({
        type: "GET",
        url: '/bigcommerce/new-export/' + store_hash,
        success: function(){
            $("#overlay").hide();
        }
    });
}

function updateTime(){
    var data  = {};
    data["hour"] = $("#hour").val();
    data["min"] = $("#min").val();

    $.ajax({
        type: "POST",
        url: '/bigcommerce/update-time',
        data: data,
        success: function(){
            alert("Yay is saved");
        }
    });
}