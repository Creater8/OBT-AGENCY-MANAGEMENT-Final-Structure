
"use strict";

/* ==========================================================
   OBT AGENCY MANAGEMENT SYSTEM
   Login Page JavaScript

   Authentication:
       Frontend
          ↓
       api.js
          ↓
       POST /api/auth/login
          ↓
       Spring Boot AuthController
          ↓
       AuthService
          ↓
       MySQL users table

   IMPORTANT:
   - No temporary frontend users.
   - Password is never stored in localStorage.
   - Backend is the source of truth for authentication.
========================================================== */


/* ==========================================================
   STORAGE KEYS
========================================================== */

const LOGIN_STORAGE_KEY =
    "obt_logged_in_user";


const REMEMBERED_USERNAME_KEY =
    "obt_remembered_username";


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

    bindLoginForm();

    bindPasswordToggle();

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

async function handleLogin(event) {

    event.preventDefault();


    clearValidation();


    /* ------------------------------------------------------
       READ USERNAME
    ------------------------------------------------------ */

    const username =
        dom.username
            ? dom.username.value.trim()
            : "";


    /* ------------------------------------------------------
       READ PASSWORD
    ------------------------------------------------------ */

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

        markInvalid(
            dom.username
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

        markInvalid(
            dom.password
        );

        focusElement(
            dom.password
        );

        return;

    }


    /* ------------------------------------------------------
       DISABLE LOGIN BUTTON
    ------------------------------------------------------ */

    const loginButton =
        dom.loginForm
            ? dom.loginForm.querySelector(
                'button[type="submit"]'
            )
            : null;


    setLoginButtonState(
        loginButton,
        true
    );


    try {

        /* --------------------------------------------------
           BACKEND LOGIN REQUEST
        -------------------------------------------------- */

        const loginResponse =
            await loginUserApi(
                username,
                password
            );


        /* --------------------------------------------------
           VERIFY RESPONSE
        -------------------------------------------------- */

        if (!loginResponse) {

            throw new Error(
                "Invalid response received from the server."
            );

        }


        /* --------------------------------------------------
           CREATE FRONTEND SESSION
        -------------------------------------------------- */

        createLoginSession(
            loginResponse
        );


        /* --------------------------------------------------
           REMEMBER USERNAME
        -------------------------------------------------- */

        handleRememberMe(
            username
        );


        /* --------------------------------------------------
           REDIRECT
        -------------------------------------------------- */

        redirectToDashboard();


    }

    catch (error) {

        console.error(
            "Login failed:",
            error
        );


        showLoginError(
            getLoginErrorMessage(
                error
            )
        );


        if (dom.password) {

            dom.password.value = "";

        }


        markInvalid(
            dom.password
        );


        focusElement(
            dom.password
        );

    }

    finally {

        setLoginButtonState(
            loginButton,
            false
        );

    }

}


/* ==========================================================
   BACKEND LOGIN API
========================================================== */

/*
   Calls:

       POST /api/auth/login

   Request:

       {
           username: "...",
           password: "..."
       }

   Response:

       {
           id: 8,
           username: "...",
           name: "...",
           email: "...",
           role: "...",
           status: "ACTIVE"
       }
*/

async function loginUserApi(
    username,
    password
) {

    return await apiRequest(

        "/auth/login",

        {

            method: "POST",

            body: {

                username:
                    username,

                password:
                    password

            }

        }

    );

}


/* ==========================================================
   CREATE LOGIN SESSION
========================================================== */

/*
   IMPORTANT:

   The password is NOT stored.

   Only the authenticated user's
   information returned by the backend
   is stored.

   Dashboard expects:

       username
       name
       role
*/

function createLoginSession(
    user
) {

    if (!user) {

        return;

    }


    const loggedInUser = {

        id:
            user.id,

        username:
            user.username,

        name:
            user.name,

        email:
            user.email,

        role:
            user.role,

        status:
            user.status,

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

function handleRememberMe(
    username
) {

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
        index.html is at project root.

        Dashboard:

        modules/dashboard/dashboard.html
    */

    window.location.href =
        "modules/dashboard/dashboard.html";

}


/* ==========================================================
   LOGIN ERROR MESSAGE
========================================================== */

function getLoginErrorMessage(
    error
) {

    if (!error) {

        return "Login failed.";

    }


    if (error.message) {

        return error.message;

    }


    return "Invalid username or password.";

}


/* ==========================================================
   SHOW LOGIN ERROR
========================================================== */

function showLoginError(
    message
) {

    const existingError =
        document.getElementById(
            "loginError"
        );


    if (existingError) {

        existingError.remove();

    }


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
   MARK FIELD INVALID
========================================================== */

function markInvalid(
    element
) {

    if (!element) {

        return;

    }


    element.classList.add(
        "is-invalid"
    );

}


/* ==========================================================
   LOGIN BUTTON STATE
========================================================== */

function setLoginButtonState(
    button,
    loading
) {

    if (!button) {

        return;

    }


    if (loading) {

        button.disabled =
            true;


        button.dataset.originalHtml =
            button.innerHTML;


        button.innerHTML =

            `<span class="spinner-border spinner-border-sm me-2"
                   role="status"
                   aria-hidden="true"></span>
             Logging in...`;

    }

    else {

        button.disabled =
            false;


        if (
            button.dataset.originalHtml
        ) {

            button.innerHTML =
                button.dataset.originalHtml;

        }

    }

}


/* ==========================================================
   FOCUS ELEMENT
========================================================== */

function focusElement(
    element
) {

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

function escapeHtml(
    value
) {

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

