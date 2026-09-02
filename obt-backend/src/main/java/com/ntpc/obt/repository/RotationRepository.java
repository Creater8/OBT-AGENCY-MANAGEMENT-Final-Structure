package com.ntpc.obt.repository;

import com.ntpc.obt.entity.Rotation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RotationRepository
        extends JpaRepository<Rotation, Long> {

    /*
     * ======================================================
     * FIND ROTATIONS IN FIXED ORDER
     * ======================================================
     *
     * Returns all rotations according to their explicitly
     * assigned rotationOrder.
     *
     * Example:
     *
     * Agency A -> 1
     * Agency B -> 2
     * Agency C -> 3
     * Agency D -> 4
     * Agency E -> 5
     *
     * Result:
     *
     * 1
     * 2
     * 3
     * 4
     * 5
     */
    List<Rotation> findAllByOrderByRotationOrderAsc();


    /*
     * ======================================================
     * FIND BY ROTATION ORDER
     * ======================================================
     *
     * Finds the Agency assigned to a particular
     * rotation position.
     *
     * Example:
     *
     * rotationOrder = 3
     *
     * returns the Rotation occupying position 3.
     */
    Optional<Rotation> findByRotationOrder(
            Integer rotationOrder
    );


    /*
     * ======================================================
     * FIND BY AGENCY
     * ======================================================
     *
     * Finds the Rotation belonging to one specific Agency.
     *
     * Because the Rotation entity uses:
     *
     * unique = true
     *
     * on agency_id, one Agency can have only one Rotation.
     */
    Optional<Rotation> findByAgencyId(
            Long agencyId
    );
}