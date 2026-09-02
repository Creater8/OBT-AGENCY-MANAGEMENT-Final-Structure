package com.ntpc.obt.repository;

import com.ntpc.obt.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/*
 * ==========================================================
 * USER REPOSITORY
 * OBT AGENCY MANAGEMENT SYSTEM
 * ==========================================================
 */

public interface UserRepository
        extends JpaRepository<User, Long> {


    /*
     * ==========================================================
     * FIND USER BY USERNAME
     * ==========================================================
     */

    Optional<User> findByUsername(String username);

}