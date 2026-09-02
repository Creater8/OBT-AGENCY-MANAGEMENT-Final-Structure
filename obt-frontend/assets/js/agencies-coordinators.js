/*
==========================================================
OBT AGENCY MANAGEMENT SYSTEM
AGENCIES & COORDINATORS
FRONTEND <-> SPRING BOOT BACKEND

IMPORTANT:

Agency:
    agencyName
    contactPerson
    phone
    email
    status

Agency DOES NOT contain a date.

Coordinator:
    name
    agency
    batchName
    startDate
    endDate
    designation
    phone
    email
    status

Rotation:
    agencyId
    rotationOrder

IMPORTANT:
    Rotation order is NOT restricted to 1-5.
    The backend is the source of truth for rotation order.

STATUS RULE:

Coordinator status is determined from:
    startDate
    endDate

If:
    today >= startDate
    AND
    today <= endDate

then:
    Active

Otherwise:
    Inactive

Agency status is determined from its associated
Coordinator's startDate and endDate.

==========================================================
*/

"use strict";


/*
==========================================================
GLOBAL DATA
==========================================================
*/

var agencies = [];
var coordinators = [];
var rotations = [];

var editingAgencyId = null;
var editingCoordinatorId = null;


/*
==========================================================
DOM READY
==========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {
        initializePage();
    }
);


/*
==========================================================
INITIALIZE PAGE
==========================================================
*/

async function initializePage() {

    registerTabEvents();
    registerAgencyEvents();
    registerCoordinatorEvents();

    loadLoggedInUser();

    await loadAgencies();
    await loadRotations();
    await loadCoordinators();

    /*
    Recalculate statuses immediately after
    backend data has been loaded.
    */
    refreshCalculatedStatuses();

    renderAgencies();
    renderCoordinators();
    populateAgencyDropdown();
    updateDashboardData();
}


/*
==========================================================
LOAD LOGGED-IN USER
==========================================================
*/

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


/*
==========================================================
LOAD AGENCIES
==========================================================
*/

async function loadAgencies() {

    try {

        var data =
            await getAgencies();

        agencies =
            Array.isArray(data)
                ? data
                : [];

    } catch (error) {

        console.error(
            "Unable to load agencies:",
            error
        );

        agencies = [];

        handleApiError(error);
    }
}


/*
==========================================================
LOAD ROTATIONS
==========================================================
*/

async function loadRotations() {

    try {

        var data =
            await getRotations();

        rotations =
            Array.isArray(data)
                ? data
                : [];

        console.log(
            "Loaded rotations:",
            rotations
        );

    } catch (error) {

        console.error(
            "Unable to load rotations:",
            error
        );

        rotations = [];

        /*
        Do not stop the Agency page if
        rotation records are unavailable.
        */

        console.warn(
            "Agency page will continue without rotation data."
        );
    }
}


/*
==========================================================
LOAD COORDINATORS
==========================================================
*/

async function loadCoordinators() {

    try {

        var data =
            await getCoordinators();

        coordinators =
            Array.isArray(data)
                ? data
                : [];

    } catch (error) {

        console.error(
            "Unable to load coordinators:",
            error
        );

        coordinators = [];

        handleApiError(error);
    }
}


/*
==========================================================
STATUS CALCULATION
==========================================================
*/

/*
----------------------------------------------------------
GET STATUS FROM START DATE AND END DATE
----------------------------------------------------------

Rules:

Before start date:
    Inactive

Between start date and end date:
    Active

On end date:
    Active

After end date:
    Inactive
----------------------------------------------------------
*/

function getStatusFromDates(
    startDate,
    endDate
) {

    if (
        !startDate ||
        !endDate
    ) {
        return "Inactive";
    }

    /*
    Use local date values and remove
    time-of-day differences.
    */

    var today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    var start =
        parseDateOnly(
            startDate
        );

    var end =
        parseDateOnly(
            endDate
        );

    if (
        !start ||
        !end
    ) {
        return "Inactive";
    }

    if (
        today >= start &&
        today <= end
    ) {
        return "Active";
    }

    return "Inactive";
}


/*
----------------------------------------------------------
PARSE DATE WITHOUT TIMEZONE PROBLEMS
----------------------------------------------------------
*/

function parseDateOnly(
    dateValue
) {

    if (!dateValue) {
        return null;
    }

    var value =
        String(
            dateValue
        ).trim();

    /*
    Expected backend format:
        YYYY-MM-DD
    */

    var parts =
        value.split("-");

    if (
        parts.length !== 3
    ) {
        return null;
    }

    var year =
        Number(
            parts[0]
        );

    var month =
        Number(
            parts[1]
        );

    var day =
        Number(
            parts[2]
        );

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {
        return null;
    }

    var date =
        new Date(
            year,
            month - 1,
            day
        );

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
}


/*
----------------------------------------------------------
GET COORDINATOR FOR AGENCY
----------------------------------------------------------
*/

