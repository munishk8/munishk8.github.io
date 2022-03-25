// const server_url = "http://localhost/final_xchat/server/";
// const server_url = "http://192.168.43.1:8080/xchat/server/";
const server_url = "https://munish.rf.gd/xchat/";
// const server_url = "https://192.168.43.20/final_xchat/server/";
const profile_picture_url = "res/media/profilePicture.png";

var initial_view = "get_started";
var active_user_data = null;
var other_user_data = null;
var other_user = null;
var signup_verification_code_saved;
var flags = {
    view_back_flag: false,
    server_request_complete: false,
    signup_allow: false,
    view_process: false,
};
var user_image_cache = Array();

function show_error_popup(
    err = null,
    error_message = "Unable to reach the server. Please try again later.",
    error_title = "Something went wrong",
    error_control = `<button class="btn btn-danger px-5 shadow-sm" onclick="overlay()">Close</button>`
) {
    $("#popup_title").html(error_title);
    $("#popup_text").html(error_message);
    $("#popup_control").html(error_control);
    if (err) {
        console.log("Error: show_error_popup();");
        console.log(err);
    }
    overlay("popup");
}

function request_server(url, data, callback, loading = true) {
    console.log("Server Request: " + url);
    flags["server_request_complete"] = false;
    setTimeout(() => {
        if (loading && !flags["server_request_complete"])
            overlay("loading_overlay");
    }, 500);
    $.post(server_url + url, data)
        .then((res) => {
            flags["server_request_complete"] = true;
            console.log("Server request complete: ");
            console.log(res);
            if (res.status) {
                if (loading) overlay();
                callback(res);
            } else {
                show_error_popup();
            }
        })
        .catch((err) => {
            flags["server_request_complete"] = true;
            console.log("Error: request_server();");
            console.log(err);
            show_error_popup(err);
        });
}

$(document).ready(function () {
    current_url = new URL(window.location.href);
    requested_view = current_url.searchParams.get("view");
    view("splash");
    request_server(
        "api/is_application_allowed_to_load/",
        { application_version: "1.0.0" },
        (res) => {
            if (res.data) {
                if (localStorage.getItem("user_logged_in")) {
                    initial_view = "user_home";
                    // initial_view = "user_profile";
                    active_user_data = JSON.parse(
                        localStorage.getItem("active_user_data")
                    );
                    get_conversations();
                }
                // chat_view("first_bot");
                // user_profile_view();
                view(initial_view);
            } else {
                show_error_popup(
                    res,
                    res.error_message,
                    res.error_title,
                    res.error_control
                );
            }
        }
    );
});

setInterval(() => {
    if (current_view == "user_home") get_conversations();
    if (current_view == "user_chat") {
        get_messages();
        get_conversations();
    }
}, 1000);
