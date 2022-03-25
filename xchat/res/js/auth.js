function signup_is_email_address_available() {
    let input = $("#signup_email_address_input");
    let submit_button = $("#signup_1_submit_button");
    let invalid_feedback = $("#signup_email_address_invalid_feedback");

    request_server(
        "api/is_email_address_available/",
        {
            email_address: input.val(),
        },
        (res) => {
            if (res.data) {
                input.removeClass("is-invalid");
                submit_button.removeClass("disabled");
            } else {
                invalid_feedback.text("This email address is already in use.");
                input.addClass("is-invalid");
                submit_button.addClass("disabled");
            }
        }
    );
}

function signup_send_verification_code(e) {
    e.preventDefault();
    let input = $("#signup_email_address_input");
    let email_address = input.val();
    let submit_button = $("#signup_1_submit_button");
    let invalid_feedback = $("#signup_email_address_invalid_feedback");
    if (
        email_address.match(
            "^([a-zA-Z0-9-._]+)[@]([a-zA-Z0-9]+)[.]([a-zA-Z0-9]{2,4})$"
        ) === null
    ) {
        invalid_feedback.text("Please enter a valid email address");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else {
        $("#popup_title").text("Email Verification");
        $("#popup_text").text(
            "An email is being sent to your email address. Please use the given verification code to verify your email address."
        );
        $("#popup_control").html(
            '<div class="spinner-border text-secondary"></div>'
        );
        overlay("popup");
        request_server(
            "api/send_verification_code/",
            {
                email_address: email_address,
            },
            (res) => {
                signup_verification_code_saved = res.data.verification_code;
                $("#popup_control").html(
                    `<div class="btn btn-danger shadow-sm px-5" onclick="view('signup_2')">Next</div>`
                );
                overlay("popup");
            },
            false
        );
    }
}

function signup_2_clear_error() {
    let input = $("#signup_verification_code_input");
    let submit_button = $("#signup_2_submit_button");

    if (input.val().match("^(\\d{6})$") !== null) {
        input.removeClass("is-invalid");
        submit_button.removeClass("disabled");
    }
}

function signup_verify_verification_code(e) {
    e.preventDefault();

    let input = $("#signup_verification_code_input");
    let verification_code = input.val();
    let submit_button = $("#signup_2_submit_button");
    let invalid_feedback = $("#signup_verification_code_invalid_feedback");

    if (verification_code.match("^(\\d{6})$") === null) {
        invalid_feedback.text("Please enter a valid code.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else {
        if (verification_code == signup_verification_code_saved) {
            view("signup_3");
        } else {
            submit_button.addClass("disabled");
            input.addClass("is-invalid");
            invalid_feedback.text("Incorrect verification code. Try again.");
        }
    }
}

function signup_check_username() {
    let input = $("#signup_username_input");
    let username = input.val();
    let invalid_feedback = $("#signup_username_invalid_feedback");
    let submit_button = $("#signup_3_submit_button");

    if (username == "") {
        invalid_feedback.text("Please enter username.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
        return false;
    } else if (username.match("^[a-zA-Z0-9_]+$") === null) {
        invalid_feedback.text(
            "Username can only have letters, numbers and underscores."
        );
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else {
        if (username.match("^.{4,30}$") === null) {
            invalid_feedback.text(
                "Should be atleast 4 characters and not more than 30."
            );
            input.addClass("is-invalid");
            submit_button.addClass("disabled");
        } else {
            request_server(
                "api/is_username_available/",
                {
                    username: username,
                },
                (res) => {
                    if (res.data) {
                        input.removeClass("is-invalid");
                        submit_button.removeClass("disabled");
                        flags["signup_allowed"] = true;
                    } else {
                        invalid_feedback.text("The username is already taken.");
                        input.addClass("is-invalid");
                        submit_button.addClass("disabled");
                    }
                }
            );
            if (flags["signup_allowed"]) return true;
        }
    }
}

function signup_check_password() {
    let input = $("#signup_password_input");
    let password = input.val();
    let invalid_feedback = $("#signup_password_invalid_feedback");
    let submit_button = $("#signup_3_submit_button");

    if (password == "") {
        invalid_feedback.text("Please enter password.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
        return false;
    } else if (password.match("^[A-Za-z0-9!@#$%&*]+$") === null) {
        invalid_feedback.text(
            "Password can only have letters, numbers and some special symbols."
        );
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else if (password.match(".{6,120}$") === null) {
        invalid_feedback.text("Password must contain atleast 6 chatacters.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else {
        input.removeClass("is-invalid");
        submit_button.removeClass("disabled");
        return true;
    }
}

function signup_3(e) {
    e.preventDefault();
    if (signup_check_username() && signup_check_password()) view("signup_4");
}

function signup_profile_picture_change(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
        let div = $(".profile-picture-placeholder");
        div.css("background-image", "url(" + e.target.result + ")");
    };
    reader.readAsDataURL(file);
}

function signup(e) {
    e.preventDefault();

    let name_input = $("#signup_name_input");
    let submit_button = $("#signup_4_submit_button");

    if (name_input.val() == "") {
        name_input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else {
        var signup_form = new FormData();

        signup_form.append(
            "email_address",
            $("#signup_email_address_input").val()
        );
        signup_form.append(
            "username",
            $("#signup_username_input").val().toLowerCase()
        );
        signup_form.append("password", $("#signup_password_input").val());
        signup_form.append("profile_name", $("#signup_name_input").val());
        signup_form.append(
            "profile_picture",
            $("#signup_profile_picture")[0].files[0]
        );

        $.ajax({
            type: "POST",
            url: server_url + "api/signup/",
            data: signup_form,
            processData: false,
            contentType: false,
            success: (res) => {
                if (res.status) {
                    show_error_popup(
                        "",
                        "Thank you for creating an account and joining us.",
                        "Your new account is all set.",
                        '<div class="btn btn-danger px-5" onclick="view(\'signin\');">Sign In</div>'
                    );
                } else show_error_popup(res);
            },
            error: (err) => {
                show_error_popup(err);
            },
        });
    }
}

function signin(e) {
    e.preventDefault();
    // overlay("loading_overlay");
    let username_input = $("#signin_username_input");
    let password_input = $("#signin_password_input");
    let submit_button = $("#signin_submit_button");

    $("#signin_incorrect").removeClass("is-invalid");

    if (username_input.val() == "") {
        username_input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else if (password_input.val() == "") {
        password_input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else {
        submit_button.removeClass("disabled");
        username_input.removeClass("is-invalid");
        password_input.removeClass("is-invalid");

        request_server(
            "api/signin/",
            {
                username: username_input.val().toLowerCase(),
                password: password_input.val(),
            },
            (res) => {
                if (res.data) {
                    localStorage.setItem(
                        "active_user_data",
                        JSON.stringify(res.data)
                    );
                    localStorage.setItem("user_logged_in", true);
                    active_user_data = res.data;
                    // view("user_home");
                    window.location.reload();
                } else {
                    $("#signin_incorrect").addClass("is-invalid");
                }
            }
        );
    }
}
