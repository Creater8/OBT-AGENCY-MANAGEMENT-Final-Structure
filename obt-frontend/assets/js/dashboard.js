"use strict";

/* ==========================================================
OBT AGENCY MANAGEMENT SYSTEM
DASHBOARD JAVASCRIPT
========================================================== */

/* ==========================================================
LOCAL STORAGE KEYS
========================================================== */

var AGENCIES_KEY = "obt_agencies";
var COORDINATORS_KEY = "obt_coordinators";
var LOGGED_IN_USER_KEY = "obt_logged_in_user";

/* ==========================================================
GLOBAL DATA
========================================================== */

var dashboardAgencies = [];
var dashboardCoordinators = [];

/* ==========================================================
DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", function () {


initializeDashboard();


});

/* ==========================================================
INITIALIZE DASHBOARD
========================================================== */

function initializeDashboard() {


loadLoggedInUser();

loadDashboardData();

registerDashboardEvents();

renderDashboardStatistics();

populateTrainingDropdown();

clearTrainingDetails();

}

/* ==========================================================
LOAD LOGGED-IN USER
========================================================== */

function loadLoggedInUser() {


var userElement =
    document.getElementById("loggedInUserName");

if (!userElement) {
    return;
}

var loggedInUser =
    localStorage.getItem(LOGGED_IN_USER_KEY);

if (loggedInUser) {

    userElement.textContent = loggedInUser;

} else {

    userElement.textContent = "Administrator";

}


}

/* ==========================================================
LOAD DASHBOARD DATA
========================================================== */

function loadDashboardData() {

loadAgencies();

loadCoordinators();


}

/* ==========================================================
LOAD AGENCIES
========================================================== */

function loadAgencies() {


var storedAgencies =
    localStorage.getItem(AGENCIES_KEY);

if (!storedAgencies) {

    dashboardAgencies = [];

    return;

}

try {

    dashboardAgencies =
        JSON.parse(storedAgencies);

    if (!Array.isArray(dashboardAgencies)) {

        dashboardAgencies = [];

    }

} catch (error) {

    console.error(
        "Unable to load agencies:",
        error
    );

    dashboardAgencies = [];

}


}

/* ==========================================================
LOAD COORDINATORS
========================================================== */

function loadCoordinators() {


var storedCoordinators =
    localStorage.getItem(COORDINATORS_KEY);

if (!storedCoordinators) {

    dashboardCoordinators = [];

    return;

}

try {

    dashboardCoordinators =
        JSON.parse(storedCoordinators);

    if (!Array.isArray(dashboardCoordinators)) {

        dashboardCoordinators = [];

    }

} catch (error) {

    console.error(
        "Unable to load coordinators:",
        error
    );

    dashboardCoordinators = [];

}


}

/* ==========================================================
REGISTER DASHBOARD EVENTS
========================================================== */

