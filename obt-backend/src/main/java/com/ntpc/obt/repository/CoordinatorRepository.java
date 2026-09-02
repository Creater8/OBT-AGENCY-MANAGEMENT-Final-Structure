package com.ntpc.obt.repository;

import com.ntpc.obt.entity.Coordinator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoordinatorRepository
        extends JpaRepository<Coordinator, Long> {

    /*
     * ======================================================
     * FIND COORDINATOR BY AGENCY
     * ======================================================
     *
     * Returns the coordinator assigned to the specified
     * Agency.
     *
     * Agency -> Coordinator is currently OneToOne.
     */
    Optional<Coordinator> findByAgencyId(Long agencyId);

    /*
     * ======================================================
     * FIND ALL COORDINATORS BY AGENCY
     * ======================================================
     *
     * This method is useful for automatic agency rotation
     * and future date-based validation.
     *
     * It does NOT assume that there are only five agencies.
     */
    List<Coordinator> findAllByAgencyId(Long agencyId);
}