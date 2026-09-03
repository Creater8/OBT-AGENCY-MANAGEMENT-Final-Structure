package com.ntpc.obt.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    /*
     * ==========================================================
     * PASSWORD ENCODER
     * ==========================================================
     *
     * Passwords are stored using BCrypt.
     *
     * ==========================================================
     */

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    /*
     * ==========================================================
     * AUTHENTICATION MANAGER
     * ==========================================================
     *
     * AuthController uses this bean to authenticate
     * username + password.
     *
     * ==========================================================
     */

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {

        return authenticationConfiguration
                .getAuthenticationManager();
    }


    /*
     * ==========================================================
     * SECURITY CONTEXT REPOSITORY
     * ==========================================================
     *
     * Stores the authenticated SecurityContext in the
     * HTTP session.
     *
     * This is required because login is performed manually
     * inside AuthController.
     *
     * ==========================================================
     */

    @Bean
    public SecurityContextRepository securityContextRepository() {

        return new HttpSessionSecurityContextRepository();
    }


    /*
     * ==========================================================
     * SECURITY FILTER CHAIN
     * ==========================================================
     */

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository
    ) throws Exception {

        http

            /*
             * ==================================================
             * CORS
             * ==================================================
             */

            .cors(cors -> cors
                    .configurationSource(
                            corsConfigurationSource()
                    )
            )


            /*
             * ==================================================
             * CSRF
             * ==================================================
             *
             * Disabled for the current frontend/backend
             * development setup.
             *
             * ==================================================
             */

            .csrf(csrf -> csrf.disable())


            /*
             * ==================================================
             * SECURITY CONTEXT
             * ==================================================
             *
             * Persist authentication in HTTP session.
             *
             * AuthController explicitly calls:
             *
             * securityContextRepository.saveContext(...)
             *
             * ==================================================
             */

            .securityContext(securityContext -> securityContext
                    .securityContextRepository(
                            securityContextRepository
                    )
            )


            /*
             * ==================================================
             * AUTHORIZATION
             * ==================================================
             */

            .authorizeHttpRequests(auth -> auth

                    /*
                     * ------------------------------------------
                     * LOGIN
                     * ------------------------------------------
                     *
                     * Login must be accessible before the user
                     * has an authenticated session.
                     */

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/auth/login"
                    ).permitAll()


                    /*
                     * ------------------------------------------
                     * LOGOUT
                     * ------------------------------------------
                     */

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/auth/logout"
                    ).permitAll()


                    /*
                     * ------------------------------------------
                     * OTHER AUTH ENDPOINTS
                     * ------------------------------------------
                     */

                    .requestMatchers(
                            "/api/auth/**"
                    ).permitAll()


                    /*
                     * ------------------------------------------
                     * ALL API ENDPOINTS
                     * ------------------------------------------
                     *
                     * Agencies
                     * Coordinators
                     * Batches
                     * Rotations
                     *
                     * require an authenticated session.
                     */

                    .requestMatchers(
                            "/api/**"
                    ).authenticated()


                    /*
                     * ------------------------------------------
                     * NON-API REQUESTS
                     * ------------------------------------------
                     */

                    .anyRequest().permitAll()
            )


            /*
             * ==================================================
             * HTTP SESSION
             * ==================================================
             */

            .sessionManagement(session -> session

                    .sessionCreationPolicy(
                            SessionCreationPolicy.IF_REQUIRED
                    )
            );


        return http.build();
    }


    /*
     * ==========================================================
     * CORS CONFIGURATION
     * ==========================================================
     *
     * Frontend:
     *
     * http://localhost:5500
     * http://127.0.0.1:5500
     *
     * Backend:
     *
     * http://localhost:8080
     *
     * ==========================================================
     */

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        /*
         * ======================================================
         * ALLOWED ORIGINS
         * ======================================================
         */

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5500",
                        "http://127.0.0.1:5500",
                        "https://obt-agency-management-final-structure.onrender.com"
                )
        );


        /*
         * ======================================================
         * ALLOWED METHODS
         * ======================================================
         */

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );


        /*
         * ======================================================
         * ALLOWED HEADERS
         * ======================================================
         */

        configuration.setAllowedHeaders(
                List.of(
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
        );


        /*
         * ======================================================
         * ALLOW CREDENTIALS
         * ======================================================
         *
         * Required because api.js uses:
         *
         * credentials: "include"
         *
         * ======================================================
         */

        configuration.setAllowCredentials(true);


        /*
         * ======================================================
         * REGISTER CORS CONFIGURATION
         * ======================================================
         */

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }
}
