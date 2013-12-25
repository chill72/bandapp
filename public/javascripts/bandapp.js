$(document).ready(function(){
    var currentSongId = -1;

    initialize();
    function initialize(){
        $("#songs form")[0].reset();
        $("#songs li").eq(0).addClass("selected");
        if(!a) $("#song_details .toolbar").hide();
        loadDetails($("#songs li")[0].id);
    }
    function loadSongs(){
        var $ul = $("#songs ul");
        $ul.empty();
        $(songs).each(function(){
            var li = $("<li id='" + this._id + "'>" + this.title + "</li>" );
            $ul.append(li);
        });
    }
    function loadDetails(id){
        var song = ($.grep(songs, function(e){ return e._id == id; }))[0],
            $commentsUL = $("#comments ul");
        currentSongId = id;
        $("#song_details h3").text(song.title);
        $("#description").text(song.description);
        if(song.youtube){
            $("#video").show();
            $("#player").html("<iframe src='http://www.youtube.com/embed/" + song.youtube.substr(song.youtube.indexOf("v=") + 2, 11) + "'></iframe>");
        }
        else{
            $("#player").empty();
            $("#video").hide();
        }

        if(song.attachment){
            var icon = "";
            var ext = getExtensionIcon(song.attachment);
            if(ext) icon = "<img src='"+ext+"'>";
            $("#attachments ul").html("<li><a href='files/" + song.attachment + "' target='_blank'>" + icon + song.attachment + "</a></li>");
        }
        else{
            $("#attachments ul").html("<li>none</li>");
        }
        $commentsUL.empty();
        var request = $.ajax({
            url:"/getComments",
            type: "post",
            data: {"songId":currentSongId}
        });
        request.done(function(data){
            var comments = JSON.parse(data);
            for(var i = 0; i<comments.length; i++){
                var $li = $("<li><span>" + comments[i].name + "</span> " + comments[i].text + "</li>");
                $commentsUL.append($li);
            }
        });
        request.fail(function(response, textStatus, jqXHR){

        });
    }
    $("#songs li").click(function(){
        var $this = $(this);
        if($this.hasClass("selected")) return;
        loadDetails(this.id);
        $("#songs li").removeClass("selected");
        $(this).addClass("selected");
    });
    $("#new_song").click(function(e){
        e.preventDefault();
        $("#songs form").slideDown();
    });
    $("button.cancel").click(function(e){
        e.preventDefault();
        var $form = $(this).closest("form");
        $form[0].reset();
        $form.find(".error").empty();
        $form.slideUp();
    });

    $("#songs .submit").click(function(e){
        var data, request;
        e.preventDefault();
        data = validateNewSong();
        if(!data) return;
        $("#songs form").submit();
    });

    $("#delete_song").click(function(){
        var request = $.ajax({
            url:"/delete",
            type: "post",
            data: {"songId":currentSongId}
        });
        request.done(function(response, textStatus, jqXHR){
            songs = $.grep(songs , function (value) {
                return value._id != currentSongId;
            });
            loadSongs();
            loadDetails($("#songs li")[0].id);
        });
        request.fail(function(response, textStatus, jqXHR){
            console.log("error deleting song " + currentSongId);
        });
    });
    $("#comments button").click(function(e){
        var $comments = $("#comments"),
            $textarea = $comments.find("textarea"),
            text = $textarea.val(),
            $ul = $comments.find("ul"),
            $li = $("<li style='display:none;'><span>" + userName + "</span> " + text + "</li>");
        e.preventDefault();

        var newComment = {
            text:$("#new_comment").val(),
            name:userName,
            songId:currentSongId
        }

        var request = $.ajax({
            url:"/addComment",
            type: "post",
            data: newComment
        });
        request.done(function(response, textStatus, jqXHR){
            $ul.find(".none").remove();
            $ul.prepend($li);
            $li.slideDown();
            $textarea.val("");
        });
        request.fail(function(response, textStatus, jqXHR){
            console.log("error saving comment");
        });
    });

    function validateNewSong(){
        var $error = $("#songs .error"),
            title = $("input[name='title']").val(),
            youtube = $("input[name='youtube']").val(),
            idx = youtube.indexOf("v=");
        $error.empty();
        if(title.length == 0) {
            $error.text("A song title is required");
            return false;
        }
        if(youtube.length > 0 && idx==-1){
            $error.text("Only YouTube links are supported");
            return false;
            //youtube = youtube.substr(youtube.indexOf("v=") + 2, 11);
        }
        return true;
        /*
        return {
            title: $("input[name='title']").val(),
            description: $("textarea").val(),
            yt: youtube
        };
        */
    }
    function getExtensionIcon(filename){
        var path = "images/filetypes/16px/";
        var re = /(?:\.([^.]+))?$/;
        var ext = re.exec(filename)[1];
        if(ext == "pdf") return path + "pdf.png";
        if(ext == "doc" || ext == "docx") return path + "doc.png";
        if(ext == "rtf") return path + "rtf.png";
        return false;
    }
});