function getCoordinatorForAgency(
    agencyId
) {

    if (
        agencyId === null ||
        agencyId === undefined
    ) {
        return null;
    }

    for (
        var i = 0;
        i < coordinators.length;
        i++
    ) {

        var coordinator =
            coordinators[i];

        if (!coordinator) {
            continue;
        }

        var coordinatorAgencyId =
            getCoordinatorAgencyId(
                coordinator
            );

        if (
            String(
                coordinatorAgencyId
            ) ===
            String(
                agencyId
            )
        ) {
            return coordinator;
        }
    }

    return null;
}


/*
----------------------------------------------------------
GET COORDINATOR AGENCY ID
----------------------------------------------------------
*/

function getCoordinatorAgencyId(
    coordinator
) {

    if (!coordinator) {
        return null;
    }

    if (
        coordinator.agency &&
        typeof coordinator.agency ===
        "object"
    ) {

        if (
            coordinator.agency.id !==
            undefined &&
            coordinator.agency.id !==
            null
        ) {
            return coordinator.agency.id;
        }
    }

    if (
        coordinator.agencyId !==
        undefined &&
        coordinator.agencyId !==
        null
    ) {
        return coordinator.agencyId;
    }

    return null;
}


/*
----------------------------------------------------------
GET AGENCY CALCULATED STATUS
----------------------------------------------------------
*/

function getAgencyCalculatedStatus(
    agency
) {

    if (!agency) {
        return "Inactive";
    }

    var coordinator =
        getCoordinatorForAgency(
            agency.id
        );

    /*
    Agency status is based on the
    Coordinator's start and end dates.
    */

    if (coordinator) {

        return getStatusFromDates(
            coordinator.startDate,
            coordinator.endDate
        );
    }

    /*
    If Agency has no Coordinator,
    there is no active training period.
    */

    return "Inactive";
}


/*
----------------------------------------------------------
REFRESH CALCULATED STATUSES
----------------------------------------------------------
*/

function refreshCalculatedStatuses() {

    /*
    Coordinator status is calculated from dates.
    */

    for (
        var i = 0;
        i < coordinators.length;
        i++
    ) {

        var coordinator =
            coordinators[i];

        if (!coordinator) {
            continue;
        }

        coordinator.status =
            getStatusFromDates(
                coordinator.startDate,
                coordinator.endDate
            );
    }


    /*
    Agency status is calculated from
    the Agency's Coordinator.
    */

    for (
        var j = 0;
        j < agencies.length;
        j++
    ) {

        var agency =
            agencies[j];

        if (!agency) {
            continue;
        }

        agency.status =
            getAgencyCalculatedStatus(
                agency
            );
    }
}


/*
==========================================================
TAB EVENTS
==========================================================
*/

function registerTabEvents() {

    var agenciesTab =
        document.getElementById(
            "agenciesTab"
        );

    var coordinatorsTab =
        document.getElementById(
            "coordinatorsTab"
        );

    if (agenciesTab) {

        agenciesTab.addEventListener(
            "click",
            function () {

                showAgenciesPanel();

            }
        );
    }

    if (coordinatorsTab) {

        coordinatorsTab.addEventListener(
            "click",
            function () {

                showCoordinatorsPanel();

            }
        );
    }
}


/*
==========================================================
SHOW AGENCIES PANEL
==========================================================
*/

function showAgenciesPanel() {

    var agenciesTab =
        document.getElementById(
            "agenciesTab"
        );

    var coordinatorsTab =
        document.getElementById(
            "coordinatorsTab"
        );

    var agenciesPanel =
        document.getElementById(
            "agenciesPanel"
        );

    var coordinatorsPanel =
        document.getElementById(
            "coordinatorsPanel"
        );

    if (agenciesTab) {

        agenciesTab.classList.add(
            "active"
        );
    }

    if (coordinatorsTab) {

        coordinatorsTab.classList.remove(
            "active"
        );
    }

    if (agenciesPanel) {

        agenciesPanel.classList.add(
            "active"
        );
    }

    if (coordinatorsPanel) {

        coordinatorsPanel.classList.remove(
            "active"
        );
    }

    var search =
        document.getElementById(
            "agencySearch"
        );

    renderAgencies(
        search
            ? search.value
            : ""
    );
}


/*
==========================================================
SHOW COORDINATORS PANEL
==========================================================
*/

function showCoordinatorsPanel() {

    var agenciesTab =
        document.getElementById(
            "agenciesTab"
        );

    var coordinatorsTab =
        document.getElementById(
            "coordinatorsTab"
        );

    var agenciesPanel =
        document.getElementById(
            "agenciesPanel"
        );

    var coordinatorsPanel =
        document.getElementById(
            "coordinatorsPanel"
        );

    if (agenciesTab) {

        agenciesTab.classList.remove(
            "active"
        );
    }

    if (coordinatorsTab) {

        coordinatorsTab.classList.add(
            "active"
        );
    }

    if (agenciesPanel) {

        agenciesPanel.classList.remove(
            "active"
        );
    }

    if (coordinatorsPanel) {

        coordinatorsPanel.classList.add(
            "active"
        );
    }

    populateAgencyDropdown();

    var search =
        document.getElementById(
            "coordinatorSearch"
        );

    renderCoordinators(
        search
            ? search.value
            : ""
    );
}


