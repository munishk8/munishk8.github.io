function signupIsProfileEmailAvailable() {
    let input = $("#signup_email_address_input");
    let submit_button = $("#signup_1_submit_button");
    let invalid_feedback = $("#signup_email_address_invalid_feedback");

    requestServer(
        "api/isProfileEmailAvailable/",
        {
            profileEmail: input.val(),
        },
        (data) => {
            if (data.available) {
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
function signupSendVerificationCode(e) {
    e.preventDefault();
    let input = $("#signup_email_address_input");
    let profileEmail = input.val();
    let submitButton = $("#signup_1_submit_button");
    let invalidFeedback = $("#signup_email_address_invalid_feedback");
    if (profileEmail.match("^([a-zA-Z0-9-._]+)[@]([a-zA-Z0-9]+)[.]([a-zA-Z0-9]{2,4})$") === null) {
        invalidFeedback.text("Please enter a valid email address");
        input.addClass("is-invalid");
        submitButton.addClass("disabled");
    } else {
        popupMessage("Email Verification", "An email is being sent to your email address. Please use the given verification code to verify your email address.", `<div class="spinner-border text-secondary"></div>`);
        requestServer(
            "api/sendVerificationCode/",
            {
                profileEmail: profileEmail,
            },
            (data) => {
                var hash = bcrypt.hashSync(data.verificationCode.toString(), 10);
                localStorage.setItem("signupVerificationCode", hash);
                submitButton.addClass("disabled");
                popupMessage("Email Verification", "An email is being sent to your email address. Please use the given verification code to verify your email address.", `<div class="btn btn-danger  px-5" onclick="activity('activity-signup-verify-email')">Next</div>`);
            },
            false
        );
    }
}
function signupVerifyEmailClearErrors() {
    let input = $("#signup_verification_code_input");
    let submit_button = $("#signup_2_submit_button");

    if (input.val().match("^(\\d{6})$") !== null) {
        input.removeClass("is-invalid");
        submit_button.removeClass("disabled");
    }
}
function signupVerifyVerificationCode(e) {
    e.preventDefault();

    if (localStorage.getItem("signupVerificationCode") == null) {
        popupMessage("Expired", "Your OTP has been expired. Please send the OTP again.", `<div class="btn btn-danger  px-5" onclick="activity('activity-signup-enter-email')">Try again</div>`);
        return;
    }

    let input = $("#signup_verification_code_input");
    let verificationCode = input.val();
    let submit_button = $("#signup_2_submit_button");
    let invalid_feedback = $("#signup_verification_code_invalid_feedback");

    if (verificationCode.match("^(\\d{6})$") === null) {
        invalid_feedback.text("Please enter a valid code.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else {
        var hash = localStorage.getItem("signupVerificationCode");
        if (bcrypt.compareSync(verificationCode, hash)) {
            localStorage.removeItem("signupVerificationCode");
            activity("activity-signup-username-setup");
        } else {
            submit_button.addClass("disabled");
            input.addClass("is-invalid");
            invalid_feedback.text("Incorrect verification code. Try again.");
        }
    }
}
function signupValidateUsername(callback = null) {
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
        invalid_feedback.text("Username can only have letters, numbers and underscores.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
        return false;
    } else {
        if (username.match("^.{4,30}$") === null) {
            invalid_feedback.text("Should be atleast 4 characters and not more than 30.");
            input.addClass("is-invalid");
            submit_button.addClass("disabled");
        } else {
            requestServer(
                "api/isUsernameAvailable/",
                {
                    profileUsername: username,
                },
                (data) => {
                    if (data.available) {
                        input.removeClass("is-invalid");
                        submit_button.removeClass("disabled");
                        if (callback) {
                            callback();
                        }
                    } else {
                        invalid_feedback.text("The username is already taken.");
                        input.addClass("is-invalid");
                        submit_button.addClass("disabled");
                    }
                }
            );
        }
        // input.focus();
    }
}
function signupValidatePassword() {
    let input = $("#signup_password_input");
    let password = input.val();
    let invalid_feedback = $("#signup_password_invalid_feedback");
    let submit_button = $("#signup_3_submit_button");

    if (password == "") {
        invalid_feedback.text("Please enter password.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
        return false;
    } else if (password.match("^[A-Za-z0-9!@#$%&*_]+$") === null) {
        invalid_feedback.text("Password can only have letters, numbers and some special symbols.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
        return false;
    } else if (password.match(".{6,120}$") === null) {
        invalid_feedback.text("Password must contain atleast 6 chatacters.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
        return false;
    } else {
        input.removeClass("is-invalid");
        submit_button.removeClass("disabled");
        return true;
    }
}
function signupUsernameSetup(e) {
    e.preventDefault();
    signupValidateUsername(() => {
        if (signupValidatePassword()) {
            activity("activity-signup-profile-setup");
        } else {
            $("#signup_password_input").focus();
        }
    });
}
function profileSignup(e) {
    e.preventDefault();

    let name_input = $("#signup_name_input");
    let submit_button = $("#signup_4_submit_button");

    if (name_input.val() == "") {
        name_input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else {
        var signup_form = new FormData();

        signup_form.append("profileEmail", $("#signup_email_address_input").val());
        signup_form.append("profileUsername", $("#signup_username_input").val().toLowerCase());
        signup_form.append("profilePassword", $("#signup_password_input").val());
        signup_form.append("profileName", $("#signup_name_input").val());
        signup_form.append("profileIcon", $("#signup_profile_picture")[0].files[0]);

        loading();
        $.ajax({
            url: serverURL + "api/profileSignup/",
            type: "POST",
            data: signup_form,
            processData: false,
            contentType: false,
            success: function (res) {
                if (res.status) {
                    loading(false);
                    $(".m-input").val("");
                    popupMessage("Your new account is all set.", "Thank you for creating an account and joining us.", '<div class="btn btn-danger px-5" onclick="activity(\'activity-signin\');popup();">Sign In</div>', false);
                } else {
                    console.log(res);
                    error();
                }
            },
            error: function (err) {
                console.log(err);
                error();
            },
        });
    }
}
