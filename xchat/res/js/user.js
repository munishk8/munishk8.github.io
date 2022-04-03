function search_user(keyword) {
    if (keyword) {
        keyword = keyword.toLowerCase();
        $("#user_search_result").html(
            `<div class="d-flex flex-grow-1 justify-content-center align-items-center fade-pop"><div class="spinner-border text-secondary"></div></div>`
        );
        request_server(
            "api/search_user/",
            {
                keyword: keyword,
                active_user: active_user_data.username,
            },
            (res) => {
                $("#user_search_result").html("");
                if (!res.data.length) {
                    $("#user_search_result").html(
                        `<div class="d-flex flex-grow-1 justify-content-center align-items-center"><div class="fade-pop fw-600">No Results Found</div></div>`
                    );
                } else {
                    for (let i = 0; i < res.data.length; i++) {
                        const element = res.data[i];
                        if (element.username != active_user_data.username) {
                            $("#user_search_result").append(`
                                <div class="user-card-wrapper" onclick="profile_view('${element.username}')">
                                    <div class="user-card-image ${element.username}profile_picture" style="background-image:url('res/media/loading.jpg');"></div>
                                    <div class="user-card-data">
                                        <div class="user-card-profile-name">${element.profile_name}</div>
                                        <div class="user-card-username">${element.username}</div>
                                    </div>
                                </div>
                            `);
                            fetch_user_image(element.username);
                        }
                    }
                }
            }
        );
    }
}

function link_profile_picture(picture) {
    if (picture) {
        return "data:image/jpeg;base64," + picture;
    } else {
        return profile_picture_url;
    }
}

function fetch_user_image(username, no_cache = false) {
    if (!no_cache && user_image_cache[username]) {
        $("." + username + "profile_picture").css(
            "background-image",
            "url(" + link_profile_picture(user_image_cache[username]) + ")"
        );
    } else {
        request_server(
            "api/fetch_user_image/",
            { username: username },
            (res) => {
                user_image_cache[username] = res.data;
                $("." + username + "profile_picture").css(
                    "background-image",
                    "url(" + link_profile_picture(res.data) + ")"
                );
            },
            false
        );
    }
}

function fetch_user_data(username, callback) {
    request_server(
        "api/fetch_user_data/",
        { username: username },
        (res) => {
            callback(res.data);
        },
        false
    );
}

function user_friends_view() {
    var friend_list = $("#user_friend_list");
    var friend_request_list = $("#user_friend_request_list");

    friend_list.html(
        `<div class="d-flex flex-grow-1 justify-content-center align-items-center fade-pop"><div class="spinner-border text-secondary"></div></div>`
    );
    friend_request_list.html(
        `<div class="d-flex flex-grow-1 justify-content-center align-items-center fade-pop"><div class="spinner-border text-secondary"></div></div>`
    );

    request_server(
        "api/get_friend_list/",
        {
            active_user: active_user_data.username,
        },
        (res) => {
            friend_list.html("");
            if (!res.data.length) {
                friend_list.html(
                    `<div class="d-flex flex-grow-1 justify-content-center align-items-center"><div class="fade-pop fw-600">No Friends</div></div>`
                );
            } else {
                for (let i = 0; i < res.data.length; i++) {
                    fetch_user_data(res.data[i].secondary_user, (data) => {
                        friend_list.append(`
                            <div class="user-card-wrapper">
                                <div class="user-card-image ${data.username}profile_picture" style="background-image:url('res/media/loading.jpg');" onclick="profile_view('${data.username}')"></div>
                                <div class="user-card-data" onclick="chat_view('${data.username}')">
                                    <div class="user-card-profile-name">${data.profile_name}</div>
                                    <div class="user-card-username">${data.username}</div>
                                </div>
                            </div>
                        `);
                        fetch_user_image(data.username);
                    });
                }
            }
        }
    );
    request_server(
        "api/get_friend_request_list/",
        {
            active_user: active_user_data.username,
        },
        (res) => {
            friend_request_list.html("");
            if (!res.data.length) {
                friend_request_list.html(
                    `<div class='d-flex flex-grow-1 justify-content-center align-items-center'><div class='fade-pop fw-600'>No Requests</div></div>`
                );
            } else {
                for (let i = 0; i < res.data.length; i++) {
                    fetch_user_data(res.data[i].secondary_user, (data) => {
                        friend_request_list.append(`
                            <div class="user-card-wrapper">
                                <div class="user-card-image ${data.username}profile_picture" style="background-image:url('res/media/loading.jpg');"></div>
                                <div class="user-card-data" onclick="profile_view('${data.username}');">
                                    <div class="user-card-profile-name">${data.profile_name}</div>
                                    <div class="user-card-username">${data.username}</div>
                                </div>
                                <div class="d-flex align-items-center">
                                    <button class="btn fs-12 btn-outline-secondary" onclick="accept_friend_request('${data.username}')">Accept</button>
                                </div>
                            </div>
                        `);
                        fetch_user_image(data.username);
                    });
                }
            }
        }
    );
}

