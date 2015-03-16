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
    data["hour"] = $('input[name=hour]:checked').val();
    data["min"] = 0;

    $.ajax({
        type: "POST",
        url: '/bigcommerce/update-time',
        data: data,
        success: function(){
            alert("Successfully updated selected export schedule.");
        }
    });
}

$(document).ready(function(){
    var $hours = $('input:radio[name=hour]');
    if($hours.is(':checked') === false) {
        var $selected_hour = $(".hour_table").data("hour");
        $hours.filter('[value='+ $selected_hour +']').prop('checked', true);
    }
});