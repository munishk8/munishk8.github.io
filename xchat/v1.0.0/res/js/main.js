// const serverURL = "https://localhost/XCHAT/server/";
// const serverURL = "https://192.168.1.100/XCHAT/server/";
const serverURL = "https://munish11.000webhostapp.com/XCHAT/v1.0.0/server/";

var currentActivity = null;
var activityHistory = [];
var activityHistory = localStorage.getItem("activityHistory") ? JSON.parse(localStorage.getItem("activityHistory")) : [];
var activityLag = [];
var closeButton = `<button id="popup-message-close-button" class="btn btn-danger px-5  overflow-auto" onclick="popup();">Close</button>`;
var activeUserData = {};
var otherUserData = {};
var activityMessagingMessageType = "";
var currentTab = "";
var isCurrentPopupDismissable = true;
var bcrypt = dcodeIO.bcrypt;
var permission;
var isBrowserSupported = false;
var VAPIDPublicKey = null;
var serviceWorkerRegistration = null;
var pushSubscription = null;
var debug = true;
var activeGroupID = null;
// var activeGroupID = 505;

var flags = {
    activityLock: false,
    ongoingServerRequest: false,
    signupAllowed: false,
};
let popupInputCallback = (value) => {
    popupMessage(value);
};
function inputImagePreview(e, element) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
        element.css("background-image", "url(" + e.target.result + ")");
    };
    reader.readAsDataURL(file);
}
function activity(id, back = false, keepHistory = true) {
    if (flags["activityLock"]) {
        activityLag.push({
            id: id,
            back: back,
        });
        return;
    } else {
        flags["activityLock"] = true;
        if (!id || !$("#" + id).html()) {
            id = "activity-fallback";
        }
        if (currentActivity == id) {
            flags["activityLock"] = false;
            return false;
        }
        let lastActivity = currentActivity;
        currentActivity = id;
        setTimeout(() => {
            if (!back && lastActivity) {
                if (keepHistory) {
                    activityHistory.push(lastActivity);
                    localStorage.setItem("activityHistory", JSON.stringify(activityHistory));
                    window.history.pushState(null, null, "?activity=" + id);
                }
            }
            $(".activity").removeClass("activity-back-in");
            $(".activity").removeClass("activity-visible");
            $(".activity").removeClass("activity-visible-reload");

            $("#" + lastActivity).addClass("activity-visible");
            $("#" + lastActivity).addClass("activity-out");

            $("#" + id).addClass("activity-visible");
            if (back) $("#" + id).addClass("activity-back-in");

            if (isCurrentPopupDismissable) {
                popup();
            }
            prepareActivity(id);
            setTimeout(() => {
                $("#" + lastActivity).removeClass("activity-visible");
                $("#" + lastActivity).removeClass("activity-out");

                flags["activityLock"] = false;

                if (activityLag.length) {
                    next = activityLag.pop();
                    activity(next.id, next.back);
                }
            }, 500);
        }, 200);
    }
}
function activityBack() {
    if (flags["activityLock"]) {
        return false;
    }
    window.history.back();
    let last = activityHistory.pop();
    localStorage.setItem("activityHistory", JSON.stringify(activityHistory));
    if (last) {
        if (last == "activity-dashboard") {
            getProfileConversations();
        }
        activity(last, true);
    } else {
        activity("activity-gettingStarted");
    }
}
function popup(id = null) {
    $("input").blur();
    if (id) {
        setTimeout(() => {
            $(".popup").removeClass("popup-visible");
            $("#" + id).addClass("popup-visible");
            $(".popup-backdrop").removeClass("popup-backdrop-out");
            $(".popup-window").removeClass("popup-window-out");
        }, 100);
    } else {
        isCurrentPopupDismissable = true;
        setTimeout(() => {
            $(".popup-backdrop").addClass("popup-backdrop-out");
            $(".popup-window").addClass("popup-window-out");
            setTimeout(() => {
                $(".popup").removeClass("popup-visible");
            }, 200);
        }, 0);
    }
}
function loading(state = true) {
    let loadingActivity = $("#activity-loading");
    if (state) {
        loadingActivity.removeClass("activity-static-out");
        loadingActivity.addClass("activity-static-visible");
    } else {
        loadingActivity.addClass("activity-static-out");
        setTimeout(() => {
            loadingActivity.removeClass("activity-static-visible");
        }, 200);
    }
}
function popupMessage(messageLabel = "", messageText = "", messageControls = closeButton, dismissable = true) {
    isCurrentPopupDismissable = dismissable;
    $("#popup-message-label").html(messageLabel);
    $("#popup-message-text").html(messageText);
    $("#popup-message-controls").html(messageControls);
    $("#popup-message-backdrop").attr("onclick", `${dismissable ? "popup();" : ""}`);
    popup("popup-message");
    setTimeout(() => {
        $("#popup-message-close-button").focus();
    }, 500);
}
function error() {
    loading(false);
    popupMessage("Aww Snap!", "Something went wrong. Please try again later.", closeButton, false);
}
function popupInput(label = "Enter Value", value = "", placeholder = "Type here...", type = "text") {
    let input = $("#popup-input-input");
    let labelElement = $("#popup-input-label");
    labelElement.html(label);
    input.attr("placeholder", placeholder);
    input.attr("type", type);
    input.val(value);
    popup("popup-input");
    setTimeout(() => {
        input.focus();
    }, 300);
}
window.onpopstate = () => {
    activityBack();
};