/*
==========================================================
AGENCY EVENTS
==========================================================
*/

function registerAgencyEvents() {

    var addAgencyBtn =
        document.getElementById(
            "addAgencyBtn"
        );

    var agencySearch =
        document.getElementById(
            "agencySearch"
        );

    var saveAgencyBtn =
        document.getElementById(
            "saveAgencyBtn"
        );

    var logoutBtn =
        document.getElementById(
            "logoutBtn"
        );

    if (addAgencyBtn) {

        addAgencyBtn.addEventListener(
            "click",
            function () {

                openAgencyModal();

            }
        );
    }

    if (agencySearch) {

        agencySearch.addEventListener(
            "input",
            function () {

                renderAgencies(
                    agencySearch.value
                );

            }
        );
    }

    if (saveAgencyBtn) {

        saveAgencyBtn.addEventListener(
            "click",
            function () {

                saveAgency();

            }
        );
    }

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


/*
==========================================================
COORDINATOR EVENTS
==========================================================
*/

function registerCoordinatorEvents() {

    var addCoordinatorBtn =
        document.getElementById(
            "addCoordinatorBtn"
        );

    var coordinatorSearch =
        document.getElementById(
            "coordinatorSearch"
        );

    var saveCoordinatorBtn =
        document.getElementById(
            "saveCoordinatorBtn"
        );

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


/*
==========================================================
OPEN AGENCY MODAL
==========================================================
*/

function openAgencyModal() {

    editingAgencyId = null;

    var form =
        document.getElementById(
            "agencyForm"
        );

    if (form) {
        form.reset();
    }

    /*
    Agency does NOT contain date.

    Rotation order is handled separately.

    No 1-5 restriction.
    */

    setValue(
        "agencyRotationOrder",
        ""
    );

    var status =
        document.getElementById(
            "agencyStatus"
        );

    if (status) {

        status.value =
            "Active";
    }

    var title =
        document.getElementById(
            "addAgencyModalLabel"
        );

    if (title) {

        title.innerHTML =
            '<i class="fas fa-building me-2"></i>Add Agency';
    }

    var modalElement =
        document.getElementById(
            "addAgencyModal"
        );

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


/*
==========================================================
OPEN COORDINATOR MODAL
==========================================================
*/

function openCoordinatorModal() {

    editingCoordinatorId = null;

    var form =
        document.getElementById(
            "coordinatorForm"
        );

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
        document.getElementById(
            "coordinatorStatus"
        );

    if (status) {

        status.value =
            "Active";
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


/*
==========================================================
SAVE AGENCY
CREATE / UPDATE
==========================================================
*/

async function saveAgency() {

    var name =
        getValue(
            "agencyName"
        );

    var contactPerson =
        getValue(
            "agencyContactPerson"
        );

    var contactNo =
        getValue(
            "agencyContactNo"
        );

    var email =
        getValue(
            "agencyEmail"
        );

    var status =
        getValue(
            "agencyStatus"
        );

    var rotationOrderValue =
        getValue(
            "agencyRotationOrder"
        );


    /*
    ------------------------------------------------------
    VALIDATION
    ------------------------------------------------------
    */

    if (name === "") {

        alert(
            "Please enter Agency Name."
        );

        return;
    }

    if (contactPerson === "") {

        alert(
            "Please enter Contact Person."
        );

        return;
    }

    if (contactNo === "") {

        alert(
            "Please enter Contact No."
        );

        return;
    }

    if (email === "") {

        alert(
            "Please enter Email."
        );

        return;
    }

    if (status === "") {

        status =
            "Active";
    }


    /*
    ------------------------------------------------------
    ROTATION ORDER
    ------------------------------------------------------

    There is NO 1-5 restriction.
    Backend decides validity.
    */

    if (rotationOrderValue === "") {

        alert(
            "Please enter Rotation Order."
        );

        return;
    }

    var rotationOrder =
        Number(
            rotationOrderValue
        );

    if (
        !Number.isInteger(
            rotationOrder
        )
    ) {

        alert(
            "Rotation Order must be a whole number."
        );

        return;
    }


    /*
    ------------------------------------------------------
    AGENCY PAYLOAD
    ------------------------------------------------------

    IMPORTANT:
    No date field is sent.
    */

    var agencyData = {

        agencyName:
            name,

        contactPerson:
            contactPerson,

        phone:
            contactNo,

        email:
            email,

        status:
            status
    };


    console.log(
        "Agency payload:",
        agencyData
    );

    console.log(
        "Requested rotation order:",
        rotationOrder
    );


    try {

        /*
        ==================================================
        UPDATE EXISTING AGENCY
        ==================================================
        */

        if (
            editingAgencyId !==
            null
        ) {

            await updateAgencyApi(
                editingAgencyId,
                agencyData
            );


            /*
            Find rotation belonging ONLY
            to this Agency.
            */

            var existingRotation =
                null;

            try {

                existingRotation =
                    await getRotationByAgencyId(
                        editingAgencyId
                    );

            } catch (rotationError) {

                console.warn(
                    "No existing rotation found for Agency:",
                    editingAgencyId
                );
            }


            /*
            Update existing rotation.
            */

            if (
                existingRotation &&
                existingRotation.id
            ) {

                await updateRotationApi(
                    existingRotation.id,
                    editingAgencyId,
                    rotationOrder
                );

            }

            /*
            Create rotation if Agency
            does not have one.
            */

            else {

                await createRotationApi(
                    editingAgencyId,
                    rotationOrder
                );
            }


            alert(
                "Agency updated successfully."
            );
        }


        /*
        ==================================================
        CREATE NEW AGENCY
        ==================================================
        */

        else {

            /*
            STEP 1:
            Create Agency.
            */

            var savedAgency =
                await createAgencyApi(
                    agencyData
                );


            /*
            STEP 2:
            Get REAL database Agency ID.
            */

            var newAgencyId =
                savedAgency &&
                savedAgency.id
                    ? savedAgency.id
                    : null;

            if (!newAgencyId) {

                throw new Error(
                    "Agency was created, but its ID was not returned by the server."
                );
            }


            console.log(
                "New Agency ID:",
                newAgencyId
            );


            /*
            STEP 3:
            Create rotation ONLY for
            this newly created Agency.
            */

            await createRotationApi(
                newAgencyId,
                rotationOrder
            );


            alert(
                "Agency created successfully."
            );
        }


        /*
        --------------------------------------------------
        RELOAD BACKEND DATA
        --------------------------------------------------
        */

        await reloadManagementData();


        /*
        --------------------------------------------------
        RECALCULATE STATUS
        --------------------------------------------------
        */

        refreshCalculatedStatuses();


        /*
        --------------------------------------------------
        REFRESH UI
        --------------------------------------------------
        */

        renderAgencies();
        renderCoordinators();
        populateAgencyDropdown();
        updateDashboardData();


        /*
        --------------------------------------------------
        CLOSE MODAL
        --------------------------------------------------
        */

        closeModal(
            "addAgencyModal"
        );

        editingAgencyId =
            null;


    } catch (error) {

        console.error(
            "Unable to save agency:",
            error
        );

        handleApiError(
            error
        );
    }
}


/*
==========================================================
UPDATE AGENCY
==========================================================
*/

async function updateAgency(
    id,
    agencyName,
    contactPerson,
    phone,
    email,
    status
) {

    var agencyData = {

        agencyName:
            agencyName,

        contactPerson:
            contactPerson,

        phone:
            phone,

        email:
            email,

        status:
            status
    };


    try {

        await updateAgencyApi(
            id,
            agencyData
        );

        await loadAgencies();
        await loadCoordinators();

        refreshCalculatedStatuses();

        renderAgencies();
        populateAgencyDropdown();
        updateDashboardData();

    } catch (error) {

        handleApiError(
            error
        );
    }
}


/*
==========================================================
SAVE COORDINATOR
CREATE / UPDATE
==========================================================
*/

async function saveCoordinator() {

    var name =
        getValue(
            "coordinatorName"
        );

    var agencyId =
        getValue(
            "coordinatorAgency"
        );

    var batchName =
        getValue(
            "coordinatorBatchName"
        );

    var designation =
        getValue(
            "coordinatorDesignation"
        );

    var startDate =
        getValue(
            "coordinatorStartDate"
        );

    var endDate =
        getValue(
            "coordinatorEndDate"
        );

    var phone =
        getValue(
            "coordinatorPhone"
        );

    var email =
        getValue(
            "coordinatorEmail"
        );

    var status =
        getValue(
            "coordinatorStatus"
        );


    /*
    ------------------------------------------------------
    VALIDATION
    ------------------------------------------------------
    */

    if (name === "") {

        alert(
            "Please enter Coordinator Name."
        );

        return;
    }

    if (agencyId === "") {

        alert(
            "Please select Agency."
        );

        return;
    }

    if (batchName === "") {

        alert(
            "Please enter Batch Name."
        );

        return;
    }

    if (designation === "") {

        alert(
            "Please enter Designation."
        );

        return;
    }

    if (startDate === "") {

        alert(
            "Please select Start Date."
        );

        return;
    }

    if (endDate === "") {

        alert(
            "Please select End Date."
        );

        return;
    }

    if (
        endDate <
        startDate
    ) {

        alert(
            "End Date cannot be earlier than Start Date."
        );

        return;
    }

    if (phone === "") {

        alert(
            "Please enter Phone."
        );

        return;
    }

    if (email === "") {

        alert(
            "Please enter Email."
        );

        return;
    }


    /*
    ------------------------------------------------------
    CALCULATE STATUS
    ------------------------------------------------------

    Do NOT rely on manually entered status.
    */

    var calculatedStatus =
        getStatusFromDates(
            startDate,
            endDate
        );


    /*
    ------------------------------------------------------
    COORDINATOR PAYLOAD
    ------------------------------------------------------
    */

    var coordinatorData = {

        name:
            name,

        agency: {

            id:
                Number(
                    agencyId
                )
        },

        batchName:
            batchName,

        startDate:
            startDate,

        endDate:
            endDate,

        designation:
            designation,

        phone:
            phone,

        email:
            email,

        /*
        Status is calculated from dates.
        */

        status:
            calculatedStatus
    };


    console.log(
        "Coordinator payload:",
        coordinatorData
    );


    try {

        /*
        ==================================================
        UPDATE
        ==================================================
        */

        if (
            editingCoordinatorId !==
            null
        ) {

            await updateCoordinatorApi(
                editingCoordinatorId,
                coordinatorData
            );

            alert(
                "Coordinator updated successfully."
            );
        }


        /*
        ==================================================
        CREATE
        ==================================================
        */

        else {

            await createCoordinatorApi(
                coordinatorData
            );

            alert(
                "Coordinator created successfully."
            );
        }


        /*
        --------------------------------------------------
        RELOAD DATA
        --------------------------------------------------
        */

        await reloadManagementData();


        /*
        --------------------------------------------------
        RECALCULATE STATUS
        --------------------------------------------------
        */

        refreshCalculatedStatuses();


        /*
        --------------------------------------------------
        REFRESH UI
        --------------------------------------------------
        */

        renderAgencies();
        renderCoordinators();
        populateAgencyDropdown();
        updateDashboardData();


        /*
        --------------------------------------------------
        CLOSE MODAL
        --------------------------------------------------
        */

        closeModal(
            "addCoordinatorModal"
        );

        editingCoordinatorId =
            null;


    } catch (error) {

        console.error(
            "Unable to save coordinator:",
            error
        );

        handleApiError(
            error
        );
    }
}


/*
==========================================================
UPDATE COORDINATOR
==========================================================
*/

async function updateCoordinator(
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

    /*
    Calculate status from dates.
    */

    var calculatedStatus =
        getStatusFromDates(
            startDate,
            endDate
        );


    var coordinatorData = {

        name:
            name,

        agency: {

            id:
                Number(
                    agencyId
                )
        },

        batchName:
            batchName,

        startDate:
            startDate,

        endDate:
            endDate,

        designation:
            designation,

        phone:
            phone,

        email:
            email,

        status:
            calculatedStatus
    };


    try {

        await updateCoordinatorApi(
            id,
            coordinatorData
        );

        await loadCoordinators();
        await loadAgencies();

        refreshCalculatedStatuses();

        renderCoordinators();
        renderAgencies();

        populateAgencyDropdown();

        updateDashboardData();

    } catch (error) {

        handleApiError(
            error
        );
    }
}


/*
==========================================================
RENDER AGENCIES
==========================================================
*/

function renderAgencies(
    searchText
) {

    var tableBody =
        document.getElementById(
            "agencyTableBody"
        );

    if (!tableBody) {
        return;
    }


    /*
    Always calculate current status
    before rendering.
    */

    refreshCalculatedStatuses();


    searchText =
        (
            searchText ||
            ""
        )
        .toLowerCase()
        .trim();


    tableBody.innerHTML =
        "";


    var filteredAgencies =
        [];


    for (
        var i = 0;
        i < agencies.length;
        i++
    ) {

        var agency =
            agencies[i];

        if (!agency) {
            continue;
        }


        var searchableText =
            (
                (agency.agencyName || "") +
                " " +
                (agency.contactPerson || "") +
                " " +
                (agency.phone || "") +
                " " +
                (agency.email || "") +
                " " +
                (agency.status || "")
            )
            .toLowerCase();


        if (
            searchText === "" ||
            searchableText.indexOf(
                searchText
            ) !== -1
        ) {

            filteredAgencies.push(
                agency
            );
        }
    }


    if (
        filteredAgencies.length ===
        0
    ) {

        tableBody.innerHTML =
            "<tr>" +
                '<td colspan="7" class="text-center">' +
                    "No agencies found." +
                "</td>" +
            "</tr>";

        updateAgencyEntryInfo(
            0
        );

        return;
    }


    for (
        var j = 0;
        j < filteredAgencies.length;
        j++
    ) {

        var currentAgency =
            filteredAgencies[j];


        /*
        Calculate Agency status from
        its Coordinator's dates.
        */

        var calculatedAgencyStatus =
            getAgencyCalculatedStatus(
                currentAgency
            );


        /*
        Keep local object synchronized.
        */

        currentAgency.status =
            calculatedAgencyStatus;


        var row =
            document.createElement(
                "tr"
            );


        var statusClass =
            calculatedAgencyStatus
                .toUpperCase() ===
            "ACTIVE"
                ? "bg-success"
                : "bg-secondary";


        var contactPerson =
            currentAgency.contactPerson ||
            "—";


        /*
        Rotation belongs to this Agency only.
        */

        var rotationOrder =
            getRotationOrderFromLoadedData(
                currentAgency.id
            );


        row.innerHTML =
            "<td>" +
                (j + 1) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentAgency.agencyName
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    contactPerson
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentAgency.phone
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
                        calculatedAgencyStatus
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
                    "')\">" +

                    '<i class="fas fa-pen"></i>' +

                "</button>" +

                '<button type="button" ' +
                    'class="btn btn-sm btn-danger" ' +
                    'onclick="deleteAgency(\'' +
                    escapeForAttribute(
                        currentAgency.id
                    ) +
                    "')\">" +

                    '<i class="fas fa-trash"></i>' +

                "</button>" +

            "</td>";


        tableBody.appendChild(
            row
        );
    }


    updateAgencyEntryInfo(
        filteredAgencies.length
    );
}


/*
==========================================================
RENDER COORDINATORS
==========================================================
*/

function renderCoordinators(
    searchText
) {

    var tableBody =
        document.getElementById(
            "coordinatorTableBody"
        );

    if (!tableBody) {
        return;
    }


    /*
    Calculate status before rendering.
    */

    refreshCalculatedStatuses();


    searchText =
        (
            searchText ||
            ""
        )
        .toLowerCase()
        .trim();


    tableBody.innerHTML =
        "";


    var filteredCoordinators =
        [];


    for (
        var i = 0;
        i < coordinators.length;
        i++
    ) {

        var coordinator =
            coordinators[i];

        if (!coordinator) {
            continue;
        }


        var agencyName =
            coordinator.agency &&
            typeof coordinator.agency ===
            "object"
                ? (
                    coordinator.agency.agencyName ||
                    ""
                )
                : "";


        var calculatedStatus =
            getStatusFromDates(
                coordinator.startDate,
                coordinator.endDate
            );


        coordinator.status =
            calculatedStatus;


        var searchableText =
            (
                (coordinator.name || "") +
                " " +
                agencyName +
                " " +
                (coordinator.batchName || "") +
                " " +
                (coordinator.startDate || "") +
                " " +
                (coordinator.endDate || "") +
                " " +
                (coordinator.designation || "") +
                " " +
                (coordinator.phone || "") +
                " " +
                (coordinator.email || "") +
                " " +
                calculatedStatus
            )
            .toLowerCase();


        if (
            searchText === "" ||
            searchableText.indexOf(
                searchText
            ) !== -1
        ) {

            filteredCoordinators.push(
                coordinator
            );
        }
    }


    if (
        filteredCoordinators.length ===
        0
    ) {

        tableBody.innerHTML =
            "<tr>" +
                '<td colspan="11" class="text-center">' +
                    "No coordinators found." +
                "</td>" +
            "</tr>";

        updateCoordinatorEntryInfo(
            0
        );

        return;
    }


    for (
        var j = 0;
        j < filteredCoordinators.length;
        j++
    ) {

        var currentCoordinator =
            filteredCoordinators[j];


        var currentAgencyName =
            currentCoordinator.agency &&
            typeof currentCoordinator.agency ===
            "object"
                ? (
                    currentCoordinator.agency.agencyName ||
                    ""
                )
                : "";


        var startDate =
            formatDate(
                currentCoordinator.startDate
            );


        var endDate =
            formatDate(
                currentCoordinator.endDate
            );


        var calculatedCoordinatorStatus =
            getStatusFromDates(
                currentCoordinator.startDate,
                currentCoordinator.endDate
            );


        currentCoordinator.status =
            calculatedCoordinatorStatus;


        var row =
            document.createElement(
                "tr"
            );


        var statusClass =
            calculatedCoordinatorStatus
                .toUpperCase() ===
            "ACTIVE"
                ? "bg-success"
                : "bg-secondary";


        row.innerHTML =
            "<td>" +
                (j + 1) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentCoordinator.name
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentAgencyName
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    currentCoordinator.batchName
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    startDate
                ) +
            "</td>" +

            "<td>" +
                escapeHtml(
                    endDate
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
                        calculatedCoordinatorStatus
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
                    "')\">" +

                    '<i class="fas fa-pen"></i>' +

                "</button>" +

                '<button type="button" ' +
                    'class="btn btn-sm btn-danger" ' +
                    'onclick="deleteCoordinator(\'' +
                    escapeForAttribute(
                        currentCoordinator.id
                    ) +
                    "')\">" +

                    '<i class="fas fa-trash"></i>' +

                "</button>" +

            "</td>";


        tableBody.appendChild(
            row
        );
    }


    updateCoordinatorEntryInfo(
        filteredCoordinators.length
    );
}


/*
==========================================================
FORMAT DATE
==========================================================
*/

function formatDate(
    dateString
) {

    if (!dateString) {
        return "";
    }

    var parts =
        String(
            dateString
        ).split("-");


    if (
        parts.length !==
        3
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


/*
==========================================================
POPULATE COORDINATOR AGENCY DROPDOWN
==========================================================
*/
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

    for (
        var i = 0;
        i < agencies.length;
        i++
    ) {

        var agency =
            agencies[i];

        if (!agency) {
            continue;
        }

        /*
        ------------------------------------------------------
        SHOW ALL AGENCIES
        ------------------------------------------------------

        Both Active and Inactive agencies are displayed.

        The dropdown is intentionally NOT filtering
        agencies based on status.
        ------------------------------------------------------
        */

        var option =
            document.createElement(
                "option"
            );

        /*
        Store the real Agency ID.
        */

        option.value =
            String(
                agency.id
            );

        /*
        Display Agency Name.
        */

        option.textContent =
            agency.agencyName;

        select.appendChild(
            option
        );
    }

    /*
    Restore previously selected Agency
    when possible.
    */

    if (
        currentValue !== ""
    ) {

        select.value =
            currentValue;
    }
}

/*
==========================================================
FIND COORDINATOR BY ID
==========================================================
*/

function findCoordinatorById(
    id
) {

    for (
        var i = 0;
        i < coordinators.length;
        i++
    ) {

        if (
            String(
                coordinators[i].id
            ) ===
            String(
                id
            )
        ) {

            return coordinators[i];
        }
    }

    return null;
}


/*
==========================================================
EDIT AGENCY
==========================================================
*/

async function editAgency(
    id
) {

    var index =
        findAgencyIndex(
            id
        );


    if (index === -1) {
        return;
    }


    var agency =
        agencies[index];


    editingAgencyId =
        agency.id;


    setValue(
        "agencyName",
        agency.agencyName
    );


    setValue(
        "agencyContactPerson",
        agency.contactPerson
    );


    setValue(
        "agencyContactNo",
        agency.phone
    );


    setValue(
        "agencyEmail",
        agency.email
    );


    /*
    Calculate current Agency status
    instead of trusting stored status.
    */

    var calculatedAgencyStatus =
        getAgencyCalculatedStatus(
            agency
        );


    setValue(
        "agencyStatus",
        calculatedAgencyStatus
    );


    /*
    Get rotation belonging ONLY
    to this Agency.
    */

    var rotation =
        null;


    try {

        rotation =
            await getRotationByAgencyId(
                agency.id
            );

    } catch (error) {

        console.warn(
            "Unable to retrieve rotation for Agency:",
            agency.id
        );
    }


    if (
        rotation &&
        rotation.rotationOrder !==
        undefined
    ) {

        setValue(
            "agencyRotationOrder",
            rotation.rotationOrder
        );

    } else {

        setValue(
            "agencyRotationOrder",
            getRotationOrderFromLoadedData(
                agency.id
            )
        );
    }


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


/*
==========================================================
EDIT COORDINATOR
==========================================================
*/

function editCoordinator(
    id
) {

    var index =
        findCoordinatorIndex(
            id
        );


    if (index === -1) {
        return;
    }


    var coordinator =
        coordinators[index];


    editingCoordinatorId =
        coordinator.id;


    populateAgencyDropdown();


    setValue(
        "coordinatorName",
        coordinator.name
    );


    if (
        coordinator.agency &&
        typeof coordinator.agency ===
        "object"
    ) {

        setValue(
            "coordinatorAgency",
            coordinator.agency.id
        );

    } else if (
        coordinator.agencyId !==
        undefined &&
        coordinator.agencyId !==
        null
    ) {

        setValue(
            "coordinatorAgency",
            coordinator.agencyId
        );
    }


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


    /*
    Calculate status from dates.
    */

    var calculatedStatus =
        getStatusFromDates(
            coordinator.startDate,
            coordinator.endDate
        );


    setValue(
        "coordinatorStatus",
        calculatedStatus
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


/*
==========================================================
GET ROTATION ORDER FOR AGENCY
==========================================================
*/

function getRotationOrderFromLoadedData(
    agencyId
) {

    for (
        var i = 0;
        i < rotations.length;
        i++
    ) {

        var rotation =
            rotations[i];

        if (!rotation) {
            continue;
        }


        var rotationAgencyId =
            getRotationAgencyId(
                rotation
            );


        /*
        Compare Rotation Agency ID
        with requested Agency ID.
        */

        if (
            String(
                rotationAgencyId
            ) ===
            String(
                agencyId
            )
        ) {

            return (
                rotation.rotationOrder !==
                undefined
                    ? rotation.rotationOrder
                    : ""
            );
        }
    }


    return "";
}


/*
==========================================================
GET ROTATION AGENCY ID
==========================================================
*/

function getRotationAgencyId(
    rotation
) {

    if (!rotation) {
        return null;
    }


    if (
        rotation.agency &&
        typeof rotation.agency ===
        "object"
    ) {

        if (
            rotation.agency.id !==
            undefined &&
            rotation.agency.id !==
            null
        ) {

            return rotation.agency.id;
        }
    }


    if (
        rotation.agencyId !==
        undefined &&
        rotation.agencyId !==
        null
    ) {

        return rotation.agencyId;
    }


    return null;
}


/*
==========================================================
DELETE AGENCY
==========================================================
*/

async function deleteAgency(
    id
) {

    var index =
        findAgencyIndex(
            id
        );


    if (index === -1) {
        return;
    }


    var agency =
        agencies[index];


    var confirmed =
        confirm(
            'Are you sure you want to delete "' +
            agency.agencyName +
            '"?'
        );


    if (!confirmed) {
        return;
    }


    try {

        /*
        Delete rotation belonging ONLY
        to this Agency first.
        */

        try {

            var rotation =
                await getRotationByAgencyId(
                    id
                );


            if (
                rotation &&
                rotation.id
            ) {

                await deleteRotationApi(
                    rotation.id
                );
            }

        } catch (rotationError) {

            console.warn(
                "No rotation found for Agency:",
                id
            );
        }


        /*
        Delete Agency.
        */

        await deleteAgencyApi(
            id
        );


        alert(
            "Agency deleted successfully."
        );


        await reloadManagementData();


        refreshCalculatedStatuses();


        renderAgencies();
        renderCoordinators();
        populateAgencyDropdown();
        updateDashboardData();


    } catch (error) {

        console.error(
            "Unable to delete agency:",
            error
        );

        handleApiError(
            error
        );
    }
}


/*
==========================================================
DELETE COORDINATOR
==========================================================
*/

async function deleteCoordinator(
    id
) {

    var index =
        findCoordinatorIndex(
            id
        );


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


    try {

        await deleteCoordinatorApi(
            id
        );


        alert(
            "Coordinator deleted successfully."
        );


        await reloadManagementData();


        refreshCalculatedStatuses();


        renderAgencies();
        renderCoordinators();
        populateAgencyDropdown();
        updateDashboardData();


    } catch (error) {

        console.error(
            "Unable to delete coordinator:",
            error
        );

        handleApiError(
            error
        );
    }
}


/*
==========================================================
RELOAD MANAGEMENT DATA
==========================================================
*/

async function reloadManagementData() {

    await loadAgencies();
    await loadRotations();
    await loadCoordinators();

    refreshCalculatedStatuses();
}


/*
==========================================================
UPDATE DASHBOARD DATA
==========================================================
*/

function updateDashboardData() {

    /*
    Do NOT use Local Storage as the dashboard's
    primary data source.

    Backend remains the source of truth.
    */

    try {

        window.dispatchEvent(
            new CustomEvent(
                "dashboardDataChanged"
            )
        );

    } catch (error) {

        console.warn(
            "Unable to notify dashboard:",
            error
        );
    }
}


/*
==========================================================
AGENCY ENTRY INFORMATION
==========================================================
*/

function updateAgencyEntryInfo(
    count
) {

    var element =
        document.getElementById(
            "agencyEntryInfo"
        );


    if (!element) {
        return;
    }


    if (
        count ===
        0
    ) {

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


/*
==========================================================
COORDINATOR ENTRY INFORMATION
==========================================================
*/

function updateCoordinatorEntryInfo(
    count
) {

    var element =
        document.getElementById(
            "coordinatorEntryInfo"
        );


    if (!element) {
        return;
    }


    if (
        count ===
        0
    ) {

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


/*
==========================================================
FIND AGENCY INDEX
==========================================================
*/

function findAgencyIndex(
    id
) {

    for (
        var i = 0;
        i < agencies.length;
        i++
    ) {

        if (
            String(
                agencies[i].id
            ) ===
            String(
                id
            )
        ) {

            return i;
        }
    }


    return -1;
}


/*
==========================================================
FIND COORDINATOR INDEX
==========================================================
*/

function findCoordinatorIndex(
    id
) {

    for (
        var i = 0;
        i < coordinators.length;
        i++
    ) {

        if (
            String(
                coordinators[i].id
            ) ===
            String(
                id
            )
        ) {

            return i;
        }
    }


    return -1;
}


/*
==========================================================
GET INPUT VALUE
==========================================================
*/

function getValue(
    id
) {

    var element =
        document.getElementById(
            id
        );


    if (!element) {
        return "";
    }


    return (
        element.value ||
        ""
    )
    .trim();
}


/*
==========================================================
SET INPUT VALUE
==========================================================
*/

function setValue(
    id,
    value
) {

    var element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    element.value =
        value ===
        null ||
        value ===
        undefined
            ? ""
            : value;
}


/*
==========================================================
CLOSE BOOTSTRAP MODAL
==========================================================
*/

function closeModal(
    id
) {

    var modalElement =
        document.getElementById(
            id
        );


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


/*
==========================================================
HTML ESCAPE
==========================================================
*/

function escapeHtml(
    value
) {

    if (
        value ===
        null ||
        value ===
        undefined
    ) {

        return "";
    }


    return String(
        value
    )

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


/*
==========================================================
ESCAPE INLINE ATTRIBUTE
==========================================================
*/

function escapeForAttribute(
    value
) {

    if (
        value ===
        null ||
        value ===
        undefined
    ) {

        return "";
    }


    return String(
        value
    )

    .replace(
        /\\/g,
        "\\\\"
    )

    .replace(
        /'/g,
        "\\'"
    );
}


/*
==========================================================
API ERROR HANDLER
==========================================================
*/

function handleApiError(
    error
) {

    var message =
        error &&
        error.message
            ? error.message
            : "An unexpected error occurred.";


    console.error(
        "API Error:",
        message
    );


    alert(
        message
    );
}


/*
==========================================================
LOGOUT
==========================================================
*/

function logoutUser() {

    localStorage.removeItem(
        "obt_logged_in_user"
    );


    window.location.href =
        "../../index.html";
}