function registerDashboardEvents() {


var trainingSelect =
    document.getElementById("trainingSelect");

var logoutBtn =
    document.getElementById("logoutBtn");


/* ======================================================
   TRAINING SELECT
====================================================== */

if (trainingSelect) {

    trainingSelect.addEventListener(
        "change",
        function () {

            var selectedId =
                trainingSelect.value;

            if (selectedId === "") {

                clearTrainingDetails();

                return;

            }

            showTrainingDetails(selectedId);

        }
    );

}


/* ======================================================
   LOGOUT
====================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            logoutUser();

        }
    );

}


}

/* ==========================================================
RENDER DASHBOARD STATISTICS
========================================================== */

function renderDashboardStatistics() {


var totalAgenciesElement =
    document.getElementById("totalAgencies");

var totalCoordinatorsElement =
    document.getElementById("totalCoordinators");

var activeCoordinatorsElement =
    document.getElementById("activeTrainings");

var inactiveCoordinatorsElement =
    document.getElementById("upcomingTrainings");


if (totalAgenciesElement) {

    totalAgenciesElement.textContent =
        dashboardAgencies.length;

}


if (totalCoordinatorsElement) {

    totalCoordinatorsElement.textContent =
        dashboardCoordinators.length;

}


var activeCount = 0;

var inactiveCount = 0;

var i;


for (
    i = 0;
    i < dashboardCoordinators.length;
    i++
) {

    var coordinator =
        dashboardCoordinators[i];


    if (
        coordinator.status &&
        String(coordinator.status).toLowerCase() ===
        "active"
    ) {

        activeCount++;

    } else {

        inactiveCount++;

    }

}


if (activeCoordinatorsElement) {

    activeCoordinatorsElement.textContent =
        activeCount;

}


if (inactiveCoordinatorsElement) {

    inactiveCoordinatorsElement.textContent =
        inactiveCount;

}


}

/* ==========================================================
POPULATE TRAINING DROPDOWN
========================================================== */

function populateTrainingDropdown() {


var trainingSelect =
    document.getElementById("trainingSelect");

if (!trainingSelect) {

    return;

}


trainingSelect.innerHTML = "";


var defaultOption =
    document.createElement("option");

defaultOption.value = "";

defaultOption.textContent =
    "Select a training program";

trainingSelect.appendChild(
    defaultOption
);


if (dashboardCoordinators.length === 0) {

    return;

}


var i;


for (
    i = 0;
    i < dashboardCoordinators.length;
    i++
) {

    var coordinator =
        dashboardCoordinators[i];


    var option =
        document.createElement("option");


    option.value =
        String(coordinator.id);


    /*
     * Use Batch Name in the dropdown.
     */

    option.textContent =
        coordinator.batchName ||
        coordinator.name ||
        "Unnamed Training";


    trainingSelect.appendChild(
        option
    );

}


}

/* ==========================================================
SHOW SELECTED TRAINING DETAILS
========================================================== */

function showTrainingDetails(id) {


var coordinator =
    findCoordinatorById(id);


if (!coordinator) {

    clearTrainingDetails();

    return;

}


/*
 * ======================================================
 * COORDINATOR
 * ======================================================
 */

setElementText(
    "trainingCoordinator",
    coordinator.name
);


/*
 * ======================================================
 * BATCH NAME
 * ======================================================
 */

setElementText(
    "trainingBatchName",
    coordinator.batchName
);


/*
 * ======================================================
 * DATE
 * ======================================================
 */

setElementText(
    "trainingDate",
    formatDateRange(
        coordinator.startDate,
        coordinator.endDate
    )
);


/*
 * ======================================================
 * DESIGNATION
 * ======================================================
 */

setElementText(
    "trainingDesignation",
    coordinator.designation
);


/*
 * ======================================================
 * PHONE
 * ======================================================


*/


setElementText(
    "trainingPhone",
    coordinator.phone
);


/*
 * ======================================================
 * EMAIL
 * ======================================================


*/


setElementText(
    "trainingEmail",
    coordinator.email
);


/*
 * ======================================================
 * AGENCY
 * ======================================================
=

*/


setElementText(
    "trainingAgency",
    coordinator.agency
);


/*
 * ======================================================
 * DURATION
 * ======================================================


*/


setElementText(
    "trainingDuration",
    calculateDuration(
        coordinator.startDate,
        coordinator.endDate
    )
);


/*
 * ======================================================
 * PROGRAM
 * ======================================================


*/

setElementText(
    "trainingProgram",
    coordinator.batchName
);


/*
 * ======================================================
 * STATUS
 * ======================================================


*/


updateStatusBadge(
    coordinator.status
);


}

/* ==========================================================
CLEAR TRAINING DETAILS
========================================================== */

function clearTrainingDetails() {

setElementText(
    "trainingCoordinator",
    ""
);


setElementText(
    "trainingBatchName",
    ""
);


setElementText(
    "trainingDate",
    ""
);


setElementText(
    "trainingDesignation",
    ""
);


setElementText(
    "trainingPhone",
    ""
);


setElementText(
    "trainingEmail",
    ""
);


setElementText(
    "trainingAgency",
    ""
);


setElementText(
    "trainingDuration",
    ""
);


setElementText(
    "trainingProgram",
    ""
);


setElementText(
    "trainingVenue",
    ""
);


setElementText(
    "trainingParticipants",
    ""
);


updateStatusBadge("");


}

/* ==========================================================
CALCULATE DURATION
========================================================== */

function calculateDuration(startDate, endDate) {

if (!startDate || !endDate) {

    return "";

}


var start =
    new Date(startDate + "T00:00:00");

var end =
    new Date(endDate + "T00:00:00");


if (
    isNaN(start.getTime()) ||
    isNaN(end.getTime())
) {

    return "";

}


var difference =
    end.getTime() -
    start.getTime();


var days =
    Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
    ) + 1;


if (days <= 0) {

    return "";

}


if (days === 1) {

    return "1 Day";

}


return days + " Days";


}

