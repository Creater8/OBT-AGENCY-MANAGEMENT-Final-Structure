/* ==========================================================
   OBT AGENCY MANAGEMENT SYSTEM
   AGENCIES & COORDINATORS
   JavaScript
========================================================== */

"use strict";


/* ==========================================================
   LOCAL STORAGE KEYS
========================================================== */

var AGENCIES_KEY = "obt_agencies";
var COORDINATORS_KEY = "obt_coordinators";


/* ==========================================================
   GLOBAL DATA
========================================================== */

var agencies = [];
var coordinators = [];

var editingAgencyId = null;
var editingCoordinatorId = null;


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    initializePage();

});


/* ==========================================================
   INITIALIZE PAGE
========================================================== */

function initializePage() {

    loadAgencies();

    loadCoordinators();

    registerTabEvents();

    registerAgencyEvents();

    registerCoordinatorEvents();

    renderAgencies();

    renderCoordinators();

    populateAgencyDropdown();

    loadLoggedInUser();

}


/* ==========================================================
   LOAD LOGGED-IN USER
========================================================== */

function loadLoggedInUser() {

    var userElement = document.getElementById("loggedInUserName");

    if (!userElement) {
        return;
    }

    var loggedInUser = localStorage.getItem("obt_logged_in_user");

    if (loggedInUser) {

        userElement.textContent = loggedInUser;

    } else {

        userElement.textContent = "Administrator";

    }

}


/* ==========================================================
   LOAD AGENCIES
========================================================== */

function loadAgencies() {

    var storedAgencies = localStorage.getItem(AGENCIES_KEY);

    if (!storedAgencies) {

        agencies = [];

        return;
    }

    try {

        agencies = JSON.parse(storedAgencies);

        if (!Array.isArray(agencies)) {

            agencies = [];

        }

    } catch (error) {

        console.error("Unable to load agencies:", error);

        agencies = [];

    }

}


/* ==========================================================
   LOAD COORDINATORS
========================================================== */

function loadCoordinators() {

    var storedCoordinators = localStorage.getItem(COORDINATORS_KEY);

    if (!storedCoordinators) {

        coordinators = [];

        return;
    }

    try {

        coordinators = JSON.parse(storedCoordinators);

        if (!Array.isArray(coordinators)) {

            coordinators = [];

        }

    } catch (error) {

        console.error("Unable to load coordinators:", error);

        coordinators = [];

    }

}


/* ==========================================================
   SAVE AGENCIES
========================================================== */

function saveAgencies() {

    localStorage.setItem(
        AGENCIES_KEY,
        JSON.stringify(agencies)
    );

}


/* ==========================================================
   SAVE COORDINATORS
========================================================== */

function saveCoordinators() {

    localStorage.setItem(
        COORDINATORS_KEY,
        JSON.stringify(coordinators)
    );

}


/* ==========================================================
   TAB EVENTS
========================================================== */

function registerTabEvents() {

    var agenciesTab = document.getElementById("agenciesTab");

    var coordinatorsTab = document.getElementById("coordinatorsTab");

    if (agenciesTab) {

        agenciesTab.addEventListener("click", function () {

            showAgenciesPanel();

        });

    }


    if (coordinatorsTab) {

        coordinatorsTab.addEventListener("click", function () {

            showCoordinatorsPanel();

        });

    }

}


/* ==========================================================
   SHOW AGENCIES PANEL
========================================================== */

function showAgenciesPanel() {

    var agenciesTab = document.getElementById("agenciesTab");

    var coordinatorsTab = document.getElementById("coordinatorsTab");

    var agenciesPanel = document.getElementById("agenciesPanel");

    var coordinatorsPanel =
        document.getElementById("coordinatorsPanel");


    if (agenciesTab) {

        agenciesTab.classList.add("active");

    }


    if (coordinatorsTab) {

        coordinatorsTab.classList.remove("active");

    }


    if (agenciesPanel) {

        agenciesPanel.classList.add("active");

    }


    if (coordinatorsPanel) {

        coordinatorsPanel.classList.remove("active");

    }

}


/* ==========================================================
   SHOW COORDINATORS PANEL
========================================================== */

