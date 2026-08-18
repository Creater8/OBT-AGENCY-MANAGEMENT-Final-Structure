"use strict";

/* ==========================================================
   OBT AGENCY MANAGEMENT SYSTEM
   Login Page JavaScript

   Author  : NTPC
   Version : 1.0

   NOTE:
   The credentials below are TEMPORARY DEVELOPMENT
   credentials only.

   They will later be replaced by actual
   backend authentication / User & Role Management.
========================================================== */


/* ==========================================================
   STORAGE KEY
========================================================== */

const LOGIN_STORAGE_KEY =
    "obt_logged_in_user";


/* ==========================================================
   REMEMBERED USERNAME STORAGE KEY
========================================================== */

const REMEMBERED_USERNAME_KEY =
    "obt_remembered_username";


/* ==========================================================
   TEMPORARY DEVELOPMENT USERS
========================================================== */

/*
    IMPORTANT:
    These users are only for frontend development/testing.

    Do NOT use these credentials in production.

    Later these records will come from the
    backend / database / User & Role Management module.
*/

const TEMPORARY_USERS = [

    {
        username: "admin",
        password: "admin123",
        name: "System Administrator",
        role: "Administrator"
    },

    {
        username: "coordinator",
        password: "coord123",
        name: "Training Coordinator",
        role: "Coordinator"
    }

];


/* ==========================================================
   DOM CACHE
========================================================== */

const dom = {

    loginForm:
        document.getElementById("loginForm"),

    username:
        document.getElementById("username"),

    password:
        document.getElementById("password"),

    rememberMe:
        document.getElementById("rememberMe"),

    togglePassword:
        document.getElementById("togglePassword")

};



/* ==========================================================
   PAGE INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeLogin
);


/* ==========================================================
   INITIALIZE LOGIN
========================================================== */

function initializeLogin() {

    /*
        Bind login form.
    */

    bindLoginForm();


    /*
        Bind password visibility toggle.
    */

    bindPasswordToggle();


    /*
        Restore remembered username.
    */

    restoreRememberedUsername();

}


/* ==========================================================
   LOGIN FORM EVENT
========================================================== */

function bindLoginForm() {

    if (!dom.loginForm) {

        return;

    }


    dom.loginForm.addEventListener(
        "submit",
        handleLogin
    );

}


/* ==========================================================
   PASSWORD TOGGLE EVENT
========================================================== */

function bindPasswordToggle() {

    if (
        !dom.togglePassword ||
        !dom.password
    ) {

        return;

    }


    dom.togglePassword.addEventListener(
        "click",
        togglePasswordVisibility
    );

}


/* ==========================================================
   TOGGLE PASSWORD VISIBILITY
========================================================== */

function togglePasswordVisibility() {

    const icon =
        dom.togglePassword
            ? dom.togglePassword.querySelector("i")
            : null;


    if (
        dom.password.type === "password"
    ) {

        dom.password.type = "text";


        if (icon) {

            icon.classList.remove(
                "fa-eye"
            );

            icon.classList.add(
                "fa-eye-slash"
            );

        }

    }

    else {

        dom.password.type = "password";


        if (icon) {

            icon.classList.remove(
                "fa-eye-slash"
            );

            icon.classList.add(
                "fa-eye"
            );

        }

    }

}


/* ==========================================================
   HANDLE LOGIN
========================================================== */

