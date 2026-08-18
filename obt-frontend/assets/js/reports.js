"use strict";

/* ==========================================================
OBT AGENCY MANAGEMENT SYSTEM
REPORTS JAVASCRIPT
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

var reportAgencies = [];
var reportCoordinators = [];
var generatedReportData = [];

/* ==========================================================
DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

initializeReports();

});

/* ==========================================================
INITIALIZE REPORTS
========================================================== */

function initializeReports() {

loadLoggedInUser();

loadReportData();

registerReportEvents();

showInitialReportMessage();

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

    userElement.textContent =
        loggedInUser;

} else {

    userElement.textContent =
        "Administrator";

}

}

/* ==========================================================
LOAD REPORT DATA
========================================================== */

function loadReportData() {

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

    reportAgencies = [];

    return;

}


try {

    reportAgencies =
        JSON.parse(storedAgencies);


    if (!Array.isArray(reportAgencies)) {

        reportAgencies = [];

    }

} catch (error) {

    console.error(
        "Unable to load agencies:",
        error
    );

    reportAgencies = [];

}

}

/* ==========================================================
LOAD COORDINATORS
========================================================== */

function loadCoordinators() {

var storedCoordinators =
    localStorage.getItem(COORDINATORS_KEY);


if (!storedCoordinators) {

    reportCoordinators = [];

    return;

}


try {

    reportCoordinators =
        JSON.parse(storedCoordinators);


    if (!Array.isArray(reportCoordinators)) {

        reportCoordinators = [];

    }

} catch (error) {

    console.error(
        "Unable to load coordinators:",
        error
    );

    reportCoordinators = [];

}

}

/* ==========================================================
REGISTER EVENTS
========================================================== */

