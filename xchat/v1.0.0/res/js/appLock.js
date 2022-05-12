function verifyAppLockPin(e) {
    e.preventDefault();
    let input = $("#appLockPINInput");
    if (bcrypt.compareSync(input.val(), localStorage.getItem("appLockPIN"))) {
        activity("activity-dashboard");
    } else {
        input.addClass("is-invalid");
    }
}
function confirmAppLockPin(e) {
    e.preventDefault();
    let input = $("#appLockPINSetInput0");
    if (input.val().match("^(\\d{4})$") === null) {
        input.addClass("is-invalid");
        return;
    } else {
        activity("activity-app-lock-create-pin-confirm", false, false);
    }
}
function setAppLockPin(e) {
    e.preventDefault();
    let input = $("#appLockPINSetInput1");
    let pin = input.val();
    if (pin.match("^(\\d{4})$") === null) {
        input.addClass("is-invalid");
        return;
    } else {
        if (pin == $("#appLockPINSetInput0").val()) {
            localStorage.setItem("appLockPIN", bcrypt.hashSync(pin, 10));
            activity("activity-settings", true, false);
            popupMessage("Success", "App lock PIN set successfully.", closeButton, false);
        } else {
            input.addClass("is-invalid");
        }
    }
}
function disableAppLock() {
    if (localStorage.getItem("appLockPIN") === null) {
        popupMessage("Lock isn't Activated", "You haven't set a PIN yet. Please use create pin option to setup lock.");
    } else {
        popupPrompt("Disable App Lock", "Are you sure you want to disable the app lock?");
        popupPromptCallback = function () {
            localStorage.removeItem("appLockPIN");
            activity("activity-settings", true, false);
        };
    }
}
