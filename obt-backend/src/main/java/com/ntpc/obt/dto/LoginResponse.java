
package com.ntpc.obt.dto;

public class LoginResponse {

    /* ==========================================================
       USER ID
    ========================================================== */

    private Long id;


    /* ==========================================================
       USERNAME
    ========================================================== */

    private String username;


    /* ==========================================================
       NAME
    ========================================================== */

    private String name;


    /* ==========================================================
       EMAIL
    ========================================================== */

    private String email;


    /* ==========================================================
       ROLE
    ========================================================== */

    private String role;


    /* ==========================================================
       STATUS
    ========================================================== */

    private String status;


    /* ==========================================================
       DEFAULT CONSTRUCTOR
    ========================================================== */

    public LoginResponse() {

    }


    /* ==========================================================
       GETTER / SETTER - ID
    ========================================================== */

    public Long getId() {

        return id;

    }


    public void setId(Long id) {

        this.id = id;

    }


    /* ==========================================================
       GETTER / SETTER - USERNAME
    ========================================================== */

    public String getUsername() {

        return username;

    }


    public void setUsername(String username) {

        this.username = username;

    }


    /* ==========================================================
       GETTER / SETTER - NAME
    ========================================================== */

    public String getName() {

        return name;

    }


    public void setName(String name) {

        this.name = name;

    }


    /* ==========================================================
       GETTER / SETTER - EMAIL
    ========================================================== */

    public String getEmail() {

        return email;

    }


    public void setEmail(String email) {

        this.email = email;

    }


    /* ==========================================================
       GETTER / SETTER - ROLE
    ========================================================== */

    public String getRole() {

        return role;

    }


    public void setRole(String role) {

        this.role = role;

    }


    /* ==========================================================
       GETTER / SETTER - STATUS
    ========================================================== */

    public String getStatus() {

        return status;

    }


    public void setStatus(String status) {

        this.status = status;

    }

}

