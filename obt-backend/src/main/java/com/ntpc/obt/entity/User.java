package com.ntpc.obt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_users_username",
            columnNames = "username"
        )
    }
)
public class User {

    /* ==========================================================
       ID
    ========================================================== */

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    /* ==========================================================
       USERNAME
    ========================================================== */

    @NotBlank(message = "Username is required.")
    @Column(
        nullable = false,
        unique = true,
        length = 50
    )
    private String username;


    /* ==========================================================
       PASSWORD
    ========================================================== */

    @NotBlank(message = "Password is required.")
    @Column(
        nullable = false,
        length = 255
    )
    private String password;


    /* ==========================================================
       NAME
    ========================================================== */

    @NotBlank(message = "Name is required.")
    @Column(
        nullable = false,
        length = 100
    )
    private String name;


    /* ==========================================================
       EMAIL
    ========================================================== */

    @Email(message = "Please provide a valid email address.")
    @Column(
        length = 150
    )
    private String email;


    /* ==========================================================
       ROLE
    ========================================================== */

    @NotBlank(message = "Role is required.")
    @Column(
        nullable = false,
        length = 50
    )
    private String role;


    /* ==========================================================
       STATUS
    ========================================================== */

    @NotBlank(message = "Status is required.")
    @Column(
        nullable = false,
        length = 20
    )
    private String status;


    /* ==========================================================
       DEFAULT CONSTRUCTOR
    ========================================================== */

    public User() {
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
       GETTER / SETTER - PASSWORD
    ========================================================== */

    public String getPassword() {

        return password;
    }


    public void setPassword(String password) {

        this.password = password;
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