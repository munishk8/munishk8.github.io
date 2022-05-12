var isProfilePremium = false;
var putMessageLag = [];
var putMessageLock = false;
var putMessageLast = null;
var activeMessageID = null;
var putMessageLastMessageDate = null;
var getPremiumElement = `<div class="d-flex flex-grow-1 justify-content-center flex-column align-items-center p-5"><span class="text-center fs-12 text-secondary mb-3">Oops! your current subscription plan does not includes Group Messaging.</span><button class="btn btn-danger btn-sm px-5" onclick="activity('activity-subscriptions')">Get Premium</button></div>`;
var getPremiumElementFull = `<div class="d-flex flex-grow-1 justify-content-center flex-column align-items-center p-5"><img src="res/media/no_messages_purple_bubble.png" style="width: 180px;" class="mb-3"> <span class="text-center fs-12 text-secondary mb-3">Oops! your current subscription plan does not includes Group Messaging.</span><button class="btn btn-danger btn-sm px-5" onclick="activity('activity-subscriptions')">Get Premium</button></div><div class="p-5"></div>`;

function activityMessagingFileSendOnChange(event) {
    let container = $("#activity-media-preview-container");
    if (activityMessagingMessageType == "image") {
        $("#activity-media-preview-media-name").html("Send Image");
        container.html(`<img src="${URL.createObjectURL(event.target.files[0])}" class="w-100">`);
        activity("activity-media-preview");
    } else if (activityMessagingMessageType == "video") {
        $("#activity-media-preview-media-name").html("Send Video");
        container.html(`<video src="${URL.createObjectURL(event.target.files[0])}" class="w-100" controls></video>`);
        activity("activity-media-preview");
    } else if (activityMessagingMessageType == "document") {
        $("#activity-media-preview-media-name").html("Send Document");
        popupPrompt("Send Document", `Are you sure you want to send <span class='fw-600'>${event.target.files[0].name}</div>?`, "Send", "");
        // container.html(`<a href="${URL.createObjectURL(event.target.files[0])}" class="w-100">${event.target.files[0].name}</a>`);
    }

    $("#activity-media-preview-controls").html(
        `
        <div class="p-4 pb-5 d-flex">
            <div class="flex-grow-1"></div>
            <button class="btn btn-danger px-5" onclick="sendProfileMessage(event, '${activityMessagingMessageType}')">Send</button>
        </div>
        `
    );
    popupPromptCallback = (act) => {
        if (act) {
            sendProfileMessage(event, activityMessagingMessageType);
        }
    };
}
function activityGroupMessagingFileSendOnChange(event) {
    let container = $("#activity-media-preview-container");
    if (activityMessagingMessageType == "image") {
        $("#activity-media-preview-media-name").html("Send Image");
        container.html(`<img src="${URL.createObjectURL(event.target.files[0])}" class="w-100">`);
        activity("activity-media-preview");
    } else if (activityMessagingMessageType == "video") {
        $("#activity-media-preview-media-name").html("Send Video");
        container.html(`<video src="${URL.createObjectURL(event.target.files[0])}" class="w-100" controls></video>`);
        activity("activity-media-preview");
    } else if (activityMessagingMessageType == "document") {
        $("#activity-media-preview-media-name").html("Send Document");
        popupPrompt("Send Document", `Are you sure you want to send <span class='fw-600'>${event.target.files[0].name}</div>?`, "Send", "");
        // container.html(`<a href="${URL.createObjectURL(event.target.files[0])}" class="w-100">${event.target.files[0].name}</a>`);
    }

    $("#activity-media-preview-controls").html(
        `
        <div class="p-4 pb-5 d-flex">
            <div class="flex-grow-1"></div>
            <button class="btn btn-danger px-5" onclick="sendGroupMessage(event, '${activityMessagingMessageType}')">Send</button>
        </div>
        `
    );
    popupPromptCallback = (act) => {
        if (act) {
            sendGroupMessage(event, activityMessagingMessageType);
        }
    };
}
function checkProfileConnection(otherProfileID, callback) {
    getProfileConnections((connections) => {
        const connection = connections.find((element) => element.activeProfileID == activeUserData.profileID && element.otherProfileID == otherProfileID);
        if (connection) {
            callback(connection.connectionStatus);
        } else {
            callback(null);
        }
    });
}
function checkGroupConnection(otherProfileID, callback) {
    getGroupConnections((connections) => {
        const connection = connections.find((element) => element.activeProfileID == activeUserData.profileID && element.otherProfileID == otherProfileID);
        if (connection) {
            callback(connection.connectionStatus);
        } else {
            callback(null);
        }
    });
}
function checkActiveGroupConnection(otherProfileID, callback) {
    requestServer(
        "api/getConnections/",
        {
            activeProfileID: activeGroupID,
            connectionType: "group",
        },
        (data) => {
            connections = data.connections;
            const connection = connections.find((element) => element.activeProfileID == activeGroupID && element.otherProfileID == otherProfileID);
            if (connection) {
                callback(connection.connectionStatus);
            } else {
                callback(null);
            }
        }
    );
}
function createNewGroup(e) {
    e.preventDefault();
    checkUsernameForCreateGroup(() => {
        let name_input = $("#group_name_input");
        let submit_button = $("#create_group_submit_button");

        if (name_input.val() == "") {
            name_input.addClass("is-invalid");
            submit_button.addClass("disabled");
        } else {
            var createGroupForm = new FormData();

            createGroupForm.append("groupUsername", $("#group_username_input").val().toLowerCase());
            createGroupForm.append("groupName", $("#group_name_input").val());
            createGroupForm.append("groupIcon", $("#group_icon_select")[0].files[0]);
            createGroupForm.append("groupOwnerProfileID", activeUserData.profileID);
            loading();
            $.ajax({
                url: serverURL + "api/createGroup/",
                type: "POST",
                data: createGroupForm,
                processData: false,
                contentType: false,
                success: function (res) {
                    if (res.status) {
                        loading(false);
                        $(".m-input").val("");
                        activeGroupID = res.data.groupID;
                        popupMessage("Group Created.", "Your group has been created. You can add participants now.", `<button id="popup-message-close-button" class="btn btn-danger px-5  overflow-auto" onclick="activity('activity-add-to-group');">Add Members</button>`);
                    } else {
                        error();
                    }
                },
                error: function (err) {
                    error();
                },
            });
        }
    });
}
function checkUsernameForCreateGroup(callback) {
    let input = $("#group_username_input");
    let username = input.val();
    let invalid_feedback = $("#group-username-invalid-feedback");
    let submit_button = $("#create_group_submit_button");

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
function deleteConnectionConfirm(otherProfileID) {
    popupPrompt("Remove Connection", "You are about to remove a connection. You no longer will be able to interact with this person.");
    popupPromptCallback = (action) => {
        if (action) {
            manageProfileConnection(otherProfileID, "deleteConnection");
            profilePage(otherProfileID);
        }
    };
}
function deleteMessage() {
    requestServer(
        "api/deleteMessage/",
        {
            messageID: activeMessageID,
        },
        (data) => {
            popup();
            if (currentActivity == "activity-group-messaging-view") {
                groupMessageActivity(otherUserData.groupID);
            } else if (currentActivity == "activity-messaging-view") {
                messageActivity(otherUserData.profileID);
            }
        }
    );
}
function enablePremiumTrial() {
    popupPrompt("Enable Premium Trial", "Are you sure you want to enable premium trial?", "Yes", "No");
    popupPromptCallback = (decision) => {
        if (decision) {
            loading();
            setTimeout(() => {
                requestServer(
                    "api/addSubscription/",
                    {
                        profileID: activeUserData.profileID,
                        subscriptionType: "trial",
                        subscriptionPeriod: "7",
                        paymentAmount: 0,
                        paymentDescription: "Premium Trial for 7 days",
                        orderID: "",
                    },
                    (data) => {
                        profileSubscriptions();
                        popupMessage("Subscription Successful", "Subscription successful. You will be able to use premium features for 7 days.", closeButton, true);
                    }
                );
            }, 2000);
        }
    };
}

let friendsActivityLock = false;

function friendsActivity(moveToActivity = true) {
    if (friendsActivityLock) {
        return;
    }
    friendsActivityLock = true;
    if (moveToActivity) {
        activity("activity-friends");
    }
    getProfileConnections((connections) => {
        const container = $("#activity-friends-friends-container");
        container.html(`<div class="dead-center"><img src="res/media/${currentTheme}/empty-box.png" style="width: 120px;"><div class="text-muted fw-500 fs-12 text-center">No Friends Yet</div></div>`);
        if (connections.length > 0) {
            let first = true;
            connections.forEach((element) => {
                console.log("putting data");
                checkProfileConnection(element.otherProfileID, (connectionStatus) => {
                    if (connectionStatus == "connected") {
                        if (first) {
                            console.log("Was first cleared.");
                            container.html("");
                            first = false;
                        } else {
                            console.log("Was not first to skippped clear");
                        }
                        getProfileData(element.otherProfileID, (data) => {
                            console.log("Pittdsfsd dfds f",data);
                            container.append(profileCard(data.profileName, "", data.profileUsername, data.profileIconPath, "", "", "", "messageActivity('" + data.profileID + "');", "profilePage('" + data.profileID + "');"));
                        });
                    }
                });
            });
        }
    });
    let container = $("#activity-friends-groups-container");
    if (isProfilePremium) {
        container.html(`<div class="dead-center"><img src="res/media/${currentTheme}/empty-box.png" style="width: 120px;"><div class="text-muted fw-500 fs-12 text-center">No Groups Yet</div></div>`);
        getGroupConnections((connections) => {
            if (connections.length > 0) {
                let first = true;
                connections.forEach((element) => {
                    checkGroupConnection(element.otherProfileID, (connectionStatus) => {
                        if (connectionStatus == "connected") {
                            if (first) {
                                container.html("");
                                first = false;
                            }
                            getGroupData(element.otherProfileID, (data) => {
                                container.append(profileCard(data.groupName, "", data.groupUsername, data.groupIconPath, "", "", "", "groupMessageActivity('" + data.groupID + "')", "groupPage('" + data.groupID + "')"));
                            });
                        }
                    });
                });
            } else {
            }
        });
    } else {
        container.html(getPremiumElement);
    }
    friendsActivityLock = false;
}
function groupPage(otherProfileID, moveToActivity = true) {
    if (moveToActivity) {
        activity("activity-group-page");
    }
    requestServer(
        "api/getGroupData/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: otherProfileID,
        },
        (data) => {
            data = data.groupData;
            activeGroupID = data.groupID;
            $(".other-group-username").html(data.groupUsername);
            $(".other-group-name").html(data.groupName);
            $(".other-group-description").html(data.groupDescription);
            $(".other-group-icon").attr(`onclick`, `mediaPreview('${data.groupIconPath}', 'image','${data.groupName}');`);
            $(".other-group-icon").css("background-image", `url('${data.groupIconPath}')`);
            // $("#activity-profile-page-label").text("Group");
            // $("#activity-profile-page-reload-button").attr("onclick", `groupPage('${data.groupID}')`);

            var container = $("#activity-group-page-group-members-container");

            if (data.groupAccessType == "private") {
                container.html(`<div class="p-3 text-center fs-12 text-secondary">Join to see members</div>`);
            }

            if (data.groupOwnerProfileID == activeUserData.profileID) {
                $("#activityGroupPageControls").html(`
                            <button class="btn btn-danger btn-sm flex-grow-1 flex-shrink-0" onclick="groupMessageActivity(${data.groupID})">Message</button>
                            <div class="p-1"></div>
                            <button class="btn btn-sm btn-secondary flex-grow-1 flex-shrink-0" onclick="popup('popup-menu-group-page-manage')">Manage</button>
                `);
                getGroupMembers((members) => {
                    if (members.length > 0) {
                        container.html("");
                        members.forEach((member) => {
                            getProfileData(member.otherProfileID, (element) => {
                                if (element.profileID == activeUserData.profileID) {
                                    if (element.profileID == data.groupOwnerProfileID) {
                                        container.append(profileCard(element.profileName, "You", "", element.profileIconPath, "Admin", "", "", "", "", "fw-600 disabled"));
                                    } else {
                                        container.append(profileCard(element.profileName, "You", "", element.profileIconPath));
                                    }
                                } else if (element.profileID == data.groupOwnerProfileID) {
                                    container.append(profileCard(element.profileName, "", element.profileUsername, element.profileIconPath, "Admin", "", "", "messageActivity('" + element.profileID + "');", "profilePage('" + element.profileID + "');", "fw-600 disabled"));
                                } else {
                                    container.append(profileCard(container, element.profileName, "", element.profileUsername, element.profileIconPath, "", "", "", "messageActivity('" + element.profileID + "');", "profilePage('" + element.profileID + "');", ""));
                                }
                            });
                        });
                    }
                });
            } else {
                checkGroupConnection(data.groupID, (connectionStatus) => {
                    if (connectionStatus != null) {
                        if (connectionStatus == "sent-request") {
                            $("#activityGroupPageControls").html(`
                            <button class="btn btn-outline-secondary  flex-grow-1 flex-shrink-0" onclick="manageGroupConnection(${data.groupID}, 'deleteConnection')">Requested</button>
                        `);
                        } else if (connectionStatus == "received-request") {
                            $("#activityGroupPageControls").html(`
                            <button class="btn btn-danger  flex-grow-1 flex-shrink-0" onclick="manageGroupConnection(${data.groupID}, 'acceptRequest')">Accept</button>
                            <div class="p-1"></div>
                            <button class="btn btn-outline-secondary  flex-grow-1 flex-shrink-0" onclick="manageGroupConnection(${data.groupID}, 'deleteConnection')">Decline</button>
                        `);
                        } else if (connectionStatus == "connected") {
                            $("#activityGroupPageControls").html(`
                            <button class="btn btn-danger  flex-grow-1 flex-shrink-0" onclick="groupMessageActivity(${data.groupID})">Message</button>
                            <div class="p-1"></div>
                            <button class="btn btn-secondary  flex-grow-1 flex-shrink-0" onclick="leaveGroupConfirm(${data.groupID})">Leave</button>
                        `);
                            getGroupMembers((members) => {
                                if (members.length > 0) {
                                    container.html("");
                                    members.forEach((member) => {
                                        getProfileData(member.otherProfileID, (element) => {
                                            if (element.profileID == activeUserData.profileID) {
                                                if (element.profileID == data.groupOwnerProfileID) {
                                                    container.append(profileCard(element.profileName, "You", "", element.profileIconPath, "Admin", "", "", "", "", "fw-600 disabled"));
                                                } else {
                                                    container.append(profileCard(element.profileName, "You", "", element.profileIconPath));
                                                }
                                            } else if (element.profileID == data.groupOwnerProfileID) {
                                                container.append(profileCard(element.profileName, "", element.profileUsername, element.profileIconPath, "Admin", "", "", "profilePage('" + element.profileID + "');", "profilePage('" + element.profileID + "');", "fw-600 disabled"));
                                            } else {
                                                container.append(profileCard(element.profileName, "", element.profileUsername, element.profileIconPath, "", "", "", "profilePage('" + element.profileID + "');", "profilePage('" + element.profileID + "');", ""));
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    } else {
                        $("#activityGroupPageControls").html(`
                        <button class="btn btn-danger  flex-grow-1 flex-shrink-0" onclick="manageGroupConnection(${data.groupID}, 'sendRequest')">Join</button>
                    `);
                    }
                });
            }
        }
    );
}
function getGroupMembers(callback) {
    requestServer(
        "api/getGroupMembers/",
        {
            activeProfileID: activeGroupID,
        },
        (data) => {
            callback(data);
        }
    );
}
function getProfileConnections(callback) {
    requestServer(
        "api/getConnections/",
        {
            activeProfileID: activeUserData.profileID,
            connectionType: "profile",
        },
        (data) => {
            callback(data.connections);
        }
    );
}
function getGroupConnections(callback) {
    requestServer(
        "api/getConnections/",
        {
            activeProfileID: activeUserData.profileID,
            connectionType: "group",
        },
        (data) => {
            callback(data.connections);
        }
    );
}
function getProfileData(profileID, callback) {
    requestServer(
        "api/getProfileData/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: profileID,
        },
        (data) => {
            callback(data.userData);
        }
    );
}
function getGroupData(groupID, callback) {
    requestServer(
        "api/getGroupData/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: groupID,
        },
        (data) => {
            callback(data.groupData);
        }
    );
}
function groupMessageActivity(otherProfileID) {
    getGroupData(otherProfileID, (data) => {
        otherUserData = data;
        $("#activity-messaging-group-name").html(data.groupName);
        $("#activity-messaging-group-username").html(data.groupUsername);
        $("#activity-messaging-group-icon").css("background-image", `url('${data.groupIconPath}')`);
        $("#activity-messaging-group-icon").attr("onclick", `groupPage('${data.groupID}')`);

        getGroupMessages(otherProfileID, async (messages) => {
            activity("activity-group-messaging-view");
            const container = $("#activity-messaging-group-messages-wrapper");
            container.html("");

            if (messages.length > 0) {
                messages.forEach((message) => {
                    putMessage(message, container);
                });

                if (messages[messages.length - 1].messageSenderProfileID == activeUserData.profileID) {
                    requestServer(
                        "api/getMessageDeliveryStatus/",
                        {
                            messageID: messages[messages.length - 1].messageID,
                        },
                        (data) => {
                            putMessage(null, container, `<div class="message-sent-info">${data.status}</div>`);
                        }
                    );
                }

                // setTimeout(() => {
                //     container.animate({
                //         scrollTop: container.prop("scrollHeight"),
                //     });
                // }, 200);
            }
        });
    });
}
function getFormattedDate(dateAndTime) {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var date = dateAndTime.split(" ")[0];
    var time = dateAndTime.split(" ")[1];

    var day = date.split("-")[2];
    var monthIndex = date.split("-")[1] - 1;
    var year = date.split("-")[0];

    return monthNames[monthIndex] + " " + day + ", " + year;
}
function getProfileMessages(otherProfileID, callback) {
    requestServer(
        "api/getMessages/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: otherProfileID,
            messageConversationType: "profile",
        },
        (data) => {
            callback(data.messages);
        }
    );
}
function getGroupMessages(otherProfileID, callback) {
    requestServer(
        "api/getMessages/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: otherProfileID,
            messageConversationType: "group",
        },
        (data) => {
            callback(data.messages);
        }
    );
}

var getProfileConversationsLock = false;

function getProfileConversations() {
    if (getProfileConversationsLock) {
        console.log("PREVENTED PROFILE CLASH");
        return;
    }
    getProfileConversationsLock = true;
    requestServer(
        "api/getConversations/",
        {
            activeProfileID: activeUserData.profileID,
            conversationType: "profile",
        },
        (data) => {
            let container = $("#activity-dashboard-profile-conversations-container");
            if (data.conversations.length > 0) {
                container.html("");
                data.conversations.forEach((conversation) => {
                    putProfileConversationCard(conversation, container);
                });
            } else {
                container.html(`<div class="dead-center text-center p-5"><img src="res/media/${currentTheme}/no-messages-bird-house.png" style="width: 200px;"><div class="fw-600 fs-16 mb-3">No Messages, yet.</div><div class="fs-12" style="color: #a0a0a0;">No messages in your inbox, yet! Start<br>chatting with people around you.</div><div class="p-5"></div><div class="p-5"></div></div>`);
            }
            getProfileConversationsLock = false;
        }
    );
}

putProfileConversationCardLock = false;
putProfileConversationCardLag = [];

function putProfileConversationCard(conversation, container) {
    if (putProfileConversationCardLock) {
        putProfileConversationCardLag.push({ conversation, container });
    } else {
        putProfileConversationCardLock = true;
        getProfileData(conversation.otherProfileID, (profileData) => {
            date = conversation.conversationLastUpdatedOn.split(" ")[0];
            time = conversation.conversationLastUpdatedOn.split(" ")[1];
            time = time.split(":")[0] + ":" + time.split(":")[1];
            conversationNewReceived = false;
            conversationSentStatus = conversation.conversationSentStatus + " at " + time;
            conversationReceivedStatus = "";
            if (conversation.conversationNewReceived > 0) {
                conversationSentStatus = "";
                conversationNewReceived = conversation.conversationNewReceived;
                if (conversationNewReceived == 1) {
                    conversationReceivedStatus = conversationNewReceived + " new message";
                } else {
                    conversationReceivedStatus = conversationNewReceived + " new messages";
                }
            }
            container.append(profileCard(profileData.profileName, conversationReceivedStatus, conversationSentStatus, profileData.profileIconPath, "", "", conversationNewReceived, `messageActivity(${conversation.otherProfileID})`, `profilePage(${conversation.otherProfileID})`));
            putProfileConversationCardLock = false;
            if (putProfileConversationCardLag.length > 0) {
                let next = putProfileConversationCardLag.pop();
                putProfileConversationCard(next.conversation, next.container);
            }
        });
    }
}
var getGroupConversationsLock = false;

function getGroupConversations() {
    if (getGroupConversationsLock) {
        console.log("PREVENTED GROUP CLASH");
        return;
    }
    getGroupConversationsLock = true;
    let container = $("#activity-dashboard-group-conversations-container");
    if (isProfilePremium) {
        requestServer(
            "api/getConversations/",
            {
                activeProfileID: activeUserData.profileID,
                conversationType: "group",
            },
            (data) => {
                if (data.conversations.length > 0) {
                    container.html(" ");
                    data.conversations.forEach((conversation) => {
                        getGroupData(conversation.otherProfileID, (groupData) => {
                            date = conversation.conversationLastUpdatedOn.split(" ")[0];
                            time = conversation.conversationLastUpdatedOn.split(" ")[1];
                            time = time.split(":")[0] + ":" + time.split(":")[1];
                            conversationNewReceived = false;
                            // conversationSentStatus = conversation.conversationSentStatus + " at " + time;
                            conversationSentStatus = "You sent a message";
                            conversationReceivedStatus = "";
                            if (conversation.conversationNewReceived > 0) {
                                conversationSentStatus = "";
                                conversationNewReceived = conversation.conversationNewReceived;
                                if (conversationNewReceived == 1) {
                                    conversationReceivedStatus = conversationNewReceived + " new message";
                                } else {
                                    conversationReceivedStatus = conversationNewReceived + " new messages";
                                }
                            }
                            // var groupData = groupData;
                            container.append(profileCard(groupData.groupName, conversationReceivedStatus, conversationSentStatus, groupData.groupIconPath, "", "", conversationNewReceived, `groupMessageActivity(${conversation.otherProfileID})`, `groupPage(${conversation.otherProfileID})`));
                        });
                    });
                } else {
                    container.html(`<div class="dead-center text-center p-5"><img src="res/media/${currentTheme}/no-messages-bird-house.png" style="width: 200px;"><div class="fw-600 fs-16 mb-3">No Groups, yet.</div><div class="fs-12" style="color: #a0a0a0;">No groups in your inbox, yet! Start<br>chatting with people around you.</div><div class="p-5"></div><div class="p-5"></div></div>`);
                }
                getGroupConversationsLock = false;
            }
        );
    } else {
        container.html(getPremiumElementFull);
    }
}
function getMyGroups() {
    requestServer(
        "api/getMyGroups/",
        {
            activeProfileID: activeUserData.profileID,
        },
        (data) => {
            let container = $("#activity-groups-my-groups-container");
            if (data.length > 0) {
                container.html("");
                data.forEach((group) => {
                    container.append(profileCard(group.groupName, "", group.groupUsername, group.groupIconPath, "Manage", "", "", `groupPage(${group.groupID})`, `groupPage(${group.groupID})`, "group"));
                });
            }
        }
    );
}
function groupDetails() {
    requestServer(
        "api/getGroupData/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: activeGroupID,
        },
        (data) => {
            data = data.groupData;
            $("#group-details-name").val(data.groupName);
            $("#group-details-description").val(data.groupDescription);
            $("#group-details-icon-visibility").val(data.groupIconVisibility);
            $("#group-details-description-visibility").val(data.groupDescriptionVisibility);
            $("#group-details-access-type").val(data.groupAccessType);
            $("#group-details-icon").css("background-image", `url('${data.groupIconPath}')`);

            if (!data.groupIconPath) {
                $("#removeGroupPhotoButton").hide(200);
            } else {
                $("#removeGroupPhotoButton").show(200);
            }
        }
    );
}
function leaveGroupConfirm(otherProfileID) {
    popupPrompt("Leave Group", "Are you sure you want to leave this group. You no longer will be able to interact with this group.");
    popupPromptCallback = (action) => {
        if (action) {
            manageGroupConnection(otherProfileID, "deleteConnection");
        }
    };
}
function manageProfileConnection(otherProfileID, action) {
    requestServer(
        "api/manageConnection/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: otherProfileID,
            operation: action,
            connectionType: "profile",
        },
        (data) => {
            requestsActivity(false);
            profilePage(otherProfileID, false);
            // if (currentActivity == "activity-profile-page") {
            // } else if (currentActivity == "activity-friends") {
            // }
        }
    );
}
function manageGroupConnection(otherProfileID, action) {
    requestServer(
        "api/manageConnection/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: otherProfileID,
            operation: action,
            connectionType: "group",
        },
        (data) => {
            // searchProfilesGroupInvite($("#activity-add-to-group-search-input").val());
            groupPage(otherProfileID, false);
            requestsActivity(false);
            // friendsActivity(false);
            //   profilePage(otherProfileID, false);
        }
    );
}
function manageActiveGroupConnection(otherProfileID, action) {
    requestServer(
        "api/manageConnection/",
        {
            activeProfileID: activeGroupID,
            otherProfileID: otherProfileID,
            operation: action,
            connectionType: "group",
            operationByGroup: true,
        },
        (data) => {
            searchProfilesGroupInvite($("#activity-add-to-group-search-input").val());
            profilePage(otherProfileID, false);
            requestsActivity(false);
            manageGroupMembersActivity();
            // friendsActivity(false);
        }
    );
}
function messageActivity(otherProfileID) {
    getProfileData(otherProfileID, (data) => {
        otherUserData = data;
        $("#activity-messaging-profile-name").html(data.profileName);
        $("#activity-messaging-profile-username").html(data.profileUsername);
        $("#activity-messaging-profile-icon").css("background-image", `url('${data.profileIconPath}')`);
        $("#activity-messaging-profile-icon").attr("onclick", `profilePage('${data.profileID}')`);
        getProfileMessages(otherProfileID, (messages) => {
            activity("activity-messaging-view");
            const container = $("#activity-messaging-messages-wrapper");
            container.html("");

            let lastMessageDate = "";

            if (messages.length > 0) {
                messages.forEach((message) => {
                    if (lastMessageDate != message.messageSentOn.split(" ")[0]) {
                        container.append(`<div class="message-seperator">${getFormattedDate(message.messageSentOn)}</div>`);
                        lastMessageDate = message.messageSentOn.split(" ")[0];
                    }
                    if (message.messageSenderProfileID == activeUserData.profileID) {
                        messageDirection = "sent";
                    } else {
                        messageDirection = "received";
                    }
                    if (message.messageStatus == "Deleted") {
                        if (messageDirection == "sent") {
                            messageDirection = "sent-2";
                        }
                        container.append(`<div class="message message-text message-${messageDirection}" messageID="${message.messageID}"><div class='fs-12 secondary-message-text' style='font-style: italic;'>This message was deleted</div></div>`);
                    } else {
                        if (message.messageKey == "") {
                            if (message.messageType == "text") {
                                container.append(`<div class="message message-text message-${messageDirection}" messageID="${message.messageID}">${message.messageData}</div>`);
                            } else if (message.messageType == "image") {
                                container.append(`<img src="${message.messageFilePath}" class="message message-image message-image-${messageDirection}" messageID="${message.messageID}" onclick="mediaPreview('${message.messageFilePath}','image','${message.messageData}')">`);
                            } else if (message.messageType == "video") {
                                container.append(`<video src="${message.messageFilePath}" class="message message-image message-image-${messageDirection}" messageID="${message.messageID}" onclick="mediaPreview('${message.messageFilePath}','video','${message.messageData}')" autoplay></video>`);
                            } else if (message.messageType == "document") {
                                container.append(`<div class="message message-text message-${messageDirection}" messageID="${message.messageID}" onclick="mediaPreview('${message.messageFilePath}','document','${message.messageData}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:20px; padding-right:10px;'>article</div> ${message.messageData}</div></div>`);
                            }
                        } else {
                            let type = message.messageType;
                            if (type == "text") {
                                container.append(`<div class="message message-text message-${messageDirection}" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Message</div></div>`);
                            } else if (type == "image") {
                                container.append(`<div class="message message-text message-${messageDirection}" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Image</div></div>`);
                            } else if (type == "video") {
                                container.append(`<div class="message message-text message-${messageDirection}" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Video</div></div>`);
                            } else if (type == "document") {
                                container.append(`<div class="message message-text message-${messageDirection}" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Document</div></div>`);
                            }
                        }
                    }
                });
                if (messages[messages.length - 1].messageSenderProfileID == activeUserData.profileID) {
                    container.append(`<div class="message-sent-info">${messages[messages.length - 1].messageStatus}</div>`);
                }
                $(".message-sent").contextmenu((e) => {
                    e.preventDefault();
                    activeMessageID = $(e.target).attr("messageID");
                    popup("popup-message-context");
                });
                $(".message-image-sent").contextmenu((e) => {
                    e.preventDefault();
                    activeMessageID = $(e.target).attr("messageID");
                    popup("popup-message-context");
                });

                setTimeout(() => {
                    container.animate(
                        {
                            scrollTop: container.prop("scrollHeight"),
                        },
                        1
                    );
                }, 200);
            }
        });
    });
}
function mediaPreview(filePath, fileType, fileName = "") {
    if (filePath) {
        let container = $("#activity-media-preview-container");
        $("#activity-media-preview-controls").html("");
        if (fileType == "image") {
            $("#activity-media-preview-media-name").html(fileName);
            container.html(`<img src="${filePath}" class="w-100">`);
            activity("activity-media-preview");
        } else if (fileType == "video") {
            $("#activity-media-preview-media-name").html(fileName);
            container.html(`<video src="${filePath}" class="w-100" controls></video>`);
            activity("activity-media-preview");
        } else if (fileType == "document") {
            $("#activity-media-preview-media-name").html(fileName);
            popupPrompt("Download File", `Download <span class='fw-600'>${fileName}</div>?`, "Download", "");
            popupPromptCallback = (act) => {
                if (act) {
                    window.open(filePath, "_blank");
                }
            };
        }
    }
}
function manageGroupMembersActivity() {
    getGroupMembers((members) => {
        const container = $("#activity-manage-group-members-container");
        container.html("");
        if (members.length > 0) {
            // let first = true;
            members.forEach((element) => {
                getProfileData(element.otherProfileID, (data) => {
                    if (data.profileID == activeUserData.profileID) {
                        container.append(profileCard(data.profileName, "", data.profileUsername, data.profileIconPath, "Admin", "", "", "", "", "btn disabled fw-600 fs-12"));
                    } else {
                        container.append(profileCard(data.profileName, "", data.profileUsername, data.profileIconPath, "Remove", "manageActiveGroupConnection('" + data.profileID + "','deleteConnection')", "", "profilePage('" + data.profileID + "')", "profilePage('" + data.profileID + "')", "btn btn-outline-secondary"));
                    }
                });
            });
        }
    });
}
function profileDetails() {
    requestServer(
        "api/getProfileData/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: activeUserData.profileID,
        },
        (data) => {
            data = data.userData;
            $("#profile-details-name").val(data.profileName);
            $("#profile-details-description").val(data.profileDescription);
            $("#profile-details-icon-visibility").val(data.profileIconVisibility);
            $("#profile-details-description-visibility").val(data.profileDescriptionVisibility);
            $("#profile-details-access-type").val(data.profileAccessType);
            $("#profile-details-icon").css("background-image", `url('${data.profileIconPath}')`);

            if (!data.profileIconPath) {
                $("#removeProfilePhotoButton").hide(200);
            } else {
                $("#removeProfilePhotoButton").show(200);
            }
        }
    );
}
function profilePage(otherProfileID, moveToActivity = true) {
    if (moveToActivity) {
        activity("activity-profile-page");
    }
    requestServer(
        "api/getProfileData/",
        {
            activeProfileID: activeUserData.profileID,
            otherProfileID: otherProfileID,
        },
        (data) => {
            data = data.userData;
            $(".other-profile-username").html(data.profileUsername);
            $(".other-profile-name").html(data.profileName);
            $(".other-profile-description").html(data.profileDescription);
            $(".other-profile-icon").css("background-image", `url('${data.profileIconPath}')`);
            $(".other-profile-icon").attr(`onclick`, `mediaPreview('${data.profileIconPath}', 'image','${data.profileName}');`);
            $("#activity-profile-page-label").text("Profile");
            $("#activity-profile-page-reload-button").attr("onclick", `profilePage('${data.profileID}')`);

            checkProfileConnection(data.profileID, (connectionStatus) => {
                if (connectionStatus != null) {
                    if (connectionStatus == "sent-request") {
                        $("#activityProfilePageControls").html(`
                            <button class="btn btn-outline-secondary btn-sm flex-grow-1 flex-shrink-0" onclick="manageProfileConnection(${data.profileID}, 'deleteConnection')">Requested</button>
                        `);
                    } else if (connectionStatus == "received-request") {
                        $("#activityProfilePageControls").html(`
                            <button class="btn btn-danger btn-sm flex-grow-1 flex-shrink-0" onclick="manageProfileConnection(${data.profileID}, 'acceptRequest')">Accept</button>
                            <div class="p-1"></div>
                            <button class="btn btn-outline-secondary btn-sm flex-grow-1 flex-shrink-0" onclick="manageProfileConnection(${data.profileID}, 'deleteConnection')">Decline</button>
                        `);
                    } else if (connectionStatus == "connected") {
                        $("#activityProfilePageControls").html(`
                            <button class="btn btn-danger btn-sm flex-grow-1 flex-shrink-0" onclick="messageActivity(${data.profileID})">Message</button>
                            <div class="p-1"></div>
                            <button class="btn btn-secondary btn-sm flex-grow-1 flex-shrink-0" onclick="deleteConnectionConfirm(${data.profileID})">Remove</button>
                        `);
                    }
                } else {
                    $("#activityProfilePageControls").html(`
                        <button class="btn btn-danger btn-sm flex-grow-1 flex-shrink-0" onclick="manageProfileConnection(${data.profileID}, 'sendRequest')">Connect</button>
                    `);
                }
            });
        }
    );
}
function profileSubscriptions() {
    requestServer(
        "api/getSubscriptionStatus/",
        {
            activeProfileID: activeUserData.profileID,
        },
        (data) => {
            if (data.subscribed) {
                isProfilePremium = true;
                $("#activity-subscriptions-buy-subscription-wrapper").hide();
            } else {
                if (data.trialExpired) {
                    $("#get-trial-card").hide();
                } else {
                    $("#trial-expired-card").hide();
                }
            }
            requestServer(
                "api/getSubscriptions/",
                {
                    activeProfileID: activeUserData.profileID,
                },
                (data) => {
                    container = $("#activity-subscriptions-subscriptions-wrapper");
                    if (data.subscriptions.length) {
                        let x = false;
                        data.subscriptions.forEach((element) => {
                            if (element.subscriptionType == "trial") {
                                console.log("trial");
                                x = true;
                                data.subscriptions.forEach((element) => {
                                    if (element.subscriptionType == "premium-1" || element.subscriptionType == "premium-2" || element.subscriptionType == "premium-3") {
                                        console.log("premium");
                                        x = false;
                                    }
                                });
                            }
                        });
                        if (x) {
                            $("#activity-subscriptions-buy-subscription-wrapper").show();
                            $("#get-trial-card").hide();
                            $("#trial-expired-card").hide();
                        }
                        container.html("");
                        for (let i = 0; i < data.subscriptions.length; i++) {
                            let subscription = data.subscriptions[i];
                            let subscriptionType = "Premium";
                            let cardStyle = "border-radius: 10px; background: #536976; background: -webkit-linear-gradient(to right, #292E49, #536976); background: linear-gradient(to right, #292E49, #536976);";
                            let duration = "";

                            if (subscription.subscriptionType == "trial") {
                                subscriptionType = "Premium Trial";
                                cardStyle = "border-radius: 10px; background: #ED213A; background: -webkit-linear-gradient(to right, #93291E, #ED213A); background: linear-gradient(to right, #93291E, #ED213A);";
                                duration = "7 days";
                            } else if (subscription.subscriptionType == "premium-1") {
                                duration = "1 month";
                            } else if (subscription.subscriptionType == "premium-2") {
                                duration = "3 months";
                            } else if (subscription.subscriptionType == "premium-3") {
                                duration = "6 months";
                            }

                            if (Date.parse(subscription.subscriptionEndsOn) < Date.now()) {
                                duration = "Expired";
                                cardStyle = "border-radius: 10px; background: #a0a0a0;";
                            }
                            container.append(`<div class="col-sm-12 col-md-6 col-lg-4"><div class="text-light m-4 my-2 p-4 py-4 shadow click-scale-animation" style="${cardStyle}"><div class="d-flex"><div class="d-flex flex-column align-items-end"><div class="fs-20 fw-600">${subscriptionType}</div></div><div class="flex-grow-1"></div><div>${duration}</div></div><div class="d-flex mt-4 fs-12"><div class="text-center flex-grow-1">Purchased on<br>${getFormattedDate(subscription.subscriptionStartedOn)}</div><div class="text-center flex-grow-1">Expires on<br>${getFormattedDate(subscription.subscriptionEndsOn)}</div></div></div></div>`);
                        }
                    } else {
                        container.html(`<div class="dead-center"><img src="res/media/${currentTheme}/empty-box.png" style="height: 150px;"></div>`);
                    }
                }
            );
        }
    );
}
function purchaseSubscription(amount, duration, type) {
    var orderID;
    requestServer(
        "api/createOrder/",
        {
            amount: amount,
        },
        (data) => {
            orderID = data.orderID;
            var rzp1 = new Razorpay({
                key: "rzp_test_W07spsmQp4SBSp",
                amount: amount,
                currency: "INR",
                name: "Premium",
                description: "Premium for " + duration + " days",
                image: serverURL + "res/media/logo.png",
                order_id: orderID,
                handler: function (response) {
                    requestServer(
                        "api/addSubscription/",
                        {
                            profileID: activeUserData.profileID,
                            subscriptionType: type,
                            subscriptionPeriod: duration,
                            paymentAmount: amount,
                            paymentDescription: "Premium for " + duration + " days",
                            orderID: orderID,
                        },
                        (data) => {
                            popupMessage("Subscription Successful", "Subscription successful. You will be able to use premium features for " + duration + " days.", "<button class='btn btn-danger px-5' onclick='window.location.reload();'>Reload</button>", false);
                        }
                    );
                },
                prefill: {
                    name: activeUserData.profileName,
                    email: activeUserData.profileEmail,
                    // contact: "9999999999",
                },
                theme: {
                    color: "#DC3545",
                },
            });
            rzp1.open();
            rzp1.on("payment.failed", function (response) {
                popupMessage("Payment Failed", "Payment Failed. Please try again.");
            });
        }
    );
}
function putMessage(message, container, custom = "") {
    if (putMessageLock) {
        putMessageLag.push([message, container, custom]);
    } else {
        putMessageLock = true;
        if (custom) {
            container.append(custom);
            putMessageLock = false;
            if (putMessageLag.length > 0) {
                let next = putMessageLag.shift();
                putMessage(next[0], next[1], next[2]);
            }
        } else {
            if (putMessageLastMessageDate != message.messageSentOn.split(" ")[0]) {
                container.append(`<div class="message-seperator">${getFormattedDate(message.messageSentOn)}</div>`);
                putMessageLastMessageDate = message.messageSentOn.split(" ")[0];
            }

            if (message.messageSenderProfileID == activeUserData.profileID) {
                putMessageLast = null;

                if (message.messageStatus == "Deleted") {
                    container.append(`<div class="message message-text message-sent-2" messageID="${message.messageID}"><div class='fs-12 secondary-message-text' style='font-style: italic;'>This message was deleted</div></div>`);
                } else {
                    if (message.messageKey == "") {
                        if (message.messageType == "text") {
                            container.append(`<div class="message message-text message-sent" messageID="${message.messageID}">${message.messageData}</div>`);
                        } else if (message.messageType == "image") {
                            container.append(`<img src="${message.messageFilePath}" class="message message-image message-image-sent" messageID="${message.messageID}" onclick="mediaPreview('${message.messageFilePath}','image','${message.messageData}')">`);
                        } else if (message.messageType == "video") {
                            container.append(`<video src="${message.messageFilePath}" class="message message-image message-image-sent" messageID="${message.messageID}" onclick="mediaPreview('${message.messageFilePath}','video','${message.messageData}')" autoplay></video>`);
                        } else if (message.messageType == "document") {
                            container.append(`<div class="message message-text message-sent" messageID="${message.messageID}" onclick="mediaPreview('${message.messageFilePath}','document','${message.messageData}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:20px; padding-right:10px;'>article</div> ${message.messageData}</div></div>`);
                        }
                    } else {
                        let type = message.messageType;
                        if (type == "text") {
                            container.append(`<div class="message message-text message-sent" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Message</div></div>`);
                        } else if (type == "image") {
                            container.append(`<div class="message message-text message-sent" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Image</div></div>`);
                        } else if (type == "video") {
                            container.append(`<div class="message message-text message-sent" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Video</div></div>`);
                        } else if (type == "document") {
                            container.append(`<div class="message message-text message-sent" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Document</div></div>`);
                        }
                    }
                }

                setTimeout(() => {
                    container.scrollTop(container.prop("scrollHeight"));
                }, 200);
                putMessageLock = false;
                if (putMessageLag.length > 0) {
                    let next = putMessageLag.shift();
                    putMessage(next[0], next[1], next[2]);
                }
            } else {
                getProfileData(message.messageSenderProfileID, (data) => {
                    messageReceivedIcon = `<div class="message-received-icon-alt"></div>`;
                    if (putMessageLast != message.messageSenderProfileID) {
                        container.append(`<div class="message-received-info">${data.profileName}</div>`);
                        messageReceivedIcon = `<div class="message-received-icon" onclick="profilePage('${data.profileID}');" style="background-image: url('${data.profileIconPath}');"></div>`;
                    }
                    putMessageLast = message.messageSenderProfileID;

                    if (message.messageStatus == "Deleted") {
                        container.append(`<div class="message-received-wrapper">${messageReceivedIcon}<div class="message message-text message-received" messageID="${message.messageID}"><div class='fs-12 secondary-message-text' style='font-style: italic;'>This message was deleted</div></div></div>`);
                    } else {
                        if (message.messageKey == "") {
                            if (message.messageType == "text") {
                                container.append(`<div class="message-received-wrapper">${messageReceivedIcon}<div class="message message-text message-received" messageID="${message.messageID}">${message.messageData}</div></div>`);
                            } else if (message.messageType == "image") {
                                container.append(`<div class="message-received-wrapper">${messageReceivedIcon}<img src="${message.messageFilePath}" class="message message-image message-image-received" messageID="${message.messageID}" onclick="mediaPreview('${message.messageFilePath}','image','${message.messageData}')"></div>`);
                            } else if (message.messageType == "video") {
                                container.append(`<div class="message-received-wrapper">${messageReceivedIcon}<video src="${message.messageFilePath}" class="message message-image message-image-received" messageID="${message.messageID}" onclick="mediaPreview('${message.messageFilePath}','video','${message.messageData}')" autoplay></video></div>`);
                            } else if (message.messageType == "document") {
                                container.append(`<div class="message-received-wrapper">${messageReceivedIcon}<div class="message message-text message-received" messageID="${message.messageID}" onclick="mediaPreview('${message.messageFilePath}','document','${message.messageData}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:20px; padding-right:10px;'>article</div> ${message.messageData}</div></div></div>`);
                            }
                        } else {
                            let type = message.messageType;
                            if (type == "text") {
                                container.append(`<div class="message-received-wrapper">${messageReceivedIcon}<div class="message message-text message-received" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Message</div></div></div>`);
                            } else if (type == "image") {
                                container.append(`<div class="message-received-wrapper">${messageReceivedIcon}<div class="message message-text message-received" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Image</div></div></div>`);
                            } else if (type == "video") {
                                container.append(`<div class="message-received-wrapper">${messageReceivedIcon}<div class="message message-text message-received" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Video</div></div></div>`);
                            } else if (type == "document") {
                                container.append(`<div class="message-received-wrapper">${messageReceivedIcon}<div class="message message-text message-received" messageID="${message.messageID}" onclick="protectedMessagePreview('${message.messageType}','${message.messageKey}','${message.messageData}','${message.messageFilePath}')"><div class='d-flex align-items-center secondary-message-text' style='font-size:12px;'><div class='material-icons' style='font-size:16px; padding-right:6px;'>lock</div> Document</div></div></div>`);
                            }
                        }
                    }

                    setTimeout(() => {
                        container.scrollTop(container.prop("scrollHeight"));
                    }, 200);
                    putMessageLock = false;
                    if (putMessageLag.length > 0) {
                        let next = putMessageLag.shift();
                        putMessage(next[0], next[1], next[2]);
                    }
                });
            }
            $(".message-sent").contextmenu((e) => {
                e.preventDefault();
                activeMessageID = e.target.getAttribute("messageID");
                popup("popup--group-message-context");
            });
            $(".message-image-sent").contextmenu((e) => {
                e.preventDefault();
                activeMessageID = e.target.getAttribute("messageID");
                popup("popup-group-message-context");
            });
        }
    }
}

var requestsActivityLock = false;

function requestsActivity(moveToActivity = true) {
    if (requestsActivityLock) {
        return;
    }
    requestsActivityLock = true;
    if (moveToActivity) {
        activity("activity-requests");
    }

    getProfileConnections((connections) => {
        let container = $("#activity-requests-friend-requests-container");
        container.html(`<div class="dead-center p-2"><img src="res/media/${currentTheme}/empty-box.png" style="width: 120px;"><div class="text-muted fw-500 fs-12 text-center">No Requests</div></div>`);
        if (connections.length) {
            let first = true;
            connections.forEach((element) => {
                checkProfileConnection(element.otherProfileID, (connectionStatus) => {
                    if (connectionStatus == "received-request") {
                        if (first) {
                            container.html("");
                            first = false;
                        }
                        getProfileData(element.otherProfileID, (data) => {
                            container.append(profileCard(data.profileName, "", data.profileUsername, data.profileIconPath, "Accept", "manageProfileConnection('" + data.profileID + "', 'acceptRequest')", "", "profilePage('" + data.profileID + "')", "profilePage('" + data.profileID + "')"));
                        });
                    }
                });
            });
        }
    });

    let container2 = $("#activity-requests-group-invites-container");

    if (isProfilePremium) {
        container2.html(`<div class="dead-center p-2"><img src="res/media/${currentTheme}/empty-box.png" style="width: 120px;"><div class="text-muted fw-500 fs-12 text-center">No Requests</div></div>`);
        getGroupConnections((connections) => {
            if (connections.length) {
                let first = true;
                connections.forEach((element) => {
                    checkGroupConnection(element.otherProfileID, (connectionStatus) => {
                        if (connectionStatus == "received-request") {
                            if (first) {
                                container2.html("");
                                first = false;
                            }
                            getGroupData(element.otherProfileID, (data) => {
                                container2.append(profileCard(data.groupName, "", "Invited You to join", data.groupIconPath, "Accept", "manageGroupConnection('" + data.groupID + "', 'acceptRequest')", "", "groupPage('" + data.groupID + "')", "groupPage('" + data.groupID + "')"));
                            });
                        }
                    });
                });
            }
        });
    } else {
        container2.html(getPremiumElement);
    }

    let container = $("#activity-requests-group-join-requests-container");

    if (isProfilePremium) {
        container.html(`<div class="dead-center p-2"><img src="res/media/${currentTheme}/empty-box.png" style="width: 120px;"><div class="text-muted fw-500 fs-12 text-center">No Requests</div></div>`);
        requestServer(
            "api/getGroupJoinRequests/",
            {
                activeProfileID: activeUserData.profileID,
            },
            (data) => {
                let connections = data.connections;
                if (connections.length) {
                    let first = true;
                    connections.forEach((element) => {
                        if (element.connectionStatus == "received-request") {
                            if (first) {
                                container.html("");
                                first = false;
                            }
                            getProfileData(element.otherProfileID, (data) => {
                                getGroupData(element.activeProfileID, (groupData) => {
                                    container.append(profileCard(data.profileName, "", "Wants to join " + groupData.groupName, data.profileIconPath, "Accept", "activeGroupID = " + groupData.groupID + ";manageActiveGroupConnection('" + data.profileID + "', 'acceptRequest')", "", "profilePage('" + data.profileID + "')", "profilePage('" + data.profileID + "')"));
                                });
                            });
                        }
                    });
                }
            }
        );
    } else {
        container.html(getPremiumElement);
    }
    requestsActivityLock = false;
}

let searchProfilesGroupInviteLock = false;

function searchProfilesGroupInvite(keyword) {

    if (searchProfilesGroupInviteLock) {
        return;
    }

    searchProfilesGroupInviteLock = true;

    const container = $("#groupInviteSearchResults");
    if (keyword) {
        keyword = keyword.toLowerCase();
        requestServer(
            "api/search/",
            {
                keyword: keyword,
                activeProfileID: activeUserData.profileID,
                searchType: "profile",
            },
            (data) => {
                if (!data.length) {
                    container.html(`<div class="dead-center"><img src="res/media/${currentTheme}/no-results-found.png" style="width: 200px;"><div class="fs-12 fw-500 text-muted">No match found</div><div class="p-5"></div></div>`);
                } else {
                    container.html("");
                    for (let i = 0; i < data.length; i++) {
                        let element = data[i];
                        checkActiveGroupConnection(element.profileID, (isConnected) => {
                            if (isConnected == "connected") {
                                container.append(profileCard(element.profileName, "", element.profileUsername, element.profileIconPath, "Remove", "manageActiveGroupConnection('" + element.profileID + "', 'deleteConnection')", "", "profilePage('" + element.profileID + "');", "profilePage('" + element.profileID + "');", "btn-outline-secondary"));
                            } else if (isConnected == "sent-request") {
                                container.append(profileCard(element.profileName, "", element.profileUsername, element.profileIconPath, "Cancel", "manageActiveGroupConnection('" + element.profileID + "', 'deleteConnection')", "", "profilePage('" + element.profileID + "');", "profilePage('" + element.profileID + "');", "btn-outline-secondary"));
                            } else if (isConnected == "received-request") {
                                container.append(profileCard(element.profileName, "", element.profileUsername, element.profileIconPath, "Accept", "manageActiveGroupConnection('" + element.profileID + "', 'acceptRequest')", "", "profilePage('" + element.profileID + "');", "profilePage('" + element.profileID + "');", "btn-outline-secondary"));
                            } else {
                                if (element.profileAccessType == "private") {
                                    container.append(profileCard(element.profileName, "", element.profileUsername, element.profileIconPath, "Invite", "manageActiveGroupConnection('" + element.profileID + "', 'sendRequest')", "", "profilePage('" + element.profileID + "');", "profilePage('" + element.profileID + "');"));
                                } else if (element.profileAccessType == "public") {
                                    container.append(profileCard(element.profileName, "", element.profileUsername, element.profileIconPath, "Add", "manageActiveGroupConnection('" + element.profileID + "', 'sendRequest')", "", "profilePage('" + element.profileID + "');", "profilePage('" + element.profileID + "');"));
                                }
                            }
                        });
                    }
                }
            }
        );
    } else {
        container.html(`<div class="dead-center"><img src="res/media/${currentTheme}/empty-box.png" style="width: 150px;"><div class="fs-12 fw-500 text-muted">Start typing in the search box</div><div class="p-5"></div></div>`);
    }
    searchProfilesGroupInviteLock = false;
}
function searchProfiles(keyword) {
    const container = $("#tabProfileSearchResult");
    if (keyword) {
        keyword = keyword.toLowerCase();
        requestServer(
            "api/search/",
            {
                keyword: keyword,
                activeProfileID: activeUserData.profileID,
                searchType: "profile",
            },
            (data) => {
                if (!data.length) {
                    container.html(`<div class="dead-center"><img src="res/media/${currentTheme}/no-results-found.png" style="width: 200px;"><div class="fs-12 fw-500 text-muted">No match found</div><div class="p-5"></div></div>`);
                } else {
                    container.html("");
                    for (let i = 0; i < data.length; i++) {
                        let element = data[i];
                        container.append(profileCard(element.profileName, "", element.profileUsername, element.profileIconPath, "", "", "", "profilePage('" + element.profileID + "');"));
                    }
                }
            }
        );
    } else {
        container.html(`<div class="dead-center"><img src="res/media/${currentTheme}/empty-box.png" style="width: 150px;"><div class="fs-12 fw-500 text-muted">Start typing in the search box</div><div class="p-5"></div></div>`);
    }
}
function searchGroups(keyword) {
    const container = $("#tabGroupSearchResult");
    if (!isProfilePremium) {
        container.html(getPremiumElementFull);
        return;
    }
    if (keyword) {
        keyword = keyword.toLowerCase();
        requestServer(
            "api/search/",
            {
                keyword: keyword,
                activeProfileID: activeUserData.profileID,
                searchType: "group",
            },
            (data) => {
                if (!data.length) {
                    container.html(`<div class="dead-center"><img src="res/media/${currentTheme}/no-results-found.png" style="width: 200px;"><div class="fs-12 fw-500 text-muted">No match found</div><div class="p-5"></div></div>`);
                } else {
                    container.html("");
                    for (let i = 0; i < data.length; i++) {
                        let element = data[i];
                        container.append(profileCard(element.groupName, "", element.groupUsername, element.groupIconPath, "", "", "", "groupPage('" + element.groupID + "');", "", "group"));
                    }
                }
            }
        );
    } else {
        container.html(`<div class="dead-center"><img src="res/media/${currentTheme}/empty-box.png" style="width: 150px;"><div class="fs-12 fw-500 text-muted">Start typing in the search box</div><div class="p-5"></div></div>`);
    }
}
function sendProfileMessage(event, messageType) {
    event.preventDefault();

    if (messageType == "text" && $("#activity-messaging-message-input").val().length == 0) {
        return;
    }

    let form = new FormData();

    let messageData = $("#activity-messaging-message-input").val();
    // html encode message data

    messageData = messageData.replace(/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g, (c) => {
        return "&#" + c.charCodeAt(0) + ";";
    });
    form.append("activeProfileID", activeUserData.profileID);
    form.append("otherProfileID", otherUserData.profileID);
    form.append("messageData", messageData);
    form.append("messageType", messageType);
    form.append("messageFile", $("#activity-messaging-message-file")[0].files[0]);
    form.append("messageKey", "");
    form.append("messageConversationType", "profile");

    requestServerForm("api/sendMessage/", form, (data) => {
        messageActivity(otherUserData.profileID);
        $("#activity-messaging-message-input").val("");
    });
}
function sendGroupMessage(event, messageType) {
    event.preventDefault();

    if (messageType == "text" && $("#activity-messaging-message-input-2").val().length == 0) {
        return;
    }

    let form = new FormData();

    let messageData = $("#activity-messaging-message-input-2").val();
    // html encode message data

    messageData = messageData.replace(/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g, (c) => {
        return "&#" + c.charCodeAt(0) + ";";
    });
    form.append("activeProfileID", activeUserData.profileID);
    form.append("otherProfileID", otherUserData.groupID);
    form.append("messageData", messageData);
    form.append("messageType", messageType);
    form.append("messageFile", $("#activity-messaging-message-file-2")[0].files[0]);
    form.append("messageKey", "");
    form.append("messageConversationType", "group");

    requestServerForm("api/sendMessage/", form, (data) => {
        groupMessageActivity(otherUserData.groupID);
        $("#activity-messaging-message-input-2").val("");
    });
}
function updateProfile(type, profileName = "", profileDescription = "", profileIcon = "", profileIconVisibility = "", profileDescriptionVisibility = "", profileAccessType = "") {
    let updateForm = new FormData();

    if (type == "group") {
        updateForm.append("groupID", activeGroupID);
        address = "api/updateGroupDetails/";
    } else if (type == "profile") {
        updateForm.append("profileID", activeUserData.profileID);
        address = "api/updateProfileDetails/";
    }
    if (profileName) {
        updateForm.append(type + "Name", $("#" + profileName).val());
    }
    if (profileDescription) {
        updateForm.append(type + "Description", $("#" + profileDescription).val());
    }
    if ($("#" + profileIcon)[0].files[0]) {
        updateForm.append(type + "Icon", $("#" + profileIcon)[0].files[0]);
    }
    if (profileIconVisibility) {
        updateForm.append(type + "IconVisibility", $("#" + profileIconVisibility).val());
    }
    if (profileDescriptionVisibility) {
        updateForm.append(type + "DescriptionVisibility", $("#" + profileDescriptionVisibility).val());
    }
    if (profileAccessType) {
        updateForm.append(type + "AccessType", $("#" + profileAccessType).val());
    }

    requestServerForm(address, updateForm, (data) => {
        if (type == "group") {
            popupMessage("Group details updated", "Your group details has been updated successfully.", closeButton);
        } else if (type == "profile") {
            popupMessage("Profile updated", "Your profile has been updated successfully.", closeButton);
        }
        if (type == "group") {
            groupDetails();
        } else if (type == "profile") {
            profileDetails();
        }
    });
}
function updateProfileDetails() {
    updateProfile("profile", "profile-details-name", "profile-details-description", "profile-details-icon-input", "profile-details-icon-visibility", "profile-details-description-visibility", "profile-details-access-type");
}
function updateGroupDetails() {
    updateProfile("group", "group-details-name", "group-details-description", "group-details-icon-input", "group-details-icon-visibility", "group-details-description-visibility", "group-details-access-type");
}
function removeProfilePhoto(profileType) {
    let pid = profileType == "profile" ? activeUserData.profileID : activeGroupID;

    popupPrompt("Remove profile photo", "Are you sure you want to remove your profile photo?");

    popupPromptCallback = (action) => {
        if (action) {
            requestServer(
                "api/removeProfileIcon/",
                {
                    profileID: pid,
                    profileType: profileType,
                },
                (data) => {
                    if (profileType == "profile") {
                        profileDetails();
                    } else if (profileType == "group") {
                        groupDetails();
                    }
                }
            );
        }
    };
}
function getMessageDeliveryStatus() {
    requestServer(
        "api/getMessageDeliveryStatus/",
        {
            messageID: activeMessageID,
        },
        (data) => {
            activity("activity-group-message-delivery-status");
            let container = $("#activity-group-message-delivery-status-wrapper");
            container.html("");
            data.statuses.forEach((status) => {
                getProfileData(status.profileID, (profileData) => {
                    let statusString = "";
                    if (status.messageStatus == "Sent") {
                        statusString = "Sent at " + getMessageTime(status.messageSentOn);
                    } else if (status.messageStatus == "Delivered") {
                        statusString = "Delivered at " + getMessageTime(status.messageReceivedOn);
                    } else if (status.messageStatus == "Seen") {
                        statusString = "Seen at " + getMessageTime(status.messageSeenOn);
                    }
                    container.append(profileCard(profileData.profileName, "", statusString, profileData.profileIconPath, "", "", "", "profilePage(" + profileData.profileID + ")", "profilePage(" + profileData.profileID + ")"));
                });
            });
        }
    );
}
function getMessageTime(time) {
    console.log(time);
    time = time.split(" ")[1];
    time = time.split(":")[0] + ":" + time.split(":")[1];
    return time;
}
function sendProtectedText(messageDomain) {
    popupInput("Type your message", "", "", "text");
    popupInputCallback = (message) => {
        if (!message) {
            popupMessage("Message not sent", "You must enter a message to send.", closeButton);
        } else {
            popupInput("Type the password", "", "", "password");
            popupInputCallback = (password) => {
                if (!password) {
                    popupMessage("Message not sent", "You must enter a password to send.", closeButton);
                } else {
                    if (messageDomain == "profile") {
                        let form = new FormData();
                        let messageData = message;
                        messageData = messageData.replace(/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g, (c) => {
                            return "&#" + c.charCodeAt(0) + ";";
                        });
                        form.append("activeProfileID", activeUserData.profileID);
                        form.append("otherProfileID", otherUserData.profileID);
                        form.append("messageData", messageData);
                        form.append("messageType", "text");
                        form.append("messageFile", "");
                        form.append("messageKey", password);
                        form.append("messageConversationType", "profile");

                        requestServerForm("api/sendMessage/", form, (data) => {
                            popup();
                            messageActivity(otherUserData.profileID);
                            $("#activity-messaging-message-input").val("");
                        });
                    } else if (messageDomain == "group") {
                        let form = new FormData();
                        let messageData = message;
                        messageData = messageData.replace(/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g, (c) => {
                            return "&#" + c.charCodeAt(0) + ";";
                        });
                        form.append("activeProfileID", activeUserData.profileID);
                        form.append("otherProfileID", otherUserData.groupID);
                        form.append("messageData", messageData);
                        form.append("messageType", "text");
                        form.append("messageFile", "");
                        form.append("messageKey", password);
                        form.append("messageConversationType", "group");

                        requestServerForm("api/sendMessage/", form, (data) => {
                            popup();
                            groupMessageActivity(otherUserData.groupID);
                            $("#activity-messaging-message-input").val("");
                        });
                    }
                }
            };
        }
    };
}
function sendProtectedDocument(messageDomain, event) {
    popupPrompt("Send Document", `Are you sure you want to send <span class='fw-600'>${event.target.files[0].name}</div>?`, "Send", "");
    popupPromptCallback = (act) => {
        if (act) {
            setTimeout(() => {
                popupInput("Type the password", "", "", "password");
            }, 200);
            popupInputCallback = (password) => {
                if (!password) {
                    popupMessage("Message not sent", "You must enter a password to send.", closeButton);
                } else {
                    if (messageDomain == "profile") {
                        let form = new FormData();
                        form.append("activeProfileID", activeUserData.profileID);
                        form.append("otherProfileID", otherUserData.profileID);
                        form.append("messageData", "");
                        form.append("messageType", "document");
                        form.append("messageFile", event.target.files[0]);
                        form.append("messageKey", password);
                        form.append("messageConversationType", "profile");

                        requestServerForm("api/sendMessage/", form, (data) => {
                            popup();
                            messageActivity(otherUserData.profileID);
                            $("#activity-messaging-message-input").val("");
                        });
                    } else if (messageDomain == "group") {
                        let form = new FormData();
                        form.append("activeProfileID", activeUserData.profileID);
                        form.append("otherProfileID", otherUserData.groupID);
                        form.append("messageData", "");
                        form.append("messageType", "document");
                        form.append("messageFile", event.target.files[0]);
                        form.append("messageKey", password);
                        form.append("messageConversationType", "group");

                        requestServerForm("api/sendMessage/", form, (data) => {
                            popup();
                            groupMessageActivity(otherUserData.groupID);
                            $("#activity-messaging-message-input").val("");
                        });
                    }
                }
            };
        }
    };
}
function protectedMessagePreview(messageType, messageKey, messageData, messageFilePath) {
    popupInput("Type the password", "", "", "password");
    popupInputCallback = (password) => {
        if (!password) {
            return;
        } else {
            if (password == messageKey) {
                if (messageType == "text") {
                    popupMessage("Message", messageData, closeButton);
                } else if (messageType == "image") {
                    mediaPreview(messageFilePath, "image", messageData);
                } else if (messageType == "video") {
                    mediaPreview(messageFilePath, "video", messageData);
                } else if (messageType == "document") {
                    mediaPreview(messageFilePath, "document", messageData);
                }
            } else {
                popupMessage("Error", "The password you entered is incorrect.", closeButton);
            }
        }
    };
}
