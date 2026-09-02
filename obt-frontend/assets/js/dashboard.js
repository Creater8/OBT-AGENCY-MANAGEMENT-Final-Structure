"use strict";

/* ==========================================================
   OBT AGENCY MANAGEMENT SYSTEM
   DASHBOARD.JS

   ==========================================================
   BACKEND RELATIONSHIP
   ==========================================================

       Agency
          |
          +---- Coordinator
          |        |
          |        +---- Start Date
          |        +---- End Date
          |
          +---- Rotation
                   |
                   +---- Rotation Order


   ==========================================================
   IMPORTANT BUSINESS RULES
   ==========================================================

   1. There is NO fixed number of agencies.

   2. There is NO fixed 1–5 rotation cycle.

   3. Rotation records are read dynamically from backend.

   4. Coordinator START DATE and END DATE determine
      whether an agency is currently active.

   5. At any given time there can be ONLY ONE active agency.

   6. Agencies must NOT overlap.

   7. The backend determines the current rotation agency.

   8. The dashboard uses:
          GET /api/rotations/current-agency

      as the source of truth for automatic agency selection.

   9. Agency status shown on dashboard is determined
      from the Coordinator date range.

   10. Agency itself does NOT contain startDate/endDate.
       Those dates belong to Coordinator.

==========================================================
*/


/* ==========================================================
   GLOBAL DATA
========================================================== */

var dashboardAgencies = [];

var dashboardCoordinators = [];

var dashboardBatches = [];

var dashboardRotations = [];


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDashboard();

    }
);


/* ==========================================================
   INITIALIZE DASHBOARD
========================================================== */