function showCoordinatorsPanel() {

    var agenciesTab = document.getElementById("agenciesTab");

    var coordinatorsTab = document.getElementById("coordinatorsTab");

    var agenciesPanel = document.getElementById("agenciesPanel");

    var coordinatorsPanel =
        document.getElementById("coordinatorsPanel");


    if (agenciesTab) {

        agenciesTab.classList.remove("active");

    }


    if (coordinatorsTab) {

        coordinatorsTab.classList.add("active");

    }


    if (agenciesPanel) {

        agenciesPanel.classList.remove("active");

    }


    if (coordinatorsPanel) {

        coordinatorsPanel.classList.add("active");

    }


    populateAgencyDropdown();

    renderCoordinators();

}


/* ==========================================================
   AGENCY EVENTS
========================================================== */

function registerAgencyEvents() {

    var addAgencyBtn =
        document.getElementById("addAgencyBtn");

    var agencySearch =
        document.getElementById("agencySearch");

    var saveAgencyBtn =
        document.getElementById("saveAgencyBtn");

    var logoutBtn =
        document.getElementById("logoutBtn");


    if (addAgencyBtn) {

        addAgencyBtn.addEventListener("click", function () {

            openAgencyModal();

        });

    }


    if (agencySearch) {

        agencySearch.addEventListener("input", function () {

            renderAgencies(agencySearch.value);

        });

    }


    if (saveAgencyBtn) {

        saveAgencyBtn.addEventListener("click", function () {

            saveAgency();

        });

    }


    if (logoutBtn) {

        logoutBtn.addEventListener("click", function (event) {

            event.preventDefault();

            localStorage.removeItem("obt_logged_in_user");

            window.location.href =
                "../login/login.html";

        });

    }

}


/* ==========================================================
   COORDINATOR EVENTS
========================================================== */

function registerCoordinatorEvents() {

    var addCoordinatorBtn =
        document.getElementById("addCoordinatorBtn");

    var coordinatorSearch =
        document.getElementById("coordinatorSearch");

    var saveCoordinatorBtn =
        document.getElementById("saveCoordinatorBtn");


    if (addCoordinatorBtn) {

        addCoordinatorBtn.addEventListener(
            "click",
            function () {

                openCoordinatorModal();

            }
        );

    }


    if (coordinatorSearch) {

        coordinatorSearch.addEventListener(
            "input",
            function () {

                renderCoordinators(
                    coordinatorSearch.value
                );

            }
        );

    }


    if (saveCoordinatorBtn) {

        saveCoordinatorBtn.addEventListener(
            "click",
            function () {

                saveCoordinator();

            }
        );

    }

}


/* ==========================================================
   OPEN AGENCY MODAL
========================================================== */

function openAgencyModal() {

    editingAgencyId = null;

    var form = document.getElementById("agencyForm");

    if (form) {

        form.reset();

    }


    var title =
        document.getElementById("addAgencyModalLabel");

    if (title) {

        title.innerHTML =
            '<i class="fas fa-building me-2"></i>Add Agency';

    }


    var modalElement =
        document.getElementById("addAgencyModal");

    if (!modalElement) {

        alert(
            "Agency modal was not found in agencies-coordinators.html."
        );

        return;

    }


    var modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    modal.show();

}


/* ==========================================================
   OPEN COORDINATOR MODAL
========================================================== */

function openCoordinatorModal() {

    editingCoordinatorId = null;

    var form =
        document.getElementById("coordinatorForm");

    if (form) {

        form.reset();

    }


    populateAgencyDropdown();


    var title =
        document.getElementById(
            "addCoordinatorModalLabel"
        );

    if (title) {

        title.innerHTML =
            '<i class="fas fa-user-plus me-2"></i>Add Coordinator';

    }


    var status =
        document.getElementById("coordinatorStatus");

    if (status) {

        status.value = "Active";

    }


    var modalElement =
        document.getElementById(
            "addCoordinatorModal"
        );

    if (!modalElement) {

        alert(
            "Coordinator modal was not found in agencies-coordinators.html."
        );

        return;

    }


    var modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    modal.show();

}


/* ==========================================================
   SAVE AGENCY
========================================================== */

function saveAgency() {

    var name =
        getValue("agencyName");

    var contactPerson =
        getValue("agencyContactPerson");

    var contactNo =
        getValue("agencyContactNo");

    var email =
        getValue("agencyEmail");

    var status =
        getValue("agencyStatus");


    if (name === "") {

        alert("Please enter Agency Name.");

        return;

    }


    if (contactPerson === "") {

        alert("Please enter Contact Person.");

        return;

    }


    if (contactNo === "") {

        alert("Please enter Contact No.");

        return;

    }


    if (email === "") {

        alert("Please enter Email.");

        return;

    }


    if (status === "") {

        status = "Active";

    }


    if (editingAgencyId !== null) {

        updateAgency(
            editingAgencyId,
            name,
            contactPerson,
            contactNo,
            email,
            status
        );

    } else {

        var agency = {

            id: generateId(),

            name: name,

            contactPerson: contactPerson,

            contactNo: contactNo,

            email: email,

            status: status

        };


        agencies.push(agency);

    }


    saveAgencies();

    renderAgencies();

    populateAgencyDropdown();

    closeModal("addAgencyModal");

}