function profile_view(username, reload = false) {
    // console.clear();
    console.log("************************************");
    fetch_user_data(username, (data) => {
        other_user_data = data;
        if (!reload) view("profile_page");
        $(".other-user-username").text(data.username);
        $(".other-user-profile-name").text(data.profile_name);
        $(".other-user-profile-about").text(data.profile_about);
        $(".other-user-profile-picture").addClass(
            data.username + "profile_picture"
        );
        fetch_user_image(data.username);
        request_server(
            "api/check_friendship/",
            {
                active_user: active_user_data.username,
                other_user: username,
            },
            (res) => {
                var res = res.data;
                var div = $("#profile_page_controls");
                div.html("");
                console.log("[DEBUG]", res);
                if (res == null) {
                    div.html(
                        '<button class="btn btn-danger w-100" onclick="toggle_friend_request(\'' +
                            other_user_data.username +
                            "');\">Request</button>"
                    );
                } else if (res == "sent_request") {
                    div.html(
                        '<button class="btn btn-outline-secondary w-100" onclick="toggle_friend_request(\'' +
                            other_user_data.username +
                            "');\">Cancel</button>"
                    );
                } else if (res == "received_request") {
                    div.html(
                        '<button class="btn btn-secondary w-100" onclick="accept_friend_request(\'' +
                            other_user_data.username +
                            "');\">Accept</button>"
                    );
                } else if (res == "friends") {
                    div.html(
                        '<button class="btn btn-secondary flex-grow-1" onclick="chat_view(\'' +
                            other_user_data.username +
                            '\')">Message</button><div class="mx-1"></div><button class="btn btn-danger flex-grow-1" onclick="remove_friend_confirmation(\'' +
                            other_user_data.username +
                            "')\">Remove</button>"
                    );
                }
            }
        );
    });
}

function chat_view(username) {
    fetch_user_data(username, (data) => {
        other_user_data = data;
        get_messages();
        $(".other-user-profile-name").text(other_user_data.profile_name);
        $(".other-user-username").text(other_user_data.username);
        $(".other-user-profile-picture").click(() => {
            profile_view(other_user_data.username);
        });
        $(".other-user-profile-picture").addClass(
            other_user_data.username + "profile_picture"
        );
        fetch_user_image(other_user_data.username);
    });
    view("user_chat");
    $("#message_input").focus();
}

function accept_friend_request(username) {
    request_server(
        "api/accept_friend_request/",
        {
            active_user: active_user_data.username,
            other_user: username,
        },
        (res) => {
            if (current_view == "profile_page") profile_view(username, true);
            user_friends_view();
        }
    );
}

function toggle_friend_request(username) {
    request_server(
        "api/toggle_friend_request/",
        {
            active_user: active_user_data.username,
            other_user: username,
        },
        (res) => {
            profile_view(username, true);
        }
    );
}

function remove_friend(username) {
    request_server(
        "api/remove_friend/",
        {
            active_user: active_user_data.username,
            other_user: username,
        },
        (res) => {
            profile_view(username, true);
            user_friends_view();
        }
    );
}

function user_profile_view() {
    $(".active-user-profile-name").text(active_user_data.profile_name);
    $(".active-user-username").text(active_user_data.username);
    $(".active-user-email-address").text(active_user_data.email_address);
    $(".active-user-profile-about").text(active_user_data.profile_about);
    $(".active-user-profile-picture").addClass(
        active_user_data.username + "profile_picture"
    );
    fetch_user_image(active_user_data.username, true);
}