function handleLogin(event) {

    event.preventDefault();


    /*
        Clear previous errors.
    */

    clearValidation();


    /*
        Read username.
    */

    const username =
        dom.username
            ? dom.username.value.trim()
            : "";


    /*
        Read password.
    */

    const password =
        dom.password
            ? dom.password.value
            : "";


    /* ------------------------------------------------------
       USERNAME VALIDATION
    ------------------------------------------------------ */

    if (!username) {

        showLoginError(
            "Please enter your username."
        );

        focusElement(
            dom.username
        );

        return;

    }


    /* ------------------------------------------------------
       PASSWORD VALIDATION
    ------------------------------------------------------ */

    if (!password) {

        showLoginError(
            "Please enter your password."
        );

        focusElement(
            dom.password
        );

        return;

    }


    /* ------------------------------------------------------
       FIND USER
    ------------------------------------------------------ */

    const user =
        TEMPORARY_USERS.find(
            storedUser =>

                storedUser.username === username &&
                storedUser.password === password
        );


    /* ------------------------------------------------------
       INVALID CREDENTIALS
    ------------------------------------------------------ */

    if (!user) {

        showLoginError(
            "Invalid username or password."
        );


        if (dom.password) {

            dom.password.value = "";

        }


        focusElement(
            dom.password
        );

        return;

    }


    /* ------------------------------------------------------
       CREATE SESSION
    ------------------------------------------------------ */

    createLoginSession(
        user
    );


    /* ------------------------------------------------------
       REMEMBER USERNAME
    ------------------------------------------------------ */

    handleRememberMe(
        username
    );


    /* ------------------------------------------------------
       REDIRECT
    ------------------------------------------------------ */

    redirectToDashboard();

}


/* ==========================================================
   CREATE LOGIN SESSION
========================================================== */

/*
    This function creates the temporary frontend session.

    Later, the backend authentication response can provide
    the same user information.

    Dashboard expects:

        username
        name
        role
*/

function createLoginSession(user) {

    if (!user) {

        return;

    }


    const loggedInUser = {

        username:
            user.username,

        name:
            user.name,

        role:
            user.role,

        loginTime:
            new Date().toISOString()

    };


    localStorage.setItem(
        LOGIN_STORAGE_KEY,
        JSON.stringify(
            loggedInUser
        )
    );

}


/* ==========================================================
   REMEMBER ME
========================================================== */

function handleRememberMe(username) {

    if (!dom.rememberMe) {

        return;

    }


    if (
        dom.rememberMe.checked
    ) {

        localStorage.setItem(
            REMEMBERED_USERNAME_KEY,
            username
        );

    }

    else {

        localStorage.removeItem(
            REMEMBERED_USERNAME_KEY
        );

    }

}


/* ==========================================================
   RESTORE REMEMBERED USERNAME
========================================================== */

function restoreRememberedUsername() {

    if (!dom.username) {

        return;

    }


    const rememberedUsername =
        localStorage.getItem(
            REMEMBERED_USERNAME_KEY
        );


    if (!rememberedUsername) {

        return;

    }


    dom.username.value =
        rememberedUsername;


    if (dom.rememberMe) {

        dom.rememberMe.checked =
            true;

    }

}


/* ==========================================================
   REDIRECT TO DASHBOARD
========================================================== */

function redirectToDashboard() {

    /*
        index.html is located at the project root.

        Dashboard:

        modules/dashboard/dashboard.html
    */

    window.location.href =
        "modules/dashboard/dashboard.html";

}


/* ==========================================================
   LOGIN ERROR
========================================================== */

function showLoginError(message) {

    /*
        Remove existing error.
    */

    const existingError =
        document.getElementById(
            "loginError"
        );


    if (existingError) {

        existingError.remove();

    }


    /*
        Create error element.
    */

    const errorElement =
        document.createElement(
            "div"
        );


    errorElement.id =
        "loginError";


    errorElement.className =
        "alert alert-danger mt-3 mb-0";


    errorElement.setAttribute(
        "role",
        "alert"
    );


    errorElement.innerHTML =

        `<i class="fas fa-circle-exclamation me-2"></i>
         ${escapeHtml(message)}`;


    /*
        Add error below the form.
    */

    if (dom.loginForm) {

        dom.loginForm.appendChild(
            errorElement
        );

    }

}


/* ==========================================================
   CLEAR VALIDATION
========================================================== */

function clearValidation() {

    const existingError =
        document.getElementById(
            "loginError"
        );


    if (existingError) {

        existingError.remove();

    }


    if (dom.username) {

        dom.username.classList.remove(
            "is-invalid"
        );

    }


    if (dom.password) {

        dom.password.classList.remove(
            "is-invalid"
        );

    }

}


/* ==========================================================
   FOCUS ELEMENT
========================================================== */

function focusElement(element) {

    if (!element) {

        return;

    }


    setTimeout(
        () => element.focus(),
        0
    );

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}