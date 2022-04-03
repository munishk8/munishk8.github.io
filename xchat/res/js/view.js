var current_view = null;
var current_overlay = null;
var last_view_id = null;
var view_history = [];
var next_view = [];

function overlay(overlay_id = "") {
    $(".popup-window").addClass("menu-out");
    $(".popup-overlay").addClass("overlay-out");
    
    setTimeout(() => {
        $(".popup-window").removeClass("menu-out");
        $(".popup-overlay").removeClass("overlay-out");
        $(".overlay").removeClass("overlay-active");

        if (overlay_id) {
            $("#" + overlay_id).addClass("overlay-active");
            current_overlay = overlay_id;
        } else {
            current_overlay = null;
        }
    }, 200);
}

function view(view_id, hide_overlays = true, go_back = false) {
    if (flags["view_process"]) {
        next_view.push({
            view_id: view_id,
            hide_overlays: hide_overlays,
            go_back: go_back,
        });
    } else {
        view_switch(view_id, hide_overlays, go_back);
    }
}

function view_switch(view_id, hide_overlays = true, go_back = false) {
    if (current_view != view_id) {
        flags["view_process"] = true;
        flags["view_back_flag"] = go_back;
        if (!go_back && !["splash"].includes(current_view)) {
            view_history.push(current_view);
            window.history.pushState(null, null, null);
        }
        last_view_id = current_view;
        current_view = view_id;
        setTimeout(() => {
            if (hide_overlays) overlay();
            $(".view").removeClass("view-active");
            $(".view").removeClass("view-active-back");
            $("#" + last_view_id).addClass("view-out");
            if (go_back) $("#" + view_id).addClass("view-active-back");
            else $("#" + view_id).addClass("view-active");
            setTimeout(() => {
                $(".view").removeClass("view-out");
                $("#" + last_view_id).removeClass("view-active");
                $("#" + last_view_id).removeClass("view-active-back");
                flags["view_process"] = false;
                var view_data = next_view.pop();
                if (view_data) {
                    view(
                        view_data.view_id,
                        view_data.hide_overlays,
                        view_data.go_back
                    );
                }
            }, 500);
        }, 200);
    }
}

function last_view() {
    let last = view_history.pop();
    if (last) {
        if (current_view == last) {
            console.log("current view same as last.");
            view(view_history.pop(), true, true);
        } else view(last, true, true);
    } else {
        view(initial_view, true, true);
    }
}

window.onpopstate = () => {
    last_view();
};