function remove_friend_confirmation(username) {
    show_error_popup(
        "",
        `You are about to remove <strong>${other_user_data.profile_name}</strong> from your friends. You will no longer be able to message each other.`,
        "Remove Friend",
        `<div class="btn btn-danger px-5 shadow-sm" onclick="remove_friend('${other_user_data.username}')">Remove</div>`
    );
}

function send_message(e) {
    e.preventDefault();
    var message = $("#message_input")
        .val()
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    if (!message) return;
    request_server(
        "api/send_message/",
        {
            active_user: active_user_data.username,
            other_user: other_user_data.username,
            message: message,
        },
        (res) => {
            $("#message_input").val("");
            get_messages();
        },
        false
    );
}

var messages_cache = Array({
    length: null,
    status: null,
});

function get_messages() {
    var chat_window = $("#chat_window");
    request_server(
        "api/get_messages/",
        {
            active_user: active_user_data.username,
            other_user: other_user_data.username,
        },
        (res) => {
            if (res.data) {
                console.log("=+================================", res.data);
                if (
                    messages_cache["length"] == res.data.length &&
                    messages_cache["status"] ==
                        res.data[res.data.length - 1].message_status
                )
                    return;
                messages_cache["length"] = res.data.length;
                messages_cache["status"] =
                    res.data[res.data.length - 1].message_status;

                var extra = "";

                if (res.data[res.data.length - 1].message_status == "3") {
                    extra = `<div class="message-status-indicator">Seen</div>`;
                } else if (
                    res.data[res.data.length - 1].message_status == "2"
                ) {
                    extra = `<div class="message-status-indicator">Delivered</div>`;
                } else if (
                    res.data[res.data.length - 1].message_status == "1"
                ) {
                    extra = `<div class="message-status-indicator">Sent</div>`;
                }
                chat_window.html("");
                for (let i = 0; i < res.data.length; i++) {
                    let data = res.data[i];
                    let message_direction;
                    if (data.sender == active_user_data.username) {
                        message_direction = "sent";
                    } else if (data.recipient == active_user_data.username) {
                        message_direction = "received";
                    }
                    let message_states = ["", "done", "done_all", "done_all"];
                    var added_style = "";
                    var time = data.message_time.split(" ")[1];
                    var time = time.split(":")[0] + ":" + time.split(":")[1];
                    if (data.message_status == "3") {
                        added_style = "text-success";
                    }

                    var message_text =
                        data.message_status == "4"
                            ? `<i class='text-muted'>This message was deleted</i>`
                            : data.message_text;

                    chat_window.append(
                        `<div class="message-body-${message_direction}" ${
                            message_direction == "sent" && data.message_status != "4"
                                ? `onclick="message_click('${data.message_id}')"`
                                : ``
                        }>
                            <div class="message-content">${message_text}</div>
                            <div class="message-meta">
                                <div class="message-time">${time}</div>
                                <div class="message-status ${added_style}">${
                            message_states[data.message_status]
                        }</div>
                            </div>
                        </div>`
                    );
                    if (
                        i == res.data.length - 1 &&
                        data.sender == active_user_data.username
                    ) {
                        chat_window.append(extra);
                    }
                }
                setTimeout(() => {
                    // chat_window.scrollTop(chat_window[0].scrollHeight);
                    chat_window.animate(
                        {
                            scrollTop: chat_window.prop("scrollHeight"),
                        },
                        500
                    );
                }, 200);
            } else {
                chat_window.html("");
            }
        },
        false
    );
}

var conversations_cache;

