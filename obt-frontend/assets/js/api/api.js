"use strict";

/* ==========================================================
   OBT AGENCY MANAGEMENT SYSTEM
   API.JS

   FRONTEND <-> SPRING BOOT BACKEND

   AUTHENTICATION:
   - Spring Security
   - BCrypt
   - HTTP SESSION
   - JWT NOT USED

   IMPORTANT:
   - credentials: "include" is REQUIRED
   - Session cookie is automatically sent to backend
   - Password is NEVER stored in localStorage
========================================================== */


/* ==========================================================
   BASE API URL
========================================================== */

var API_BASE_URL =
    var API_BASE_URL =
    (window.location.hostname === "localhost" ||
     window.location.hostname === "127.0.0.1")
        ? "http://localhost:8080/api"
        : "https://obt-agency-backend.onrender.com/api";


/* ==========================================================
   COMMON API REQUEST
========================================================== */

async function apiRequest(url, options) {

    options = options || {};

    var requestOptions = {

        method: options.method || "GET",

        credentials: "include",

        headers: {

            "Content-Type": "application/json",

            "Accept": "application/json"

        }

    };


    if (options.body !== undefined) {

        requestOptions.body =
            JSON.stringify(options.body);

    }


    try {

        console.log(
            "API Request:",
            requestOptions.method,
            API_BASE_URL + url
        );


        var response =
            await fetch(
                API_BASE_URL + url,
                requestOptions
            );


        if (response.status === 204) {

            return null;

        }


        var data = null;

        var contentType =
            response.headers.get(
                "content-type"
            );


        if (
            contentType &&
            contentType
                .toLowerCase()
                .includes("application/json")
        ) {

            data =
                await response.json();

        } else {

            var text =
                await response.text();

            if (text) {

                data = text;

            }

        }


        if (!response.ok) {

            throw new Error(

                getApiErrorMessage(
                    data,
                    response.status
                )

            );

        }


        console.log(
            "API Response:",
            response.status,
            data
        );


        return data;

    } catch (error) {

        console.error(
            "API Request Error:",
            error
        );

        throw error;

    }

}


/* ==========================================================
   API ERROR MESSAGE
========================================================== */

function getApiErrorMessage(
    data,
    status
) {

    if (!data) {

        return (
            "Request failed with status " +
            status
        );
    }


    if (
        typeof data === "object" &&
        data !== null
    ) {

        if (data.message) {

            return String(
                data.message
            );
        }


        if (data.error) {

            return String(
                data.error
            );
        }


        if (data.errors) {

            if (
                Array.isArray(
                    data.errors
                )
            ) {

                return data.errors.join(
                    "\n"
                );
            }


            if (
                typeof data.errors ===
                "object"
            ) {

                return Object.values(
                    data.errors
                ).join(
                    "\n"
                );
            }
        }
    }


    if (
        typeof data === "string"
    ) {

        return data;
    }


    return (
        "Request failed with status " +
        status
    );
}


/* ==========================================================
   ==========================================================
   AGENCY API
   ==========================================================
========================================================== */


/* ==========================================================
   GET ALL AGENCIES
========================================================== */

async function getAgencies() {

    return await apiRequest(
        "/agencies"
    );
}


/* ==========================================================
   GET AGENCY BY ID
========================================================== */

async function getAgencyById(
    id
) {

    return await apiRequest(

        "/agencies/" +
        encodeURIComponent(id)

    );
}


/* ==========================================================
   CREATE AGENCY
========================================================== */

async function createAgencyApi(
    agency
) {

    return await apiRequest(

        "/agencies",

        {

            method: "POST",

            body: agency

        }

    );
}


/* ==========================================================
   UPDATE AGENCY
========================================================== */

async function updateAgencyApi(
    id,
    agency
) {

    return await apiRequest(

        "/agencies/" +
        encodeURIComponent(id),

        {

            method: "PUT",

            body: agency

        }

    );
}


/* ==========================================================
   DELETE AGENCY
========================================================== */

async function deleteAgencyApi(
    id
) {

    return await apiRequest(

        "/agencies/" +
        encodeURIComponent(id),

        {

            method: "DELETE"

        }

    );
}