function registerReportEvents() {

var generateReportBtn =
    document.getElementById(
        "generateReportBtn"
    );


var clearReportBtn =
    document.getElementById(
        "clearReportBtn"
    );


var printReportBtn =
    document.getElementById(
        "printReportBtn"
    );


var logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


/* ======================================================
   GENERATE REPORT
====================================================== */

if (generateReportBtn) {

    generateReportBtn.addEventListener(
        "click",
        function () {

            generateReport();

        }
    );

}


/* ======================================================
   CLEAR REPORT
====================================================== */

if (clearReportBtn) {

    clearReportBtn.addEventListener(
        "click",
        function () {

            clearReport();

        }
    );

}


/* ======================================================
   PRINT REPORT
====================================================== */

if (printReportBtn) {

    printReportBtn.addEventListener(
        "click",
        function () {

            printReport();

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
GENERATE REPORT
========================================================== */

function generateReport() {

loadReportData();


var fromDateElement =
    document.getElementById(
        "reportFromDate"
    );


var toDateElement =
    document.getElementById(
        "reportToDate"
    );


if (
    !fromDateElement ||
    !toDateElement
) {

    alert(
        "Report date fields were not found."
    );

    return;

}


var fromDate =
    fromDateElement.value;


var toDate =
    toDateElement.value;


/* ======================================================
   VALIDATION
====================================================== */

if (fromDate === "") {

    alert(
        "Please select From Date."
    );

    return;

}


if (toDate === "") {

    alert(
        "Please select To Date."
    );

    return;

}


if (toDate < fromDate) {

    alert(
        "To Date cannot be earlier than From Date."
    );

    return;

}


/* ======================================================
   FIND MATCHING RECORDS
====================================================== */

generatedReportData =
    getReportRecords(
        fromDate,
        toDate
    );


/* ======================================================
   REPORT PERIOD
====================================================== */

setElementText(
    "reportPeriod",
    formatDate(fromDate) +
    " to " +
    formatDate(toDate)
);


/* ======================================================
   DISPLAY DATA
====================================================== */

renderReportTable(
    generatedReportData
);

}

/* ==========================================================
GET REPORT RECORDS
========================================================== */

function getReportRecords(
fromDate,
toDate
) {

var results = [];


var i;


for (
    i = 0;
    i < reportCoordinators.length;
    i++
) {

    var coordinator =
        reportCoordinators[i];


    if (!coordinator) {

        continue;

    }


    /* ==================================================
       COORDINATOR DATE RANGE
    ================================================== */

    var startDate =
        normalizeDate(
            coordinator.startDate
        );


    var endDate =
        normalizeDate(
            coordinator.endDate
        );


    /*
     * A coordinator must have at least one
     * valid date for period-based reporting.
     */

    if (
        startDate === "" &&
        endDate === ""
    ) {

        continue;

    }


    /*
     * If only one date exists, use it for
     * the missing side.
     */

    if (startDate === "") {

        startDate =
            endDate;

    }


    if (endDate === "") {

        endDate =
            startDate;

    }


    /* ==================================================
       DATE OVERLAP CHECK
    ================================================== */

    var isWithinPeriod =
        startDate <= toDate &&
        endDate >= fromDate;


    if (!isWithinPeriod) {

        continue;

    }


    /* ==================================================
       AGENCY LOOKUP
    ================================================== */

    var agency =
        findAgencyForCoordinator(
            coordinator
        );


    /*
     * If agencyId exists but the agency cannot
     * be found, still display the coordinator.
     */

    var agencyName = "";

    var agencyContact = "";

    var agencyEmail = "";


    if (agency) {

        agencyName =
            agency.name || "";

        agencyContact =
            agency.contactNo || "";

        agencyEmail =
            agency.email || "";

    } else {

        /*
         * Fallback for older coordinator records
         * which may already contain agency name.
         */

        agencyName =
            coordinator.agency || "";

    }


    /* ==================================================
       CREATE REPORT RECORD
    ================================================== */

    var reportRecord = {

        batchName:
            coordinator.batchName || "",

        agency:
            agencyName,

        coordinator:
            coordinator.name || "",

        designation:
            coordinator.designation || "",

        startDate:
            startDate,

        endDate:
            endDate,

        phone:
            agencyContact,

        email:
            agencyEmail,

        status:
            coordinator.status || ""

    };


    results.push(
        reportRecord
    );

}


return results;

}

/* ==========================================================
FIND AGENCY FOR COORDINATOR
========================================================== */

function findAgencyForCoordinator(
coordinator
) {

if (!coordinator) {

    return null;

}


/*
 * Primary method:
 *
 * coordinator.agencyId
 *          ↓
 * agency.id
 */

if (coordinator.agencyId) {

    var i;


    for (
        i = 0;
        i < reportAgencies.length;
        i++
    ) {

        if (
            String(
                reportAgencies[i].id
            ) ===
            String(
                coordinator.agencyId
            )
        ) {

            return reportAgencies[i];

        }

    }

}


/*
 * Fallback:
 * Try matching stored agency name.
 */

if (coordinator.agency) {

    var agencyName =
        String(
            coordinator.agency
        ).trim().toLowerCase();


    var j;


    for (
        j = 0;
        j < reportAgencies.length;
        j++
    ) {

        if (
            String(
                reportAgencies[j].name || ""
            ).trim().toLowerCase() ===
            agencyName
        ) {

            return reportAgencies[j];

        }

    }

}


return null;

}

/* ==========================================================
RENDER REPORT TABLE
========================================================== */

function renderReportTable(
records
) {

var tableBody =
    document.getElementById(
        "reportTableBody"
    );


if (!tableBody) {

    return;

}


tableBody.innerHTML = "";


if (
    !records ||
    records.length === 0
) {

    tableBody.innerHTML =
        '<tr>' +
            '<td colspan="8" class="text-center py-4">' +
                'No records found for the selected time period.' +
            '</td>' +
        '</tr>';


    updateReportEntryInfo(0);

    return;

}


var i;


for (
    i = 0;
    i < records.length;
    i++
) {

    var record =
        records[i];


    var row =
        document.createElement(
            "tr"
        );


    /*
     * Date shown as:
     *
     * 02-03-2026 to 10-03-2026
     */

    var dateText =
        formatDateRange(
            record.startDate,
            record.endDate
        );


    row.innerHTML =

        "<td>" +
            (i + 1) +
        "</td>" +


        "<td>" +
            escapeHtml(
                record.batchName
            ) +
        "</td>" +


        "<td>" +
            escapeHtml(
                record.agency
            ) +
        "</td>" +


        "<td>" +
            escapeHtml(
                record.coordinator
            ) +
        "</td>" +


        "<td>" +
            escapeHtml(
                record.designation
            ) +
        "</td>" +


        "<td>" +
            escapeHtml(
                dateText
            ) +
        "</td>" +


        "<td>" +
            escapeHtml(
                record.phone
            ) +
        "</td>" +


        "<td>" +
            escapeHtml(
                record.email
            ) +
        "</td>";


    tableBody.appendChild(
        row
    );

}


updateReportEntryInfo(
    records.length
);

}

/* ==========================================================
SHOW INITIAL MESSAGE
========================================================== */

function showInitialReportMessage() {

var tableBody =
    document.getElementById(
        "reportTableBody"
    );


if (!tableBody) {

    return;

}


tableBody.innerHTML =
    '<tr>' +
        '<td colspan="8" class="text-center py-4">' +
            'Select a date range and generate the report.' +
        '</td>' +
    '</tr>';


updateReportEntryInfo(0);

}

/* ==========================================================
CLEAR REPORT
========================================================== */

function clearReport() {

var fromDateElement =
    document.getElementById(
        "reportFromDate"
    );


var toDateElement =
    document.getElementById(
        "reportToDate"
    );


if (fromDateElement) {

    fromDateElement.value =
        "";

}


if (toDateElement) {

    toDateElement.value =
        "";

}


generatedReportData =
    [];


setElementText(
    "reportPeriod",
    ""
);


showInitialReportMessage();

}

/* ==========================================================
PRINT REPORT
========================================================== */

function printReport() {

if (
    !generatedReportData ||
    generatedReportData.length === 0
) {

    alert(
        "Please generate a report before printing."
    );

    return;

}


window.print();

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

    return formatDate(
        endDate
    );

}


if (!endDate) {

    return formatDate(
        startDate
    );

}


return (
    formatDate(startDate) +
    " to " +
    formatDate(endDate)
);

}

/* ==========================================================
FORMAT DATE
========================================================== */

function formatDate(
dateString
) {

if (!dateString) {

    return "";

}


var normalized =
    normalizeDate(
        dateString
    );


if (!normalized) {

    return String(
        dateString
    );

}


var parts =
    normalized.split("-");


if (parts.length !== 3) {

    return String(
        dateString
    );

}


return (
    parts[2] +
    "-" +
    parts[1] +
    "-" +
    parts[0]
);

}

/* ==========================================================
NORMALIZE DATE
========================================================== */

function normalizeDate(
dateValue
) {

if (
    dateValue === null ||
    dateValue === undefined
) {

    return "";

}


var value =
    String(
        dateValue
    ).trim();


if (value === "") {

    return "";

}


/*
 * Already YYYY-MM-DD
 */

if (
    /^\d{4}-\d{2}-\d{2}$/.test(
        value
    )
) {

    return value;

}


/*
 * DD-MM-YYYY
 */

if (
    /^\d{2}-\d{2}-\d{4}$/.test(
        value
    )
) {

    var parts =
        value.split("-");


    return (
        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]
    );

}


/*
 * Try JavaScript Date.
 */

var date =
    new Date(value);


if (
    isNaN(
        date.getTime()
    )
) {

    return "";

}


var year =
    date.getFullYear();


var month =
    String(
        date.getMonth() + 1
    ).padStart(
        2,
        "0"
    );


var day =
    String(
        date.getDate()
    ).padStart(
        2,
        "0"
    );


return (
    year +
    "-" +
    month +
    "-" +
    day
);

}

/* ==========================================================
UPDATE ENTRY INFORMATION
========================================================== */

function updateReportEntryInfo(
count
) {

var element =
    document.getElementById(
        "reportEntryInfo"
    );


if (!element) {

    return;

}


if (count === 0) {

    element.textContent =
        "Showing 0 to 0 of 0 entries";

    return;

}


element.textContent =
    "Showing 1 to " +
    count +
    " of " +
    count +
    " entries";

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
    value === undefined
) {

    element.textContent =
        "";

    return;

}


element.textContent =
    String(value);

}

/* ==========================================================
ESCAPE HTML
========================================================== */

function escapeHtml(
value
) {

if (
    value === null ||
    value === undefined
) {

    return "";

}


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

/* ==========================================================
LOGOUT
========================================================== */

function logoutUser() {

localStorage.removeItem(
    LOGGED_IN_USER_KEY
);



window.location.href =
    "../../index.html";

}

/* ==========================================================
STORAGE EVENT
========================================================== */

window.addEventListener(
"storage",
function (event) {

    if (
        event.key === AGENCIES_KEY ||
        event.key === COORDINATORS_KEY
    ) {

        loadReportData();


        /*
         * Regenerate the current report
         * automatically if a report is already visible.
         */

        var fromDateElement =
            document.getElementById(
                "reportFromDate"
            );


        var toDateElement =
            document.getElementById(
                "reportToDate"
            );


        if (
            fromDateElement &&
            toDateElement &&
            fromDateElement.value &&
            toDateElement.value
        ) {

            generatedReportData =
                getReportRecords(
                    fromDateElement.value,
                    toDateElement.value
                );


            renderReportTable(
                generatedReportData
            );

        }

    }


    if (
        event.key === LOGGED_IN_USER_KEY
    ) {

        loadLoggedInUser();

    }

}

);