/* ==========================================================
   UPDATE AGENCY
========================================================== */

function updateAgency(
    id,
    name,
    contactPerson,
    contactNo,
    email,
    status
) {

    var index = findAgencyIndex(id);

    if (index === -1) {

        return;

    }


    agencies[index].name = name;

    agencies[index].contactPerson =
        contactPerson;

    agencies[index].contactNo =
        contactNo;

    agencies[index].email = email;

    agencies[index].status = status;

}


/* ==========================================================
   SAVE COORDINATOR
========================================================== */

function saveCoordinator() {

    var name =
        getValue("coordinatorName");

    var agencyId =
        getValue("coordinatorAgency");

    var batchName =
        getValue("coordinatorBatchName");

    var designation =
        getValue("coordinatorDesignation");

    var startDate =
        getValue("coordinatorStartDate");

    var endDate =
        getValue("coordinatorEndDate");

    var phone =
        getValue("coordinatorPhone");

    var email =
        getValue("coordinatorEmail");

    var status =
        getValue("coordinatorStatus");


    /* ======================================================
       VALIDATION
    ====================================================== */

    if (name === "") {

        alert("Please enter Coordinator Name.");

        return;

    }


    if (agencyId === "") {

        alert("Please select Agency.");

        return;

    }


    if (batchName === "") {

        alert("Please enter Batch Name.");

        return;

    }


    if (designation === "") {

        alert("Please enter Designation.");

        return;

    }


    if (startDate === "") {

        alert("Please select Start Date.");

        return;

    }


    if (endDate === "") {

        alert("Please select End Date.");

        return;

    }


    if (endDate < startDate) {

        alert(
            "End Date cannot be earlier than Start Date."
        );

        return;

    }


    if (phone === "") {

        alert("Please enter Phone.");

        return;

    }


    if (email === "") {

        alert("Please enter Email.");

        return;

    }


    if (status === "") {

        status = "Active";

    }


    /* ======================================================
       GET AGENCY NAME
    ====================================================== */

    var agencyName =
        getAgencyNameById(agencyId);


    /* ======================================================
       UPDATE EXISTING COORDINATOR
    ====================================================== */

    if (editingCoordinatorId !== null) {

        updateCoordinator(
            editingCoordinatorId,
            name,
            agencyId,
            agencyName,
            batchName,
            startDate,
            endDate,
            designation,
            phone,
            email,
            status
        );

    }


    /* ======================================================
       ADD NEW COORDINATOR
    ====================================================== */

    else {

        var coordinator = {

            id: generateId(),

            name: name,

            agencyId: agencyId,

            agency: agencyName,

            batchName: batchName,

            startDate: startDate,

            endDate: endDate,

            designation: designation,

            phone: phone,

            email: email,

            status: status

        };


        coordinators.push(coordinator);

    }


    /* ======================================================
       SAVE
    ====================================================== */

    saveCoordinators();

    renderCoordinators();

    closeModal("addCoordinatorModal");


    /* ======================================================
       IMPORTANT:
       UPDATE DASHBOARD DATA
    ====================================================== */

    updateDashboardData();

}


/* ==========================================================
   UPDATE COORDINATOR
========================================================== */

function updateCoordinator(
    id,
    name,
    agencyId,
    agencyName,
    batchName,
    startDate,
    endDate,
    designation,
    phone,
    email,
    status
) {

    var index =
        findCoordinatorIndex(id);

    if (index === -1) {

        return;

    }


    coordinators[index].name = name;

    coordinators[index].agencyId = agencyId;

    coordinators[index].agency = agencyName;

    coordinators[index].batchName = batchName;

    coordinators[index].startDate = startDate;

    coordinators[index].endDate = endDate;

    coordinators[index].designation =
        designation;

    coordinators[index].phone = phone;

    coordinators[index].email = email;

    coordinators[index].status = status;

}


/* ==========================================================
   RENDER AGENCIES
========================================================== */

