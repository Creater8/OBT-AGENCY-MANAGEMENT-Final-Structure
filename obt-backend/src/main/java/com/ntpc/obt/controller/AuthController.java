package com.ntpc.obt.controller;

import com.ntpc.obt.dto.LoginRequest;
import com.ntpc.obt.dto.LoginResponse;
import com.ntpc.obt.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


/*
 * ==========================================================
 * AUTHENTICATION CONTROLLER
 * OBT AGENCY MANAGEMENT SYSTEM
 * ==========================================================
 *
 * Authentication:
 *
 *     HTTP SESSION
 *
 * JWT:
 *
 *     NOT USED
 *
 * Login:
 *
 *     POST /api/auth/login
 *
 * ==========================================================
 */

@RestController
@RequestMapping("/api/auth")

@CrossOrigin(
        origins = {
                "http://127.0.0.1:5500",
                "http://localhost:5500"
        },
        allowCredentials = "true"
)

public class AuthController {


    /*
     * ==========================================================
     * AUTH SERVICE
     * ==========================================================
     */

    private final AuthService authService;


    /*
     * ==========================================================
     * AUTHENTICATION MANAGER
     * ==========================================================
     */

    private final AuthenticationManager authenticationManager;


    /*
     * ==========================================================
     * SECURITY CONTEXT REPOSITORY
     * ==========================================================
     */

    private final SecurityContextRepository securityContextRepository;


    /*
     * ==========================================================
     * CONSTRUCTOR
     * ==========================================================
     */

    public AuthController(
            AuthService authService,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository
    ) {

        this.authService =
                authService;

        this.authenticationManager =
                authenticationManager;

        this.securityContextRepository =
                securityContextRepository;
    }
    


    /*
     * ==========================================================
     * LOGIN
     * ==========================================================
     *
     * POST /api/auth/login
     *
     * ==========================================================
     */

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(

            @Valid
            @RequestBody
            LoginRequest loginRequest,

            HttpServletRequest request,

            HttpServletResponse response

    ) {


        /*
         * ------------------------------------------------------
         * BASIC VALIDATION
         * ------------------------------------------------------
         */

        if (loginRequest.getUsername() == null ||
                loginRequest.getUsername().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Username is required."
            );
        }


        if (loginRequest.getPassword() == null ||
                loginRequest.getPassword().isEmpty()) {

            throw new IllegalArgumentException(
                    "Password is required."
            );
        }


        /*
         * ------------------------------------------------------
         * AUTHENTICATE USER
         * ------------------------------------------------------
         *
         * Spring Security will use the configured
         * AuthenticationProvider / UserDetailsService and
         * PasswordEncoder.
         *
         * ------------------------------------------------------
         */

        Authentication authentication =
                authenticationManager.authenticate(

                        new UsernamePasswordAuthenticationToken(

                                loginRequest
                                        .getUsername()
                                        .trim(),

                                loginRequest
                                        .getPassword()
                        )
                );


        /*
         * ------------------------------------------------------
         * CREATE SECURITY CONTEXT
         * ------------------------------------------------------
         */

        SecurityContext context =
                SecurityContextHolder
                        .createEmptyContext();


        /*
         * ------------------------------------------------------
         * SET AUTHENTICATION
         * ------------------------------------------------------
         */

        context.setAuthentication(
                authentication
        );


        /*
         * ------------------------------------------------------
         * SET SECURITY CONTEXT HOLDER
         * ------------------------------------------------------
         */

        SecurityContextHolder.setContext(
                context
        );


        /*
         * ------------------------------------------------------
         * SAVE SECURITY CONTEXT TO HTTP SESSION
         * ------------------------------------------------------
         */

        securityContextRepository.saveContext(
                context,
                request,
                response
        );


        /*
         * ------------------------------------------------------
         * CREATE APPLICATION LOGIN RESPONSE
         * ------------------------------------------------------
         *
         * AuthService is responsible for constructing the
         * LoginResponse.
         *
         * It should NOT perform another password authentication.
         *
         * ------------------------------------------------------
         */

        LoginResponse loginResponse =
                authService.login(
                        loginRequest
                );


        /*
         * ------------------------------------------------------
         * RETURN LOGIN RESPONSE
         * ------------------------------------------------------
         */

        return ResponseEntity.ok(
                loginResponse
        );
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {

        SecurityContextHolder.clearContext();

        var session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.noContent().build();
    }
}