/* ==========================================================
   ==========================================================
   COORDINATOR API
   ==========================================================
========================================================== */


/* ==========================================================
   GET ALL COORDINATORS
========================================================== */

async function getCoordinators() {

    return await apiRequest(
        "/coordinators"
    );
}


/* ==========================================================
   GET COORDINATOR BY ID
========================================================== */

async function getCoordinatorById(
    id
) {

    return await apiRequest(

        "/coordinators/" +
        encodeURIComponent(id)

    );
}


/* ==========================================================
   CREATE COORDINATOR
========================================================== */

async function createCoordinatorApi(
    coordinator
) {

    return await apiRequest(

        "/coordinators",

        {

            method: "POST",

            body: coordinator

        }

    );
}


/* ==========================================================
   UPDATE COORDINATOR
========================================================== */

async function updateCoordinatorApi(
    id,
    coordinator
) {

    return await apiRequest(

        "/coordinators/" +
        encodeURIComponent(id),

        {

            method: "PUT",

            body: coordinator

        }

    );
}


/* ==========================================================
   DELETE COORDINATOR
========================================================== */

async function deleteCoordinatorApi(
    id
) {

    return await apiRequest(

        "/coordinators/" +
        encodeURIComponent(id),

        {

            method: "DELETE"

        }

    );
}


/* ==========================================================
   ==========================================================
   BATCH API
   ==========================================================
========================================================== */


/* ==========================================================
   GET ALL BATCHES
========================================================== */

async function getBatches() {

    return await apiRequest(
        "/batches"
    );
}


/* ==========================================================
   GET BATCH BY ID
========================================================== */

async function getBatchById(
    id
) {

    return await apiRequest(

        "/batches/" +
        encodeURIComponent(id)

    );
}


/* ==========================================================
   CREATE BATCH
========================================================== */

async function createBatchApi(
    batch
) {

    return await apiRequest(

        "/batches",

        {

            method: "POST",

            body: batch

        }

    );
}


/* ==========================================================
   BACKWARD COMPATIBILITY
========================================================== */

async function createBatch(
    batch
) {

    return await createBatchApi(
        batch
    );
}


/* ==========================================================
   UPDATE BATCH
========================================================== */

async function updateBatchApi(
    id,
    batch
) {

    return await apiRequest(

        "/batches/" +
        encodeURIComponent(id),

        {

            method: "PUT",

            body: batch

        }

    );
}


/* ==========================================================
   DELETE BATCH
========================================================== */

async function deleteBatchApi(
    id
) {

    return await apiRequest(

        "/batches/" +
        encodeURIComponent(id),

        {

            method: "DELETE"

        }

    );
}


/* ==========================================================
   ==========================================================
   AUTHENTICATION API
   ==========================================================
========================================================== */


/* ==========================================================
   LOGIN
========================================================== */

async function loginUserApi(
    username,
    password
) {

    if (
        username === null ||
        username === undefined ||
        username.trim() === ""
    ) {

        throw new Error(
            "Username is required."
        );
    }


    if (
        password === null ||
        password === undefined ||
        password === ""
    ) {

        throw new Error(
            "Password is required."
        );
    }


    return await apiRequest(

        "/auth/login",

        {

            method: "POST",

            body: {

                username:
                    username.trim(),

                password:
                    password

            }

        }

    );
}


/* ==========================================================
   LOGOUT
========================================================== */

async function logoutUserApi() {

    return await apiRequest(

        "/auth/logout",

        {

            method: "POST"

        }

    );
}


/* ==========================================================
   ==========================================================
   ROTATION API
   ==========================================================
========================================================== */


/* ==========================================================
   GET ALL ROTATIONS
========================================================== */

async function getRotations() {

    return await apiRequest(
        "/rotations"
    );
}


/* ==========================================================
   GET ROTATION BY ID
========================================================== */

async function getRotationById(
    id
) {

    return await apiRequest(

        "/rotations/" +
        encodeURIComponent(id)

    );
}


/* ==========================================================
   GET ROTATION BY AGENCY ID
========================================================== */