var profileCardLag = [];
var profileCardLock = false;

function profileCard(container, contentLabel = "", contentTextActive = "", contentText = "", image = "", controlButtonLabel = "", controlButtonAction = "", newNotifications = 0, contentClickAction = "", imageClickAction = "", controlButtonStyle = "btn-danger", cardType = "profile") {
    if (profileCardLock) {
        console.log("profileCard locked");
        profileCardLag.push({
            container: container,
            contentLabel: contentLabel,
            contentTextActive: contentTextActive,
            contentText: contentText,
            image: image,
            controlButtonLabel: controlButtonLabel,
            controlButtonAction: controlButtonAction,
            newNotifications: newNotifications,
            contentClickAction: contentClickAction,
            imageClickAction: imageClickAction,
            controlButtonStyle: controlButtonStyle,
            cardType: cardType,
        });
        return;
    } else {
        console.log("profile card");
        profileCardLock = true;
        let controlButton = `<button class="btn btn-sm w-100 ${controlButtonStyle}" onclick="${controlButtonAction}">${controlButtonLabel}</button>`;
        let notificationBadge = `<div class="profile-card-meta-badge">${newNotifications}</div>`;
        let element = `
        <div class="profile-card fade-pop">
            <div class="profile-card-image" style="background-image: url('${image}');${cardType == "group" ? "" : ""}" onclick="${imageClickAction}"></div>
            <div class="profile-card-content" onclick="${contentClickAction}">
                <div class="profile-card-label">
                    <div>${contentLabel}</div>
                </div>
                <div class="profile-card-text-active">
                    <div>${contentTextActive}</div>
                </div>
                <div class="profile-card-text">
                    ${contentText}
                </div> 
            </div>
            <div class="profile-card-meta">
                ${controlButtonLabel ? controlButton : ""}
                ${newNotifications ? notificationBadge : ""}
            </div>
        </div>`;
        container.append(element);
        profileCardLock = false;
        if (profileCardLag.length) {
            console.log("tacking lack");
            let next = profileCardLag.pop();
            profileCard(next.container, next.contentLabel, next.contentTextActive, next.contentText, next.image, next.controlButtonLabel, next.controlButtonAction, next.newNotifications, next.contentClickAction, next.imageClickAction, next.controlButtonStyle, next.cardType);
        }
    }
}
function requestServer(url, data, callback, showLoading = true) {
    flags["ongoingServerRequest"] = true;
    setTimeout(() => {
        if (showLoading && flags["ongoingServerRequest"]) loading();
    }, 1000);
    $.post(serverURL + url, data)
        .then((res) => {
            flags["ongoingServerRequest"] = false;

            if (debug) {
                console.log("~", url, res);
            }

            if (res.status) {
                loading(false);
                callback(res.data);
            } else {
                // console.log(res);
                error();
            }
        })
        .catch((err) => {
            flags["ongoingServerRequest"] = false;
            console.log(err);
            error();
        });
}
function requestServerForm(url, data, callback, showLoading = true) {
    flags["ongoingServerRequest"] = true;
    setTimeout(() => {
        if (showLoading && flags["ongoingServerRequest"]) loading();
    }, 1000);
    $.ajax({
        url: serverURL + url,
        type: "POST",
        data: data,
        processData: false,
        contentType: false,
        success: (res) => {
            flags["ongoingServerRequest"] = false;

            if (debug) {
                console.log("~", url, res);
            }

            if (res.status) {
                loading(false);
                callback(res.data);
            } else {
                console.log(res);
                error();
            }
        },
        error: (err) => {
            flags["ongoingServerRequest"] = false;
            console.log(err);
            error();
        },
    });
}
var popupPromptCallback = () => {
    alert("Not implemented yet!");
};
function popupPrompt(label = "Are you sure ?", text = "Do you want to perform the specified action", confirmLabel = "Yes", cancelLabel = "No", dismissable = true) {
    popupMessage(
        label,
        text,
        `<div class="d-flex w-100">
            ${confirmLabel ? `<button class="btn btn-danger flex-grow-1" onclick="popupPromptCallback(true); popup();">${confirmLabel}</button>` : ``}
            <div class="m-1"></div>
            ${cancelLabel ? `<button class="btn btn-outline-secondary flex-grow-1" onclick="popupPromptCallback(false); popup();">${cancelLabel}</button>` : ``}
        </div > `,
        dismissable
    );
}
function tabs(tabContainer, tabID, elem) {
    // alert("cll");
    $(`#${tabContainer}Container`).css("transform", `translateX(-${tabID * 100}vw) translateZ(0)`);
    $(`#${tabContainer}Header`).children(".tab-header").removeClass("tab-header-active");
    $(elem).addClass("tab-header-active");
    currentTab = tabContainer + tabID;
}
function browserSupportCheck() {
    if (!("serviceWorker" in navigator)) {
        console.log("Service Worker is not supported in this browser");
        popupMessage("Browser not supported", "This browser is not supported by this app. This app may not function as intended. If you still want to try it out click the continue button. [SW]", `<button class="btn btn-danger w-100" onclick="popup();">Continue</button>`, false);
        return;
    } else if (!("PushManager" in window)) {
        console.log("Push is not supported in this browser");
        popupMessage("Browser not supported", "This browser is not supported by this app. This app may not function as intended. If you still want to try it out click the continue button. [PM]", `<button class="btn btn-danger w-100" onclick="popup();">Continue</button>`, false);
        return;
    } else {
        isBrowserSupported = true;
    }
}
async function notificationCheck() {
    if (isBrowserSupported) {
        let currentNotificationPermission = window.Notification.permission;
        if (currentNotificationPermission == "granted") {
            serviceWorkerRegistration = await navigator.serviceWorker.register("./res/js/serviceWorker.js");
        } else if (currentNotificationPermission == "default") {
            popupPrompt("Permission", "The app requires notification permission to work properly. Please click allow and grant notification permission.", "Allow", "", false);
            popupPromptCallback = (action) => {
                if (action) {
                    requestNotificationPermission();
                }
            };
        } else if (currentNotificationPermission == "denied") {
            setTimeout(() => {
                popupMessage("Blocked Permission", "The app may not work properly. Please allow notification permissions to the app.", "");
            }, 500);
            return;
        }
    }
}
async function requestNotificationPermission() {
    permission = await window.Notification.requestPermission();
    notificationCheck();
}
function urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
function prepareActivity(id) {
    switch (id) {
        case "activity-dashboard":
            getProfileConversations();
            getGroupConversations();
            break;
        case "activity-requests":
            requestsActivity();
            break;
        case "activity-friends":
            friendsActivity();
            break;
        case "activity-manange-group-members":
            manageGroupMembersActivity();
            break;
        case "activity-my-account":
            profileDetails();
            break;
        case "activity-group-details":
            groupDetails();
            break;
        case "activity-settings":
            break;
        case "activity-subscriptions":
            profileSubscriptions();
            break;
        case "activity-create-new-group":
            if (!isProfilePremium) {
                $("#activity-create-new-group-container").addClass("d-none");
                $("#activity-create-new-group-non-premium-container").html(getPremiumElementFull);
            } else {
                $("#activity-create-new-group-container").removeClass("d-none");
                $("#activity-create-new-group-non-premium-container").empty();
            }
            break;
        case "activity-search":
            $("#activity-search-search-box").val();
            $("#activity-search-search-box").focus();
            searchProfiles("");
            searchGroups("");
            break;
        default:
            break;
    }
}
navigator.serviceWorker.onmessage = function (event) {
    if (debug) {
        console.log("[MESSAGE FROM SREVICE WORKER]", event.data);
    }
    if (event.data.type == "newMessage") {
        getProfileConversations();
        if (currentActivity == "activity-messaging-view") {
            messageActivity(otherUserData.profileID);
        }
    } else if (event.data.type == "newGroupMessage") {
        getGroupConversations();
        if (currentActivity == "activity-group-messaging-view") {
            groupMessageActivity(otherUserData.groupID);
        }
    } else if (event.data.type == "profileConversationUpdate") {
        getProfileConversations();
    } else if (event.data.type == "groupConversationUpdate") {
        getGroupConversations();
    } else if (event.data.type == "profileMessagesUpdate") {
        getProfileConversations();
        if (currentActivity == "activity-messaging-view") {
            messageActivity(otherUserData.profileID);
        }
    } else if (event.data.type == "groupMessagesUpdate") {
        getGroupConversations();
        if (currentActivity == "activity-group-messaging-view") {
            groupMessageActivity(otherUserData.groupID);
        }
    }
};
$(window).on("load", () => {
    var windowURL = new URL(window.location.href);
    let defaultActivity = "activity-getting-started";
    browserSupportCheck();
    notificationCheck();

    if (localStorage.getItem("color-theme") == "theme-dark") {
        toggleTheme();
    }

    let isUserLoggedIn = localStorage.getItem("isUserLoggedIn");
    if (isUserLoggedIn == "true") {
        defaultActivity = "activity-dashboard";
        setTimeout(() => {
            $("#lock-screen-pin-input").val("");
            $("#lock-screen-pin-input").focus();
        }, 500);
        activeUserData = JSON.parse(localStorage.getItem("activeUserData"));
        requestServer(
            "api/getProfileData/",
            {
                activeProfileID: activeUserData.profileID,
                otherProfileID: activeUserData.profileID,
            },
            (data) => {
                activeUserData = data.userData;
                localStorage.setItem("activeUserData", JSON.stringify(activeUserData));

                if (windowURL.searchParams.has("activity")) {
                    defaultActivity = windowURL.searchParams.get("activity");
                }

                if (localStorage.getItem("appLockPIN") !== null) {
                    defaultActivity = "activity-lock-screen";
                }
                activity(defaultActivity);
            }
        );
        profileSubscriptions();
    } else {
        activity(defaultActivity);
    }

    $(".other-user-profile-icon").css("background-image", `url('${activeUserData.profileIconPath}')`);

    $("#image_0001").attr("src", `res/media/${currentTheme}/empty-box.png`);
});

var currentTheme = "theme-light";

function toggleTheme() {
    var button = $("#activity-settings-dark-theme-toggle");

    $("body").toggleClass("theme-dark");
    if ($("body").hasClass("theme-dark")) {
        currentTheme = "theme-dark";
        button.html("toggle_on");
        localStorage.setItem("color-theme", "theme-dark");
    } else {
        currentTheme = "theme-light";
        button.html("toggle_off");
        localStorage.removeItem("color-theme");
    }
}