function renderAgencies(searchText) {

    var tableBody =
        document.getElementById(
            "agencyTableBody"
        );

    if (!tableBody) {

        return;

    }


    searchText =
        searchText || "";

    searchText =
        searchText.toLowerCase().trim();


    tableBody.innerHTML = "";


    var filteredAgencies = [];


    var i;


    for (i = 0; i < agencies.length; i++) {

        var agency = agencies[i];


        var searchableText =
            (
                agency.name +
                " " +
                agency.contactPerson +
                " " +
                agency.contactNo +
                " " +
                agency.email +
                " " +
                agency.status
            ).toLowerCase();


        if (
            searchText === "" ||
            searchableText.indexOf(searchText) !== -1
        ) {

            filteredAgencies.push(agency);

        }

    }


    if (filteredAgencies.length === 0) {

        tableBody.innerHTML =
            '<tr>' +
                '<td colspan="7" class="text-center">' +
                    'No agencies found.' +
                '</td>' +
            '</tr>';

        updateAgencyEntryInfo(0);

        return;

    }


    for (i = 0; i < filteredAgencies.length; i++) {

        var currentAgency =
            filteredAgencies[i];


        var row =
            document.createElement("tr");


        var statusClass =
            currentAgency.status === "Active"
                ? "bg-success"
                : "bg-secondary";


        row.innerHTML =

            "<td>" +
                (i + 1) +
            "</td>" +

            "<td>" +
                escapeHtml(currentAgency.name) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentAgency.contactPerson
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentAgency.contactNo
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentAgency.email
                ) +
            "</td>" +

            "<td>" +

                '<span class="badge ' +
                    statusClass +
                '">' +

                    escapeHtml(
                        currentAgency.status
                    ) +

                "</span>" +

            "</td>" +

            "<td>" +

                '<button type="button" ' +
                        'class="btn btn-sm btn-warning me-1" ' +
                        'onclick="editAgency(\'' +
                            escapeForAttribute(
                                currentAgency.id
                            ) +
                        '\')">' +

                    '<i class="fas fa-pen"></i>' +

                "</button>" +


                '<button type="button" ' +
                        'class="btn btn-sm btn-danger" ' +
                        'onclick="deleteAgency(\'' +
                            escapeForAttribute(
                                currentAgency.id
                            ) +
                        '\')">' +

                    '<i class="fas fa-trash"></i>' +

                "</button>" +

            "</td>";


        tableBody.appendChild(row);

    }


    updateAgencyEntryInfo(
        filteredAgencies.length
    );

}


/* ==========================================================
   RENDER COORDINATORS
========================================================== */

function renderCoordinators(searchText) {

    var tableBody =
        document.getElementById(
            "coordinatorTableBody"
        );

    if (!tableBody) {

        return;

    }


    searchText =
        searchText || "";

    searchText =
        searchText.toLowerCase().trim();


    tableBody.innerHTML = "";


    var filteredCoordinators = [];


    var i;


    for (i = 0; i < coordinators.length; i++) {

        var coordinator =
            coordinators[i];


        var searchableText =
            (
                coordinator.name +
                " " +
                coordinator.agency +
                " " +
                coordinator.batchName +
                " " +
                coordinator.designation +
                " " +
                coordinator.phone +
                " " +
                coordinator.email +
                " " +
                coordinator.status
            ).toLowerCase();


        if (
            searchText === "" ||
            searchableText.indexOf(searchText) !== -1
        ) {

            filteredCoordinators.push(
                coordinator
            );

        }

    }


    if (filteredCoordinators.length === 0) {

        tableBody.innerHTML =
            '<tr>' +
                '<td colspan="10" class="text-center">' +
                    'No coordinators found.' +
                '</td>' +
            '</tr>';

        updateCoordinatorEntryInfo(0);

        return;

    }


    for (
        i = 0;
        i < filteredCoordinators.length;
        i++
    ) {

        var currentCoordinator =
            filteredCoordinators[i];


        var row =
            document.createElement("tr");


        var statusClass =
            currentCoordinator.status === "Active"
                ? "bg-success"
                : "bg-secondary";


        var dateRange =
            formatDateRange(
                currentCoordinator.startDate,
                currentCoordinator.endDate
            );


        row.innerHTML =

            "<td>" +
                (i + 1) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentCoordinator.name
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentCoordinator.agency
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentCoordinator.batchName
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    dateRange
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentCoordinator.designation
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentCoordinator.phone
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentCoordinator.email
                ) +
            "</td>" +

            "<td>" +

                '<span class="badge ' +
                    statusClass +
                '">' +

                    escapeHtml(
                        currentCoordinator.status
                    ) +

                "</span>" +

            "</td>" +

            "<td>" +

                '<button type="button" ' +
                        'class="btn btn-sm btn-warning me-1" ' +
                        'onclick="editCoordinator(\'' +
                            escapeForAttribute(
                                currentCoordinator.id
                            ) +
                        '\')">' +

                    '<i class="fas fa-pen"></i>' +

                "</button>" +


                '<button type="button" ' +
                        'class="btn btn-sm btn-danger" ' +
                        'onclick="deleteCoordinator(\'' +
                            escapeForAttribute(
                                currentCoordinator.id
                            ) +
                        '\')">' +

                    '<i class="fas fa-trash"></i>' +

                "</button>" +

            "</td>";


        tableBody.appendChild(row);

    }


    updateCoordinatorEntryInfo(
        filteredCoordinators.length
    );

}