async function getRotationByAgencyId(
    agencyId
) {

    return await apiRequest(

        "/rotations/agency/" +
        encodeURIComponent(
            agencyId
        )

    );
}


/* ==========================================================
   CREATE ROTATION
========================================================== */

async function createRotationApi(
    agencyId
) {

    if (
        agencyId === null ||
        agencyId === undefined ||
        agencyId === ""
    ) {

        throw new Error(
            "Agency ID is required."
        );
    }


    return await apiRequest(

        "/rotations/agency/" +
        encodeURIComponent(
            agencyId
        ),

        {

            method: "POST"

        }

    );
}


/* ==========================================================
   UPDATE ROTATION
========================================================== */

async function updateRotationApi(
    rotationId,
    agencyId
) {

    if (
        rotationId === null ||
        rotationId === undefined ||
        rotationId === ""
    ) {

        throw new Error(
            "Rotation ID is required."
        );
    }


    if (
        agencyId === null ||
        agencyId === undefined ||
        agencyId === ""
    ) {

        throw new Error(
            "Agency ID is required."
        );
    }


    return await apiRequest(

        "/rotations/" +
        encodeURIComponent(
            rotationId
        ) +
        "/agency/" +
        encodeURIComponent(
            agencyId
        ),

        {

            method: "PUT"

        }

    );
}


/* ==========================================================
   DELETE ROTATION
========================================================== */

async function deleteRotationApi(
    rotationId
) {

    return await apiRequest(

        "/rotations/" +
        encodeURIComponent(
            rotationId
        ),

        {

            method: "DELETE"

        }

    );
}


/* ==========================================================
   GET AGENCY BY ROTATION ORDER
========================================================== */

async function getAgencyByRotationOrderApi(
    rotationOrder
) {

    if (
        rotationOrder === null ||
        rotationOrder === undefined ||
        rotationOrder === ""
    ) {

        throw new Error(
            "Rotation order is required."
        );
    }


    return await apiRequest(

        "/rotations/order/" +
        encodeURIComponent(
            rotationOrder
        )

    );
}


/* ==========================================================
   GET NEXT ROTATION ORDER
========================================================== */

async function getNextRotationOrderApi(
    currentRotationOrder
) {

    if (
        currentRotationOrder === null ||
        currentRotationOrder === undefined ||
        currentRotationOrder === ""
    ) {

        throw new Error(
            "Current rotation order is required."
        );
    }


    return await apiRequest(

        "/rotations/next/" +
        encodeURIComponent(
            currentRotationOrder
        )

    );
}


/* ==========================================================
   GET CURRENT ACTIVE AGENCY
========================================================== */

async function getCurrentActiveAgencyApi() {

    return await apiRequest(
        "/rotations/current-agency"
    );
}


/* ==========================================================
   GET CURRENT ACTIVE COORDINATOR
========================================================== */

async function getCurrentActiveCoordinatorApi() {

    return await apiRequest(
        "/rotations/current-coordinator"
    );
}


/* ==========================================================
   GET CURRENT ACTIVE MANAGEMENT DATA
========================================================== */

async function getCurrentActiveManagementDataApi() {

    var results =
        await Promise.all([

            getCurrentActiveAgencyApi(),

            getCurrentActiveCoordinatorApi()

        ]);


    return {

        agency:
            results[0],

        coordinator:
            results[1]

    };
}


/* ==========================================================
   ==========================================================
   REPORT SUPPORT
   ==========================================================
========================================================== */

/*
 * Reports are generated on the frontend.
 *
 * No dedicated report API.
 */


/* ==========================================================
   CHECK API CONNECTION
========================================================== */

async function checkApiConnection() {

    try {

        await getAgencies();

        console.log(
            "Backend API connection successful."
        );

        return true;

    } catch (error) {

        console.error(
            "Backend API connection failed:",
            error.message
        );

        return false;
    }
}


/* ==========================================================
   SAFE ARRAY
========================================================== */

function apiArray(
    data
) {

    return Array.isArray(data)
        ? data
        : [];
}


/* ==========================================================
   SAFE NUMBER
========================================================== */

function apiNumber(
    value
) {

    var number =
        Number(value);

    return isNaN(number)
        ? null
        : number;
}
