
"use strict";


/* ==========================================================
   OBT AGENCY MANAGEMENT SYSTEM
   REPORTS.JS

   ==========================================================
   REPORT DATA SOURCE
   ==========================================================

   Agencies:
       GET /api/agencies

   Coordinators:
       GET /api/coordinators


   IMPORTANT:

   Coordinator already contains:

       coordinator.batchName
       coordinator.startDate
       coordinator.endDate
       coordinator.name
       coordinator.designation
       coordinator.agency.id

   Therefore:

       NO /api/batches
       NO report backend
       NO report entity

   Report is generated on frontend.
========================================================== */


/* ==========================================================
   GLOBAL DATA
========================================================== */

var reportAgencies = [];

var reportCoordinators = [];

var generatedReportData = [];


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeReports();

    }
);


/* ==========================================================
   INITIALIZE REPORTS
========================================================== */

async function initializeReports() {

    loadLoggedInUser();

    registerReportEvents();

    await loadReportData();

    showInitialReportMessage();

}


/* ==========================================================
   LOAD LOGGED-IN USER
========================================================== */

function loadLoggedInUser() {

    var userElement =
        document.getElementById(
            "loggedInUserName"
        );


    if (!userElement) {

        return;

    }


    var loggedInUser =
        localStorage.getItem(
            "obt_logged_in_user"
        );


    userElement.textContent =
        loggedInUser ||
        "Administrator";

}


/* ==========================================================
   LOAD REPORT DATA
========================================================== */

async function loadReportData() {

    await Promise.all([
        loadAgencies(),
        loadCoordinators()
    ]);


    console.log(
        "========== REPORT DATA =========="
    );


    console.log(
        "Agencies:",
        reportAgencies
    );


    console.log(
        "Coordinators:",
        reportCoordinators
    );


    console.log(
        "================================="
    );

}


/* ==========================================================
   LOAD AGENCIES
========================================================== */