/* ==========================================================
UPDATE STATUS BADGE
========================================================== */

function updateStatusBadge(status) {


var element =
    document.getElementById(
        "trainingStatus"
    );


if (!element) {

    return;

}


element.textContent =
    status || "";


element.className =
    "status-badge";


if (!status) {

    return;

}


if (
    String(status).toLowerCase() ===
    "active"
) {

    element.classList.add(
        "status-active"
    );

} else {

    element.classList.add(
        "status-inactive"
    );

}


}

/* ==========================================================
FIND COORDINATOR BY ID
========================================================== */

function findCoordinatorById(id) {

var i;


for (
    i = 0;
    i < dashboardCoordinators.length;
    i++
) {

    if (
        String(
            dashboardCoordinators[i].id
        ) === String(id)
    ) {

        return dashboardCoordinators[i];

    }

}


return null;


}

/* ==========================================================
SET ELEMENT TEXT
========================================================== */

function setElementText(
elementId,
value
) {

var element =
    document.getElementById(
        elementId
    );


if (!element) {

    return;

}


if (
    value === null ||
    value === undefined ||
    value === ""
) {

    element.innerHTML =
        "&nbsp;";

    return;

}


element.textContent =
    String(value);


}

/* ==========================================================
FORMAT DATE RANGE
========================================================== */

function formatDateRange(
startDate,
endDate
) {


if (
    !startDate &&
    !endDate
) {

    return "";

}


if (!startDate) {

    return formatDate(endDate);

}


if (!endDate) {

    return formatDate(startDate);

}


return (
    formatDate(startDate) +
    " to " +
    formatDate(endDate)
);


}

/* ==========================================================
FORMAT DATE

INPUT:
2026-03-02

OUTPUT:
02-03-2026
========================================================== */

function formatDate(dateString) {

if (!dateString) {

    return "";

}


var parts =
    String(dateString).split("-");


if (parts.length !== 3) {

    return dateString;

}


var year =
    parts[0];

var month =
    parts[1];

var day =
    parts[2];


return (
    day +
    "-" +
    month +
    "-" +
    year
);


}

/* ==========================================================
LOGOUT USER
========================================================== */

function logoutUser() {


localStorage.removeItem(
    LOGGED_IN_USER_KEY
);


window.location.href =
    "../../index.html";


}

/* ==========================================================
REFRESH DASHBOARD
========================================================== */

function refreshDashboard() {


loadDashboardData();

renderDashboardStatistics();

populateTrainingDropdown();

clearTrainingDetails();


}

/* ==========================================================
STORAGE EVENT

This allows the dashboard to update when
agencies/coordinators are changed in another tab.
========================================================== */

window.addEventListener(
"storage",
function (event) {


    if (
        event.key === AGENCIES_KEY ||
        event.key === COORDINATORS_KEY
    ) {

        refreshDashboard();

    }


    if (
        event.key === LOGGED_IN_USER_KEY
    ) {

        loadLoggedInUser();

    }

}


);