async function initializeDashboard() {

    loadLoggedInUser();

    registerDashboardEvents();

    await loadDashboardData();

    renderDashboardStatistics();

    populateAgencyDropdown();

    await autoSelectActiveAgency();

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
   LOAD DASHBOARD DATA
========================================================== */

async function loadDashboardData() {

    await loadDashboardAgencies();

    await loadDashboardCoordinators();

    await loadDashboardBatches();

    await loadDashboardRotations();


    console.log(
        "========== DASHBOARD DATA =========="
    );


    console.log(
        "Agencies:",
        dashboardAgencies
    );


    console.log(
        "Coordinators:",
        dashboardCoordinators
    );


    console.log(
        "Batches:",
        dashboardBatches
    );


    console.log(
        "Rotations:",
        dashboardRotations
    );


    console.log(
        "===================================="
    );

}


/* ==========================================================
   LOAD AGENCIES
========================================================== */

async function loadDashboardAgencies() {

    try {

        var data =
            await getAgencies();


        dashboardAgencies =
            Array.isArray(data)
                ? data
                : [];


    } catch (error) {

        console.error(
            "Unable to load agencies:",
            error
        );


        dashboardAgencies = [];


        handleDashboardApiError(
            error
        );

    }

}


/* ==========================================================
   LOAD COORDINATORS
========================================================== */

async function loadDashboardCoordinators() {

    try {

        var data =
            await getCoordinators();


        dashboardCoordinators =
            Array.isArray(data)
                ? data
                : [];


    } catch (error) {

        console.error(
            "Unable to load coordinators:",
            error
        );


        dashboardCoordinators = [];


        handleDashboardApiError(
            error
        );

    }

}


/* ==========================================================
   LOAD BATCHES
========================================================== */

async function loadDashboardBatches() {

    try {

        if (
            typeof getBatches !==
            "function"
        ) {

            console.warn(
                "getBatches() is not available."
            );


            dashboardBatches = [];


            return;

        }


        var data =
            await getBatches();


        dashboardBatches =
            Array.isArray(data)
                ? data
                : [];


    } catch (error) {

        console.error(
            "Unable to load batches:",
            error
        );


        dashboardBatches = [];

    }

}


/* ==========================================================
   LOAD ROTATIONS
========================================================== */

async function loadDashboardRotations() {

    try {

        if (
            typeof getRotations !==
            "function"
        ) {

            console.warn(
                "getRotations() is not available."
            );


            dashboardRotations = [];


            return;

        }


        var data =
            await getRotations();


        dashboardRotations =
            Array.isArray(data)
                ? data
                : [];


    } catch (error) {

        console.error(
            "Unable to load rotations:",
            error
        );


        dashboardRotations = [];

    }

}


/* ==========================================================
   DASHBOARD EVENTS
========================================================== */

function registerDashboardEvents() {

    var trainingSelect =
        document.getElementById(
            "trainingSelect"
        );


    var logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    /* ======================================================
       AGENCY SELECTION
    ====================================================== */

    if (trainingSelect) {

        trainingSelect.addEventListener(
            "change",
            function () {

                var selectedAgencyId =
                    trainingSelect.value;


                if (
                    selectedAgencyId === ""
                ) {

                    clearTrainingDetails();

                    return;

                }


                showAgencyDetails(
                    selectedAgencyId
                );

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
   DASHBOARD STATISTICS
========================================================== */

function renderDashboardStatistics() {

    var totalAgenciesElement =
        document.getElementById(
            "totalAgencies"
        );


    var totalCoordinatorsElement =
        document.getElementById(
            "totalCoordinators"
        );


    var activeTrainingsElement =
        document.getElementById(
            "activeTrainings"
        );


    var upcomingTrainingsElement =
        document.getElementById(
            "upcomingTrainings"
        );


    /* ======================================================
       TOTAL AGENCIES
    ====================================================== */

    if (totalAgenciesElement) {

        totalAgenciesElement.textContent =
            dashboardAgencies.length;

    }


    /* ======================================================
       TOTAL COORDINATORS
    ====================================================== */

    if (totalCoordinatorsElement) {

        totalCoordinatorsElement.textContent =
            dashboardCoordinators.length;

    }


    var activeCount = 0;

    var upcomingCount = 0;


    /* ======================================================
       CHECK COORDINATOR DATE RANGES
    ====================================================== */

    for (
        var i = 0;
        i < dashboardCoordinators.length;
        i++
    ) {

        var coordinator =
            dashboardCoordinators[i];


        if (!coordinator) {

            continue;

        }


        var startDate =
            getCoordinatorStartDate(
                coordinator
            );


        var endDate =
            getCoordinatorEndDate(
                coordinator
            );


        if (
            !startDate ||
            !endDate
        ) {

            continue;

        }


        var start =
            parseDateOnly(
                startDate
            );


        var end =
            parseDateOnly(
                endDate
            );


        var today =
            getTodayDate();


        if (
            !start ||
            !end
        ) {

            continue;

        }


        /* ==================================================
           CURRENTLY ACTIVE
        ================================================== */

        if (
            today >= start &&
            today <= end
        ) {

            activeCount++;

            continue;

        }


        /* ==================================================
           UPCOMING
        ================================================== */

        if (
            today < start
        ) {

            upcomingCount++;

        }

    }


    if (activeTrainingsElement) {

        /*
         * Business rule:
         *
         * Only one agency may be active.
         *
         * Therefore the dashboard never intentionally
         * displays more than one active training.
         */

        activeTrainingsElement.textContent =
            activeCount > 0
                ? 1
                : 0;

    }


    if (upcomingTrainingsElement) {

        upcomingTrainingsElement.textContent =
            upcomingCount;

    }

}


/* ==========================================================
   POPULATE AGENCY DROPDOWN

   IMPORTANT:

   Agencies are NOT displayed in fixed positions.

   There may be:

       1 agency
       2 agencies
       5 agencies
       10 agencies
       100 agencies

   The dropdown is generated dynamically.

   The CURRENT ACTIVE agency is marked:

       Active

   All other agencies are marked:

       Inactive

   Upcoming agencies are marked:

       Upcoming

========================================================== */

function populateAgencyDropdown() {

    var trainingSelect =
        document.getElementById(
            "trainingSelect"
        );


    if (!trainingSelect) {

        return;

    }


    trainingSelect.innerHTML = "";


    /* ======================================================
       DEFAULT OPTION
    ====================================================== */

    var defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value = "";

    defaultOption.textContent =
        "Select a training program";


    trainingSelect.appendChild(
        defaultOption
    );


    /* ======================================================
       NO AGENCIES
    ====================================================== */

    if (
        !dashboardAgencies ||
        dashboardAgencies.length === 0
    ) {

        return;

    }


    /* ======================================================
       BUILD AGENCY LIST
    ====================================================== */

    var agencies =
        dashboardAgencies.slice();


    /*
     * Sort by rotation order when available.
     *
     * Rotation order is ONLY used for display order.
     *
     * It does NOT determine active status.
     */

    agencies.sort(
        function (agencyA, agencyB) {

            var orderA =
                getRotationOrderForAgency(
                    agencyA.id
                );


            var orderB =
                getRotationOrderForAgency(
                    agencyB.id
                );


            if (
                orderA === null &&
                orderB === null
            ) {

                return compareAgencyNames(
                    agencyA,
                    agencyB
                );

            }


            if (
                orderA === null
            ) {

                return 1;

            }


            if (
                orderB === null
            ) {

                return -1;

            }


            return orderA - orderB;

        }
    );


    /* ======================================================
       CREATE OPTIONS
    ====================================================== */

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


        var agencyId =
            agency.id;


        var coordinator =
            findCoordinatorForAgency(
                agencyId
            );


        var agencyState =
            getAgencyState(
                coordinator
            );


        var option =
            document.createElement(
                "option"
            );


        option.value =
            String(
                agencyId
            );


        var agencyName =
            agency.agencyName ||
            agency.name ||
            "Agency";


        var rotationOrder =
            getRotationOrderForAgency(
                agencyId
            );


        /* ==================================================
           DISPLAY TEXT
        ================================================== */

        var displayText =
            "";


        if (
            rotationOrder !== null
        ) {

            displayText =
                rotationOrder +
                ". " +
                agencyName;

        } else {

            displayText =
                agencyName;

        }


        /* ==================================================
           STATUS LABEL
        ================================================== */

        if (
            agencyState === "active"
        ) {

            displayText +=
                " - Active";

        } else if (
            agencyState === "upcoming"
        ) {

            displayText +=
                " - Upcoming";

        } else if (
            agencyState === "completed"
        ) {

            displayText +=
                " - Completed";

        } else {

            displayText +=
                " - Inactive";

        }


        option.textContent =
            displayText;


        trainingSelect.appendChild(
            option
        );

    }

}


/* ==========================================================
   AUTO SELECT CURRENT ROTATION AGENCY

   IMPORTANT:

   The BACKEND is the source of truth.

   API:

       GET /api/rotations/current-agency

   The backend determines:

       1. Currently active agency
       2. Nearest future agency
       3. Rotation rollover agency

   The dashboard does NOT independently decide which
   agency should be automatically selected.

========================================================== */

async function autoSelectActiveAgency() {

    var trainingSelect =
        document.getElementById(
            "trainingSelect"
        );


    if (!trainingSelect) {

        return;

    }


    try {

        /*
         * Backend is the source of truth.
         */

        var activeAgency =
            await getCurrentActiveAgencyApi();


        /* ==================================================
           NO AGENCY RETURNED
        ================================================== */

        if (!activeAgency) {

            trainingSelect.value = "";

            clearTrainingDetails();


            console.log(
                "Backend returned no current rotation agency."
            );


            return;

        }


        /* ==================================================
           VERIFY AGENCY EXISTS IN DASHBOARD DATA
        ================================================== */

        var agency =
            findAgencyById(
                activeAgency.id
            );


        if (!agency) {

            trainingSelect.value = "";

            clearTrainingDetails();


            console.warn(
                "Current rotation agency returned by backend " +
                "was not found in dashboard agency data:",
                activeAgency
            );


            return;

        }


        /* ==================================================
           SELECT BACKEND-DETERMINED AGENCY
        ================================================== */

        trainingSelect.value =
            String(
                activeAgency.id
            );


        showAgencyDetails(
            activeAgency.id
        );


        console.log(
            "Backend-selected current rotation agency:",
            activeAgency
        );


    } catch (error) {

        console.error(
            "Unable to determine current active agency " +
            "from backend:",
            error
        );


        /*
         * Do not independently calculate the active agency
         * when the backend request fails.
         *
         * Backend remains the source of truth.
         */

        trainingSelect.value = "";

        clearTrainingDetails();

    }

}


/* ==========================================================
   FIND ACTIVE AGENCY

   NOTE:

   This function is currently retained because it is part
   of the existing dashboard logic.

   It is NOT used for automatic agency selection anymore.

   Automatic selection uses:

       GET /api/rotations/current-agency

========================================================== */

function findActiveAgency() {

    var today =
        getTodayDate();


    var activeAgency =
        null;


    for (
        var i = 0;
        i < dashboardAgencies.length;
        i++
    ) {

        var agency =
            dashboardAgencies[i];


        if (!agency) {

            continue;

        }


        var coordinator =
            findCoordinatorForAgency(
                agency.id
            );


        if (!coordinator) {

            continue;

        }


        var startDate =
            getCoordinatorStartDate(
                coordinator
            );


        var endDate =
            getCoordinatorEndDate(
                coordinator
            );


        if (
            !startDate ||
            !endDate
        ) {

            continue;

        }


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

            continue;

        }


        if (
            today >= start &&
            today <= end
        ) {

            /*
             * Since agencies are required not to overlap,
             * there should only ever be one match.
             */

            if (activeAgency) {

                console.error(
                    "DATA ERROR: Multiple agencies overlap today.",
                    activeAgency,
                    agency
                );

                /*
                 * We deliberately keep the first agency.
                 *
                 * The backend should prevent overlapping
                 * coordinator periods.
                 */

                continue;

            }


            activeAgency =
                agency;

        }

    }


    return activeAgency;

}


/* ==========================================================
   GET AGENCY STATE
========================================================== */

function getAgencyState(
    coordinator
) {

    if (!coordinator) {

        return "inactive";

    }


    var startDate =
        getCoordinatorStartDate(
            coordinator
        );


    var endDate =
        getCoordinatorEndDate(
            coordinator
        );


    if (
        !startDate ||
        !endDate
    ) {

        return "inactive";

    }


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

        return "inactive";

    }


    var today =
        getTodayDate();


    /* ======================================================
       ACTIVE
    ====================================================== */

    if (
        today >= start &&
        today <= end
    ) {

        return "active";

    }


    /* ======================================================
       UPCOMING
    ====================================================== */

    if (
        today < start
    ) {

        return "upcoming";

    }


    /* ======================================================
       COMPLETED
    ====================================================== */

    if (
        today > end
    ) {

        return "completed";

    }


    return "inactive";

}


/* ==========================================================
   GET COORDINATOR START DATE

   Coordinator is the source of truth.

   Preferred:

       coordinator.startDate

========================================================== */

function getCoordinatorStartDate(
    coordinator
) {

    if (!coordinator) {

        return null;

    }


    if (
        coordinator.startDate
    ) {

        return coordinator.startDate;

    }


    /*
     * Compatibility fallback.
     *
     * In case an older response contains
     * the date inside a batch.
     */

    if (
        coordinator.batch &&
        typeof coordinator.batch === "object" &&
        coordinator.batch.startDate
    ) {

        return coordinator.batch.startDate;

    }


    return null;

}


/* ==========================================================
   GET COORDINATOR END DATE
========================================================== */

function getCoordinatorEndDate(
    coordinator
) {

    if (!coordinator) {

        return null;

    }


    if (
        coordinator.endDate
    ) {

        return coordinator.endDate;

    }


    /*
     * Compatibility fallback.
     */

    if (
        coordinator.batch &&
        typeof coordinator.batch === "object" &&
        coordinator.batch.endDate
    ) {

        return coordinator.batch.endDate;

    }


    return null;

}


/* ==========================================================
   FIND COORDINATOR FOR AGENCY
========================================================== */

function findCoordinatorForAgency(
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
        i < dashboardCoordinators.length;
        i++
    ) {

        var coordinator =
            dashboardCoordinators[i];


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


/* ==========================================================
   GET COORDINATOR AGENCY ID
========================================================== */

function getCoordinatorAgencyId(
    coordinator
) {

    if (!coordinator) {

        return null;

    }


    if (
        coordinator.agency &&
        typeof coordinator.agency === "object"
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


/* ==========================================================
   FIND BATCH FOR COORDINATOR
========================================================== */

function findBatchForCoordinator(
    coordinatorId
) {

    if (
        coordinatorId === null ||
        coordinatorId === undefined
    ) {

        return null;

    }


    for (
        var i = 0;
        i < dashboardBatches.length;
        i++
    ) {

        var batch =
            dashboardBatches[i];


        if (!batch) {

            continue;

        }


        var batchCoordinatorId =
            getBatchCoordinatorId(
                batch
            );


        if (
            String(
                batchCoordinatorId
            ) ===
            String(
                coordinatorId
            )
        ) {

            return batch;

        }

    }


    return null;

}


/* ==========================================================
   GET COORDINATOR ID FROM BATCH
========================================================== */

function getBatchCoordinatorId(
    batch
) {

    if (!batch) {

        return null;

    }


    if (
        batch.coordinator &&
        typeof batch.coordinator === "object"
    ) {

        if (
            batch.coordinator.id !==
            undefined &&
            batch.coordinator.id !==
            null
        ) {

            return batch.coordinator.id;

        }

    }


    if (
        batch.coordinatorId !==
        undefined &&
        batch.coordinatorId !==
        null
    ) {

        return batch.coordinatorId;

    }


    return null;

}


/* ==========================================================
   FIND AGENCY BY ID
========================================================== */

function findAgencyById(
    agencyId
) {

    if (
        agencyId === null ||
        agencyId === undefined ||
        agencyId === ""
    ) {

        return null;

    }


    for (
        var i = 0;
        i < dashboardAgencies.length;
        i++
    ) {

        var agency =
            dashboardAgencies[i];


        if (!agency) {

            continue;

        }


        if (
            String(
                agency.id
            ) ===
            String(
                agencyId
            )
        ) {

            return agency;

        }

    }


    return null;

}


/* ==========================================================
   GET ROTATION ORDER FOR AGENCY

   Rotation order is used ONLY for ordering.

   It does NOT determine active status.

========================================================== */

function getRotationOrderForAgency(
    agencyId
) {

    if (
        agencyId === null ||
        agencyId === undefined
    ) {

        return null;

    }


    if (
        !dashboardRotations ||
        dashboardRotations.length === 0
    ) {

        return null;

    }


    for (
        var i = 0;
        i < dashboardRotations.length;
        i++
    ) {

        var rotation =
            dashboardRotations[i];


        if (!rotation) {

            continue;

        }


        var rotationAgencyId =
            getRotationAgencyId(
                rotation
            );


        if (
            String(
                rotationAgencyId
            ) ===
            String(
                agencyId
            )
        ) {

            var order =
                Number(
                    rotation.rotationOrder
                );


            if (
                Number.isInteger(order) &&
                order > 0
            ) {

                return order;

            }

        }

    }


    return null;

}


/* ==========================================================
   GET AGENCY ID FROM ROTATION
========================================================== */

function getRotationAgencyId(
    rotation
) {

    if (!rotation) {

        return null;

    }


    /* ======================================================
       NORMAL BACKEND STRUCTURE
    ====================================================== */

    if (
        rotation.agency &&
        typeof rotation.agency === "object"
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


    /* ======================================================
       COMPATIBILITY STRUCTURE
    ====================================================== */

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


/* ==========================================================
   SHOW SELECTED AGENCY DETAILS
========================================================== */

function showAgencyDetails(
    agencyId
) {

    var agency =
        findAgencyById(
            agencyId
        );


    if (!agency) {

        clearTrainingDetails();


        console.warn(
            "Agency not found:",
            agencyId
        );


        return;

    }


    var coordinator =
        findCoordinatorForAgency(
            agencyId
        );


    var rotationOrder =
        getRotationOrderForAgency(
            agencyId
        );


    var agencyState =
        getAgencyState(
            coordinator
        );


    console.log(
        "========== SELECTED AGENCY =========="
    );


    console.log(
        "Agency:",
        agency
    );


    console.log(
        "Agency ID:",
        agencyId
    );


    console.log(
        "Rotation Order:",
        rotationOrder === null
            ? "Not Assigned"
            : rotationOrder
    );


    console.log(
        "Agency State:",
        agencyState
    );


    console.log(
        "Coordinator:",
        coordinator
    );


    console.log(
        "======================================"
    );


    /* ======================================================
       AGENCY INFORMATION
    ====================================================== */

    setElementText(
        "trainingAgency",
        agency.agencyName ||
        agency.name ||
        ""
    );


    setElementText(
        "trainingPhone",
        agency.phone ||
        agency.contactNo ||
        ""
    );


    setElementText(
        "trainingEmail",
        agency.email ||
        ""
    );


    /*
     * IMPORTANT:
     *
     * Agency status is calculated from the
     * Coordinator start/end dates.
     *
     * We do not blindly trust agency.status.
     */

    updateStatusBadge(
        agencyState
    );


    /* ======================================================
       NO COORDINATOR
    ====================================================== */

    if (!coordinator) {

        clearCoordinatorDetails();

        return;

    }


    /* ======================================================
       COORDINATOR
    ====================================================== */

    setElementText(
        "trainingCoordinator",
        coordinator.name ||
        ""
    );


    setElementText(
        "trainingCoordinatorDate",
        formatDate(
            coordinator.date
        )
    );


    setElementText(
        "trainingDesignation",
        coordinator.designation ||
        ""
    );


    /* ======================================================
       BATCH INFORMATION
    ====================================================== */

    setElementText(
        "trainingBatchName",
        coordinator.batchName ||
        ""
    );


    /*
     * IMPORTANT:
     *
     * Start Date and End Date come from Coordinator.
     */

    setElementText(
        "trainingStartDate",
        formatDate(
            getCoordinatorStartDate(
                coordinator
            )
        )
    );


    setElementText(
        "trainingEndDate",
        formatDate(
            getCoordinatorEndDate(
                coordinator
            )
        )
    );

}


/* ==========================================================
   CLEAR COORDINATOR DETAILS
========================================================== */

function clearCoordinatorDetails() {

    setElementText(
        "trainingCoordinator",
        ""
    );


    setElementText(
        "trainingCoordinatorDate",
        ""
    );


    setElementText(
        "trainingDesignation",
        ""
    );


    clearBatchDetails();

}


/* ==========================================================
   CLEAR BATCH DETAILS
========================================================== */

function clearBatchDetails() {

    setElementText(
        "trainingBatchName",
        ""
    );


    setElementText(
        "trainingStartDate",
        ""
    );


    setElementText(
        "trainingEndDate",
        ""
    );

}


/* ==========================================================
   CLEAR ALL TRAINING DETAILS
========================================================== */

function clearTrainingDetails() {

    clearCoordinatorDetails();


    setElementText(
        "trainingAgency",
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


    updateStatusBadge(
        ""
    );

}


/* ==========================================================
   UPDATE STATUS BADGE
========================================================== */

function updateStatusBadge(
    status
) {

    var element =
        document.getElementById(
            "trainingStatus"
        );


    if (!element) {

        return;

    }


    element.className =
        "status-badge";


    if (!status) {

        element.textContent =
            "";


        return;

    }


    var normalizedStatus =
        String(status)
            .toLowerCase()
            .trim();


    /* ======================================================
       ACTIVE
    ====================================================== */

    if (
        normalizedStatus ===
        "active"
    ) {

        element.textContent =
            "Active";


        element.classList.add(
            "status-active"
        );


        return;

    }


    /* ======================================================
       UPCOMING
    ====================================================== */

    if (
        normalizedStatus ===
        "upcoming"
    ) {

        element.textContent =
            "Upcoming";


        element.classList.add(
            "status-inactive"
        );


        return;

    }


    /* ======================================================
       COMPLETED
    ====================================================== */

    if (
        normalizedStatus ===
        "completed"
    ) {

        element.textContent =
            "Completed";


        element.classList.add(
            "status-inactive"
        );


        return;

    }


    /* ======================================================
       INACTIVE
    ====================================================== */

    element.textContent =
        "Inactive";


    element.classList.add(
        "status-inactive"
    );

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
   FORMAT DATE

   Backend:

       YYYY-MM-DD

   Display:

       DD-MM-YYYY

========================================================== */

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
   PARSE DATE ONLY

   IMPORTANT:

   We deliberately create a LOCAL date.

   This prevents timezone conversion from changing
   the day.

========================================================== */

function parseDateOnly(
    dateString
) {

    if (!dateString) {

        return null;

    }


    var parts =
        String(
            dateString
        ).split("-");


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


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/* ==========================================================
   GET TODAY DATE

   Time is removed.

   Therefore comparisons are:

       date only
       vs
       date only

========================================================== */

function getTodayDate() {

    var now =
        new Date();


    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

}


/* ==========================================================
   COMPARE AGENCY NAMES
========================================================== */

function compareAgencyNames(
    agencyA,
    agencyB
) {

    var nameA =
        String(
            agencyA.agencyName ||
            agencyA.name ||
            ""
        )
        .toLowerCase();


    var nameB =
        String(
            agencyB.agencyName ||
            agencyB.name ||
            ""
        )
        .toLowerCase();


    if (
        nameA < nameB
    ) {

        return -1;

    }


    if (
        nameA > nameB
    ) {

        return 1;

    }


    return 0;

}


/* ==========================================================
   API ERROR HANDLER
========================================================== */

function handleDashboardApiError(
    error
) {

    var message =
        error &&
        error.message
            ? error.message
            : "Unable to load dashboard data.";


    console.error(
        "Dashboard API Error:",
        message
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
   REFRESH DASHBOARD
========================================================== */

async function refreshDashboard() {

    await loadDashboardData();

    renderDashboardStatistics();

    populateAgencyDropdown();

    await autoSelectActiveAgency();

}


/* ==========================================================
   DASHBOARD DATA CHANGED EVENT
========================================================== */

window.addEventListener(
    "dashboardDataChanged",
    function () {

        refreshDashboard();

    }
);