async function loadAgencies() {

    try {

        var data =
            await getAgencies();


        reportAgencies =
            Array.isArray(data)
                ? data
                : [];


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

async function loadCoordinators() {

    try {

        var data =
            await getCoordinators();


        reportCoordinators =
            Array.isArray(data)
                ? data
                : [];


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


    var exportCsvBtn =
        document.getElementById(
            "exportCsvBtn"
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
       CLEAR
    ====================================================== */

    if (clearReportBtn) {

        clearReport();

    }


    /* ======================================================
       PRINT
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
       EXPORT CSV
    ====================================================== */

    if (exportCsvBtn) {

        exportCsvBtn.addEventListener(
            "click",
            function () {

                exportReportToCSV();

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

async function generateReport() {

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
        normalizeDate(
            fromDateElement.value
        );


    var toDate =
        normalizeDate(
            toDateElement.value
        );


    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!fromDate) {

        alert(
            "Please select From Date."
        );

        return;

    }


    if (!toDate) {

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
       REFRESH BACKEND DATA
    ====================================================== */

    await loadReportData();


    /* ======================================================
       CREATE REPORT
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
       DISPLAY
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


    if (
        !fromDate ||
        !toDate
    ) {

        return results;

    }


    /* ======================================================
       ITERATE THROUGH COORDINATORS
    ====================================================== */

    for (
        var i = 0;
        i < reportCoordinators.length;
        i++
    ) {

        var coordinator =
            reportCoordinators[i];


        if (!coordinator) {

            continue;

        }


        /* ==================================================
           GET COORDINATOR DATES
        ================================================== */

        var startDate =
            normalizeDate(
                coordinator.startDate
            );


        var endDate =
            normalizeDate(
                coordinator.endDate
            );


        if (
            !startDate &&
            !endDate
        ) {

            continue;

        }


        if (!startDate) {

            startDate =
                endDate;

        }


        if (!endDate) {

            endDate =
                startDate;

        }


        /* ==================================================
           DATE RANGE OVERLAP
        ================================================== */

        var overlaps =
            startDate <= toDate &&
            endDate >= fromDate;


        if (!overlaps) {

            continue;

        }


        /* ==================================================
           FIND AGENCY
        ================================================== */

        var agency =
            findAgencyForCoordinator(
                coordinator
            );


        var agencyName = "";

        var agencyPhone = "";

        var agencyEmail = "";


        if (agency) {

            agencyName =
                agency.agencyName ||
                agency.name ||
                "";


            agencyPhone =
                agency.phone ||
                agency.contactNo ||
                "";


            agencyEmail =
                agency.email ||
                "";

        }


        /* ==================================================
           CREATE REPORT RECORD
        ================================================== */

        var reportRecord = {

            batchName:
                coordinator.batchName ||
                "",


            agency:
                agencyName,


            coordinator:
                coordinator.name ||
                "",


            designation:
                coordinator.designation ||
                "",


            startDate:
                startDate,


            endDate:
                endDate,


            phone:
                agencyPhone,


            email:
                agencyEmail,


            status:
                coordinator.status ||
                ""

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


    /* ======================================================
       PRIMARY METHOD
    ====================================================== */

    if (
        coordinator.agency &&
        typeof coordinator.agency === "object"
    ) {

        var agencyId =
            coordinator.agency.id;


        if (
            agencyId !== null &&
            agencyId !== undefined
        ) {

            for (
                var i = 0;
                i < reportAgencies.length;
                i++
            ) {

                var agency =
                    reportAgencies[i];


                if (!agency) {

                    continue;

                }


                if (
                    String(agency.id) ===
                    String(agencyId)
                ) {

                    return agency;

                }

            }

        }


        return coordinator.agency;

    }


    /* ======================================================
       SECONDARY METHOD
    ====================================================== */

    if (
        coordinator.agencyId !== null &&
        coordinator.agencyId !== undefined
    ) {

        for (
            var j = 0;
            j < reportAgencies.length;
            j++
        ) {

            var reportAgency =
                reportAgencies[j];


            if (!reportAgency) {

                continue;

            }


            if (
                String(reportAgency.id) ===
                String(coordinator.agencyId)
            ) {

                return reportAgency;

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


    /* ======================================================
       NO RECORDS
    ====================================================== */

    if (
        !records ||
        records.length === 0
    ) {

        tableBody.innerHTML =
            '<tr>' +
                '<td colspan="9" class="text-center py-4">' +
                    'No records found for the selected time period.' +
                '</td>' +
            '</tr>';


        updateReportEntryInfo(0);

        return;

    }


    /* ======================================================
       CREATE TABLE ROWS
    ====================================================== */

    for (
        var i = 0;
        i < records.length;
        i++
    ) {

        var record =
            records[i];


        var row =
            document.createElement(
                "tr"
            );


        var startDateText =
            formatDate(
                record.startDate
            );


        var endDateText =
            formatDate(
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
                    startDateText
                ) +
            "</td>" +


            "<td>" +
                escapeHtml(
                    endDateText
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
   INITIAL REPORT MESSAGE
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
            '<td colspan="9" class="text-center py-4">' +
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

        fromDateElement.value = "";

    }


    if (toDateElement) {

        toDateElement.value = "";

    }


    generatedReportData = [];


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


    var orientationElement =
        document.getElementById(
            "printOrientation"
        );


    var orientation =
        orientationElement
            ? orientationElement.value
            : "landscape";


    /*
     * Store the selected orientation
     * temporarily on the document.
     */

    document.body.setAttribute(
        "data-print-orientation",
        orientation
    );


    /*
     * Add temporary print style.
     */

    var printStyle =
        document.createElement(
            "style"
        );


    printStyle.id =
        "temporaryPrintStyle";


    printStyle.textContent =

        "@media print {" +

            "@page {" +
                "size: " +
                (
                    orientation === "portrait"
                        ? "A4 portrait"
                        : "A4 landscape"
                ) +
                ";" +
                "margin: 10mm;" +
            "}" +

            "body {" +
                "background: #fff !important;" +
            "}" +

            ".top-header," +
            ".main-navigation," +
            ".report-filter-section," +
            ".footer," +
            ".report-result-actions," +
            ".breadcrumb-area {" +
                "display: none !important;" +
            "}" +

            ".main-content {" +
                "margin: 0 !important;" +
                "padding: 0 !important;" +
            "}" +

            ".report-card {" +
                "box-shadow: none !important;" +
                "border: none !important;" +
            "}" +

            ".report-table {" +
                "width: 100% !important;" +
                "font-size: 10px !important;" +
            "}" +

            ".report-table th," +
            ".report-table td {" +
                "padding: 5px !important;" +
            "}" +

            ".page-header {" +
                "display: block !important;" +
            "}" +

        "}";


    document.head.appendChild(
        printStyle
    );


    /*
     * Print.
     */

    window.print();


    /*
     * Remove temporary style
     * after printing.
     */

    setTimeout(
        function () {

            var style =
                document.getElementById(
                    "temporaryPrintStyle"
                );


            if (style) {

                style.remove();

            }


            document.body.removeAttribute(
                "data-print-orientation"
            );

        },
        1000
    );

}


/* ==========================================================
   EXPORT REPORT TO CSV
========================================================== */

function exportReportToCSV() {

    if (
        !generatedReportData ||
        generatedReportData.length === 0
    ) {

        alert(
            "Please generate a report before exporting CSV."
        );

        return;

    }


    var rows = [];


    /* ======================================================
       CSV HEADER
    ====================================================== */

    rows.push([
        "Sr. No.",
        "Batch Name",
        "Agency",
        "Coordinator",
        "Designation",
        "Start Date",
        "End Date",
        "Agency Contact",
        "Agency E-mail"
    ]);


    /* ======================================================
       CSV DATA
    ====================================================== */

    for (
        var i = 0;
        i < generatedReportData.length;
        i++
    ) {

        var record =
            generatedReportData[i];


        rows.push([

            i + 1,

            record.batchName || "",

            record.agency || "",

            record.coordinator || "",

            record.designation || "",

            formatDate(
                record.startDate
            ),

            formatDate(
                record.endDate
            ),

            record.phone || "",

            record.email || ""

        ]);

    }


    /* ======================================================
       CONVERT TO CSV
    ====================================================== */

    var csvContent =
        rows
            .map(
                function (row) {

                    return row
                        .map(
                            function (value) {

                                return csvEscape(
                                    value
                                );

                            }
                        )
                        .join(",");

                }
            )
            .join("\r\n");


    /*
     * UTF-8 BOM ensures Excel opens
     * the CSV correctly.
     */

    var csvWithBom =
        "\uFEFF" +
        csvContent;


    var blob =
        new Blob(
            [csvWithBom],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    var url =
        URL.createObjectURL(
            blob
        );


    var link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    /*
     * Generate filename using
     * selected report period.
     */

    var fromDateElement =
        document.getElementById(
            "reportFromDate"
        );


    var toDateElement =
        document.getElementById(
            "reportToDate"
        );


    var fromDate =
        fromDateElement
            ? fromDateElement.value
            : "";


    var toDate =
        toDateElement
            ? toDateElement.value
            : "";


    var fileName =
        "OBT_Agency_Coordinator_Report";


    if (
        fromDate &&
        toDate
    ) {

        fileName +=
            "_" +
            fromDate +
            "_to_" +
            toDate;

    }


    fileName +=
        ".csv";


    link.download =
        fileName;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* ==========================================================
   CSV ESCAPE
========================================================== */

function csvEscape(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return '""';

    }


    var text =
        String(value);


    /*
     * CSV requires values containing:
     *
     * comma
     * quotation mark
     * newline
     *
     * to be wrapped in quotes.
     */

    if (
        text.indexOf(",") !== -1 ||
        text.indexOf('"') !== -1 ||
        text.indexOf("\n") !== -1 ||
        text.indexOf("\r") !== -1
    ) {

        return (
            '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"'
        );

    }


    return text;

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


    if (
        parts.length !== 3
    ) {

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


    if (!value) {

        return "";

    }


    /* ======================================================
       YYYY-MM-DD
    ====================================================== */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {

        return value;

    }


    /* ======================================================
       DD-MM-YYYY
    ====================================================== */

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


    /* ======================================================
       JAVASCRIPT DATE FALLBACK
    ====================================================== */

    var date =
        new Date(
            value
        );


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
        "obt_logged_in_user"
    );


    window.location.href =
        "../../index.html";

}


/* ==========================================================
   REFRESH REPORTS
========================================================== */

async function refreshReports() {

    await loadReportData();


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
                normalizeDate(
                    fromDateElement.value
                ),
                normalizeDate(
                    toDateElement.value
                )
            );


        renderReportTable(
            generatedReportData
        );

    }

}


/* ==========================================================
   DATA CHANGE EVENT
========================================================== */

window.addEventListener(
    "dashboardDataChanged",
    function () {

        refreshReports();

    }
);

