function passwordResetSendVerificationCode(e) {
    e.preventDefault();

    let input = $("#passwordResetEmailInput");
    let profileEmail = input.val();
    let submitButton = $("#passwordResetEnterEmailSubmitButton");
    let invalidFeedback = $("#passwordResetEmailInvalidFeedback");
    if (
        profileEmail.match(
            "^([a-zA-Z0-9-._]+)[@]([a-zA-Z0-9]+)[.]([a-zA-Z0-9]{2,4})$"
        ) === null
    ) {
        invalidFeedback.text("Please enter a valid email address");
        input.addClass("is-invalid");
        submitButton.addClass("disabled");
    } else {
        requestServer(
            "api/isProfileEmailAvailable/",
            {
                profileEmail: input.val(),
            },
            (data) => {
                if (!data.available) {
                    input.removeClass("is-invalid");
                    submitButton.removeClass("disabled");
                    popupMessage(
                        "Email Verification",
                        "An email is being sent to your email address. Please use the given verification code to verify your email address.",
                        `<div class="spinner-border text-secondary"></div>`
                    );
                    requestServer(
                        "api/sendVerificationCode/",
                        {
                            profileEmail: profileEmail,
                        },
                        (data) => {
                            var hash = bcrypt.hashSync(
                                data.verificationCode.toString(),
                                10
                            );
                            localStorage.setItem(
                                "passwordResetVerificationCode",
                                hash
                            );
                            submitButton.addClass("disabled");
                            popupMessage(
                                "Email Verification",
                                "An email is being sent to your email address. Please use the given verification code to verify your email address.",
                                `<div class="btn btn-danger  px-5" onclick="activity('activity-password-reset-verify-email')">Next</div>`
                            );
                        },
                        false
                    );
                } else {
                    invalidFeedback.text("");
                    // invalidFeedback.text(
                    //     "This email address is not registered with us."
                    // );
                    input.addClass("is-invalid");
                    submitButton.addClass("disabled");
                    popupMessage(
                        "No Account Found",
                        "Sorry, we couldn't find an account with this email address.",
                        `<div class="btn btn-danger  px-5" onclick="popup()">Try again</div>`
                    );
                }
            }
        );
    }
}
function passwordResetVerifyEmailClearErrors() {
    let input = $("#passwordResetVerificationCodeInput");
    let submit_button = $("#passwordResetVerifyEmailSubmitButton");

    if (input.val().match("^(\\d{6})$") !== null) {
        input.removeClass("is-invalid");
        submit_button.removeClass("disabled");
    }
}
function passwordResetVerifyVerificationCode(e) {
    e.preventDefault();

    if (localStorage.getItem("passwordResetVerificationCode") == null) {
        popupMessage(
            "Expired",
            "Your OTP has been expired. Please send the OTP again.",
            `<div class="btn btn-danger  px-5" onclick="activity('activity-password-reset-enter-email')">Try again</div>`
        );
        return;
    }

    let input = $("#passwordResetVerificationCodeInput");
    let verificationCode = input.val();
    let submit_button = $("#passwordResetVerifyEmailSubmitButton");
    let invalid_feedback = $("#passwordResetVerificationCodeInvalidFeedback");

    if (verificationCode.match("^(\\d{6})$") === null) {
        invalid_feedback.text("Please enter a valid code.");
        input.addClass("is-invalid");
        submit_button.addClass("disabled");
    } else {
        let hash = localStorage.getItem("passwordResetVerificationCode");
        if (bcrypt.compareSync(verificationCode, hash)) {
            localStorage.removeItem("passwordResetVerificationCode");
            activity("activity-password-reset-new-password");
        } else {
            submit_button.addClass("disabled");
            input.addClass("is-invalid");
            invalid_feedback.text("Incorrect verification code. Try again.");
        }
    }
}
function passwordResetValidateNewPassword() {
    let input = $("#passwordResetNewPasswordInput");
    let password = input.val();
    let invalid_feedback = $("#passwordResetNewPasswordInvalidFeedback");
    let submit_button = $("#passwordResetNewPasswordSubmitButton");

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
function passwordResetNewPassword(e) {
    e.preventDefault();

    let newPassword = $("#passwordResetNewPasswordInput").val();
    let confirmPassword = $("#passwordResetConfirmPasswordInput").val();

    if (passwordResetValidateNewPassword()) {
        if (newPassword == confirmPassword) {
            requestServer(
                "api/resetProfilePassword/",
                {
                    profileEmail: $("#passwordResetEmailInput").val(),
                    newProfilePassword: newPassword,
                },
                (data) => {
                    popupMessage(
                        "Password Reset",
                        "Your password has been reset successfully.",
                        `<div class="btn btn-danger  px-5" onclick="activity('activity-signin')">Sign in</div>`
                    );
                }
            );
        } else {
            $("#passwordResetConfirmPasswordInput").addClass("is-invalid");
            $("#passwordResetConfirmPasswordInvalidFeedback").text(
                "Passwords do not match."
            );
        }
    }
}
