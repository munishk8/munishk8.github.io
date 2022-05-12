function profileSignin(e) {
    e.preventDefault();
    let usernameInput = $("#signin_username_input");
    let passwordInput = $("#signin_password_input");
    let submitButton = $("#signin_submit_button");

    $("#signin_incorrect").removeClass("is-invalid");

    if (usernameInput.val() == "") {
        usernameInput.addClass("is-invalid");
        submitButton.addClass("disabled");
    } else if (passwordInput.val() == "") {
        passwordInput.addClass("is-invalid");
        submitButton.addClass("disabled");
    } else {
        submitButton.removeClass("disabled");
        usernameInput.removeClass("is-invalid");
        passwordInput.removeClass("is-invalid");

        requestServer(
            "api/profileSignin/",
            {
                profileUsername: usernameInput.val().toLowerCase(),
                profilePassword: passwordInput.val(),
            },
            async (data) => {
                if (data.signinStatus) {
                    localStorage.setItem("activeUserData", JSON.stringify(data.userData));
                    localStorage.setItem("isUserLoggedIn", true);
                    activeUserData = data.userData;

                    requestServer("api/getVAPIDKeys/", {}, async (data) => {
                        VAPIDPublicKey = data.publicKey;
                        const applicationServerKey = urlB64ToUint8Array(VAPIDPublicKey);
                        const options = {
                            applicationServerKey,
                            userVisibleOnly: true,
                        };
                        try {
                            let pushSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
                            if (pushSubscription) {
                                await pushSubscription.unsubscribe();
                                console.log("Service Worker: Registering Push after unsubscribing");
                                pushSubscription = await serviceWorkerRegistration.pushManager.subscribe(options);
                                requestServer(
                                    "api/saveProfileEndpoint/",
                                    {
                                        profileID: activeUserData.profileID,
                                        endpoint: JSON.stringify(pushSubscription),
                                    },
                                    (data) => {
                                        window.history.pushState(null, null, "index.html");
                                        window.location.reload();
                                    }
                                );
                            } else {
                                console.log("Service Worker: Registering Push");
                                pushSubscription = await serviceWorkerRegistration.pushManager.subscribe(options);
                                requestServer(
                                    "api/saveProfileEndpoint/",
                                    {
                                        profileID: activeUserData.profileID,
                                        endpoint: JSON.stringify(pushSubscription),
                                    },
                                    (data) => {
                                        window.history.pushState(null, null, "./");
                                        window.location.reload();
                                    }
                                );
                            }
                        } catch (err) {
                            console.log("Service Worker: Error Registering Push", err);
                            error();
                        }
                    });
                } else {
                    $("#signin_incorrect").addClass("is-invalid");
                }
            }
        );
    }
}
function profileSignout() {
    popupPrompt("Sign Out", "Are you sure you want to sign out of your account?");
    popupPromptCallback = (action) => {
        if (action) {
            requestServer(
                "api/profileSignout/",
                {
                    profileID: activeUserData.profileID,
                },
                (data) => {
                    localStorage.clear();
                    window.history.pushState(null, null, "./");
                    window.location.reload();
                }
            );
        }
    };
}