/* ==========================================================
   FORMAT DATE RANGE
========================================================== */

function formatDateRange(startDate, endDate) {

    if (!startDate && !endDate) {

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
   OUTPUT:
   02-03-2026
========================================================== */

function formatDate(dateString) {

    if (!dateString) {

        return "";

    }


    var parts =
        dateString.split("-");


    if (parts.length !== 3) {

        return dateString;

    }


    var year = parts[0];

    var month = parts[1];

    var day = parts[2];


    return (
        day +
        "-" +
        month +
        "-" +
        year
    );

}


/* ==========================================================
   POPULATE AGENCY DROPDOWN
========================================================== */

function populateAgencyDropdown() {

    var select =
        document.getElementById(
            "coordinatorAgency"
        );

    if (!select) {

        return;

    }


    var currentValue =
        select.value;


    select.innerHTML =
        '<option value="">Select Agency</option>';


    var i;


    for (i = 0; i < agencies.length; i++) {

        var agency =
            agencies[i];


        if (agency.status === "Inactive") {

            continue;

        }


        var option =
            document.createElement("option");


        option.value =
            agency.id;


        option.textContent =
            agency.name;


        select.appendChild(option);

    }


    if (currentValue !== "") {

        select.value =
            currentValue;

    }

}


/* ==========================================================
   EDIT AGENCY
========================================================== */

function editAgency(id) {

    var index =
        findAgencyIndex(id);

    if (index === -1) {

        return;

    }


    var agency =
        agencies[index];


    editingAgencyId = id;


    setValue(
        "agencyName",
        agency.name
    );


    setValue(
        "agencyContactPerson",
        agency.contactPerson
    );


    setValue(
        "agencyContactNo",
        agency.contactNo
    );


    setValue(
        "agencyEmail",
        agency.email
    );


    setValue(
        "agencyStatus",
        agency.status
    );


    var title =
        document.getElementById(
            "addAgencyModalLabel"
        );


    if (title) {

        title.innerHTML =
            '<i class="fas fa-pen me-2"></i>Edit Agency';

    }


    var modalElement =
        document.getElementById(
            "addAgencyModal"
        );


    if (!modalElement) {

        alert(
            "Agency modal was not found."
        );

        return;

    }


    var modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


/* ==========================================================
   EDIT COORDINATOR
========================================================== */

function editCoordinator(id) {

    var index =
        findCoordinatorIndex(id);

    if (index === -1) {

        return;

    }


    var coordinator =
        coordinators[index];


    editingCoordinatorId = id;


    populateAgencyDropdown();


    setValue(
        "coordinatorName",
        coordinator.name
    );


    setValue(
        "coordinatorAgency",
        coordinator.agencyId
    );


    setValue(
        "coordinatorBatchName",
        coordinator.batchName
    );


    setValue(
        "coordinatorDesignation",
        coordinator.designation
    );


    setValue(
        "coordinatorStartDate",
        coordinator.startDate
    );


    setValue(
        "coordinatorEndDate",
        coordinator.endDate
    );


    setValue(
        "coordinatorPhone",
        coordinator.phone
    );


    setValue(
        "coordinatorEmail",
        coordinator.email
    );


    setValue(
        "coordinatorStatus",
        coordinator.status
    );


    var title =
        document.getElementById(
            "addCoordinatorModalLabel"
        );


    if (title) {

        title.innerHTML =
            '<i class="fas fa-pen me-2"></i>Edit Coordinator';

    }


    var modalElement =
        document.getElementById(
            "addCoordinatorModal"
        );


    if (!modalElement) {

        alert(
            "Coordinator modal was not found."
        );

        return;

    }


    var modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


/* ==========================================================
   DELETE AGENCY
========================================================== */

function deleteAgency(id) {

    var index =
        findAgencyIndex(id);

    if (index === -1) {

        return;

    }


    var agency =
        agencies[index];


    var confirmed =
        confirm(
            'Are you sure you want to delete "' +
            agency.name +
            '"?'
        );


    if (!confirmed) {

        return;

    }


    var coordinatorUsingAgency = false;


    var i;


    for (
        i = 0;
        i < coordinators.length;
        i++
    ) {

        if (
            coordinators[i].agencyId === id
        ) {

            coordinatorUsingAgency = true;

            break;

        }

    }


    if (coordinatorUsingAgency) {

        alert(
            "This agency is assigned to a coordinator. " +
            "Please remove or change the coordinator assignment first."
        );

        return;

    }


    agencies.splice(index, 1);


    saveAgencies();

    renderAgencies();

    populateAgencyDropdown();

}


/* ==========================================================
   DELETE COORDINATOR
========================================================== */

function deleteCoordinator(id) {

    var index =
        findCoordinatorIndex(id);

    if (index === -1) {

        return;

    }


    var coordinator =
        coordinators[index];


    var confirmed =
        confirm(
            'Are you sure you want to delete "' +
            coordinator.name +
            '"?'
        );


    if (!confirmed) {

        return;

    }


    coordinators.splice(index, 1);


    saveCoordinators();

    renderCoordinators();

    updateDashboardData();

}


/* ==========================================================
   UPDATE DASHBOARD DATA
========================================================== */

function updateDashboardData() {

    /*
       Dashboard will read the same coordinator
       data directly from localStorage.

       We therefore save the latest coordinator
       array under the dashboard-compatible key.
    */


    localStorage.setItem(
        "obt_dashboard_trainings",
        JSON.stringify(coordinators)
    );

}


/* ==========================================================
   ENTRY INFORMATION
========================================================== */

function updateAgencyEntryInfo(count) {

    var element =
        document.getElementById(
            "agencyEntryInfo"
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
   COORDINATOR ENTRY INFORMATION
========================================================== */

function updateCoordinatorEntryInfo(count) {

    var element =
        document.getElementById(
            "coordinatorEntryInfo"
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
   FIND AGENCY INDEX
========================================================== */

function findAgencyIndex(id) {

    var i;


    for (i = 0; i < agencies.length; i++) {

        if (
            String(agencies[i].id) ===
            String(id)
        ) {

            return i;

        }

    }


    return -1;

}


/* ==========================================================
   FIND COORDINATOR INDEX
========================================================== */

function findCoordinatorIndex(id) {

    var i;


    for (
        i = 0;
        i < coordinators.length;
        i++
    ) {

        if (
            String(coordinators[i].id) ===
            String(id)
        ) {

            return i;

        }

    }


    return -1;

}


/* ==========================================================
   GET AGENCY NAME BY ID
========================================================== */

function getAgencyNameById(id) {

    var index =
        findAgencyIndex(id);


    if (index === -1) {

        return "";

    }


    return agencies[index].name;

}


/* ==========================================================
   GENERATE UNIQUE ID
========================================================== */

function generateId() {

    return (
        Date.now().toString() +
        Math.floor(
            Math.random() * 1000
        ).toString()
    );

}


/* ==========================================================
   GET INPUT VALUE
========================================================== */

function getValue(id) {

    var element =
        document.getElementById(id);


    if (!element) {

        return "";

    }


    return element.value.trim();

}


/* ==========================================================
   SET INPUT VALUE
========================================================== */

function setValue(id, value) {

    var element =
        document.getElementById(id);


    if (!element) {

        return;

    }


    element.value =
        value || "";

}


/* ==========================================================
   CLOSE BOOTSTRAP MODAL
========================================================== */

function closeModal(id) {

    var modalElement =
        document.getElementById(id);


    if (!modalElement) {

        return;

    }


    var modal =
        bootstrap.Modal.getInstance(
            modalElement
        );


    if (modal) {

        modal.hide();

    }

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================================
   ESCAPE VALUE FOR INLINE ATTRIBUTE
========================================================== */

function escapeForAttribute(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}
function logoutUser() {

localStorage.removeItem(
    LOGGED_IN_USER_KEY
);



window.location.href =
    "../../index.html";

}