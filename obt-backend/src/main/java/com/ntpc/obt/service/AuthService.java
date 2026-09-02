package com.ntpc.obt.service;

import com.ntpc.obt.dto.LoginRequest;
import com.ntpc.obt.dto.LoginResponse;
import com.ntpc.obt.entity.User;
import com.ntpc.obt.repository.UserRepository;

import org.springframework.stereotype.Service;

/*
 * ==========================================================
 * AUTHENTICATION SERVICE
 * OBT AGENCY MANAGEMENT SYSTEM
 * ==========================================================
 *
 * Authentication:
 *
 *     Spring Security
 *     AuthenticationManager
 *     BCryptPasswordEncoder
 *     HTTP Session
 *
 * JWT:
 *
 *     NOT USED
 *
 * Responsibilities:
 *
 * 1. Find the application user.
 * 2. Verify that the user account is ACTIVE.
 * 3. Create LoginResponse.
 *
 * Password authentication itself is handled by
 * Spring Security AuthenticationManager.
 *
 * ==========================================================
 */

@Service
public class AuthService {

    /*
     * ==========================================================
     * USER REPOSITORY
     * ==========================================================
     */

    private final UserRepository userRepository;


    /*
     * ==========================================================
     * CONSTRUCTOR
     * ==========================================================
     */

    public AuthService(
            UserRepository userRepository
    ) {

        this.userRepository =
                userRepository;
    }


    /*
     * ==========================================================
     * LOGIN RESPONSE
     * ==========================================================
     *
     * Authentication has already been performed by
     * AuthenticationManager in AuthController.
     *
     * This method only loads the application user and
     * prepares the response.
     *
     * ==========================================================
     */

    public LoginResponse login(
            LoginRequest loginRequest
    ) {

        /*
         * ------------------------------------------------------
         * VALIDATE REQUEST
         * ------------------------------------------------------
         */

        if (loginRequest == null) {

            throw new IllegalArgumentException(
                    "Login request is required."
            );
        }


        /*
         * ------------------------------------------------------
         * VALIDATE USERNAME
         * ------------------------------------------------------
         */

        if (
                loginRequest.getUsername() == null
                ||
                loginRequest.getUsername().trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Username is required."
            );
        }


        /*
         * ------------------------------------------------------
         * CLEAN USERNAME
         * ------------------------------------------------------
         */

        String username =
                loginRequest
                        .getUsername()
                        .trim();


        /*
         * ------------------------------------------------------
         * FIND USER
         * ------------------------------------------------------
         */

        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Invalid username or password."
                                        )
                        );


        /*
         * ------------------------------------------------------
         * VERIFY ACCOUNT STATUS
         * ------------------------------------------------------
         */

        if (
                user.getStatus() == null
                ||
                !user.getStatus()
                        .equalsIgnoreCase("ACTIVE")
        ) {

            throw new IllegalArgumentException(
                    "User account is inactive."
            );
        }


        /*
         * ------------------------------------------------------
         * CREATE LOGIN RESPONSE
         * ------------------------------------------------------
         */

        return createLoginResponse(user);
    }


    /*
     * ==========================================================
     * CREATE LOGIN RESPONSE
     * ==========================================================
     */

    private LoginResponse createLoginResponse(
            User user
    ) {

        LoginResponse response =
                new LoginResponse();


        /*
         * ------------------------------------------------------
         * USER ID
         * ------------------------------------------------------
         */

        response.setId(
                user.getId()
        );


        /*
         * ------------------------------------------------------
         * USERNAME
         * ------------------------------------------------------
         */

        response.setUsername(
                user.getUsername()
        );


        /*
         * ------------------------------------------------------
         * NAME
         * ------------------------------------------------------
         */

        response.setName(
                user.getName()
        );


        /*
         * ------------------------------------------------------
         * EMAIL
         * ------------------------------------------------------
         */

        response.setEmail(
                user.getEmail()
        );


        /*
         * ------------------------------------------------------
         * ROLE
         * ------------------------------------------------------
         */

        response.setRole(
                user.getRole()
        );


        /*
         * ------------------------------------------------------
         * STATUS
         * ------------------------------------------------------
         */

        response.setStatus(
                user.getStatus()
        );


        return response;
    }
}