function get_conversations() {
    var conversations_window = $("#conversations_window");
    // conversations_window.html(
    //     "<div class='d-flex flex-grow-1 justify-content-center align-items-center fade-pop'><div class='spinner-border text-secondary'></div></div>"
    // );
    request_server(
        "api/get_conversations/",
        {
            active_user: active_user_data.username,
        },
        (res) => {
            if (res.data) {
                if (conversations_cache == res.data[0].new_messages) {
                    // console.log("no change");
                    // console.log(conversations_cache);
                    // console.log(res.data[0].new_messages);
                    return;
                }
                // console.log("change");
                conversations_cache = res.data[0].new_messages;
                conversations_window.html("");

                for (let i = 0; i < res.data.length; i++) {
                    let temp_data = res.data[i];
                    let new_messages = temp_data.new_messages;

                    let username_element = "";
                    let meta_element = "";

                    if (new_messages > 0) {
                        username_element = `<div class="user-card-username fw-600 text-danger">${new_messages} new messages</div>`;
                        meta_element = `<div class="user-card-meta"><div class="user-card-new-messages">${new_messages}</div></div>`;
                    }

                    fetch_user_data(temp_data.second_user, (data) => {
                        conversations_window.append(
                            `<div class="user-card-wrapper">
                                <div class="user-card-image ${data.username}profile_picture" style="background-image:url('res/media/loading.jpg');" onclick="profile_view('${data.username}')"></div>
                                <div class="user-card-data" onclick="chat_view('${data.username}')">
                                    <div class="user-card-profile-name">${data.profile_name}</div>
                                    ${username_element}
                                </div>
                                ${meta_element}
                            </div>`
                        );
                        fetch_user_image(data.username);
                    });
                }
            }
        },
        false
    );
}

function profile_picture_update(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
        let div = $(".profile-picture-placeholder");
        // `user_profile_picture_edit_input`;
        div.css("background-image", "url(" + e.target.result + ")");

        let update_form = new FormData();
        update_form.append("username", active_user_data.username);
        update_form.append("profile_picture", file);

        $.ajax({
            type: "POST",
            url: server_url + "api/update_profile/",
            data: update_form,
            processData: false,
            contentType: false,
            success: (res) => {
                if (res.status) {
                    active_user_data.profile_picture = res.data;
                    user_profile_view();
                    localStorage.setItem(
                        "active_user_data",
                        JSON.stringify(active_user_data)
                    );
                } else show_error_popup(res);
            },
            error: (err) => {
                show_error_popup(err);
            },
        });

        // request_server(
        //     "api/update_profile/",
        //     {
        //         username: active_user_data.username,
        //         profile_picture: e.target.result,
        //     },
        //     (res) => {}
        // );
    };
    reader.readAsDataURL(file);
}

function update_profile_name() {
    show_error_popup(
        null,
        `<form>
            <input type="text" class="form-control m-input mb-4" id="update_profile_name_input" placeholder="Name" value="${active_user_data.profile_name}">
            <div class="d-flex justify-content-end">
            <div class="btn btn-danger" onclick="update_profile()">Done</div>
            </div>
        </form>`,
        "Name",
        ``
    );
    setTimeout(() => {
        $("#update_profile_name_input").focus();
    }, 200);
}
function update_profile_about() {
    show_error_popup(
        null,
        `<form>
            <input type="text" class="form-control m-input mb-4" id="update_profile_about_input" placeholder="About" value="${active_user_data.profile_about}">
            <div class="d-flex justify-content-end">
            <div class="btn btn-danger" onclick="update_profile()">Done</div>
            </div>
        </form>`,
        "About",
        ``
    );
    setTimeout(() => {
        $("#update_profile_about_input").focus();
    }, 200);
}
function update_profile() {
    let profile_name = $("#update_profile_name_input").val();
    let profile_about = $("#update_profile_about_input").val();

    var data = {
        username: active_user_data.username,
    };

    if (profile_name) {
        data["profile_name"] = profile_name;
        active_user_data.profile_name = profile_name;
    }
    if (profile_about) {
        data["profile_about"] = profile_about;
        active_user_data.profile_about = profile_about;
    }
    console.log(data);
    request_server("api/update_profile/", data, (res) => {
        user_profile_view();
        localStorage.setItem(
            "active_user_data",
            JSON.stringify(active_user_data)
        );
    });
}

var current_message_id = null;

function message_click(id) {
    current_message_id = id;
    overlay("menu_chat_view");
}

function delete_message() {
    var message_id = current_message_id;
    request_server(
        "api/delete_message/",
        {
            message_id: message_id,
        },
        (res) => {
            if (res.status) {
                messages_cache = Array();
                overlay();
                chat_view(other_user_data.username);
            } else show_error_popup(res);
        },
        false
    );
}
