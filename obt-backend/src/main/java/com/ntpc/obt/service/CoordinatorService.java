
package com.ntpc.obt.service;

import com.ntpc.obt.exception.ConflictException;
import com.ntpc.obt.entity.Agency;
import com.ntpc.obt.entity.Coordinator;
import com.ntpc.obt.repository.AgencyRepository;
import com.ntpc.obt.repository.CoordinatorRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CoordinatorService {

    private final CoordinatorRepository coordinatorRepository;
    private final AgencyRepository agencyRepository;

    public CoordinatorService(
            CoordinatorRepository coordinatorRepository,
            AgencyRepository agencyRepository) {

        this.coordinatorRepository = coordinatorRepository;
        this.agencyRepository = agencyRepository;
    }


    // ==========================================================
    // CREATE COORDINATOR
    // ==========================================================

    public Coordinator createCoordinator(Coordinator coordinator) {

        /*
         * Agency is mandatory.
         */
        if (coordinator.getAgency() == null ||
                coordinator.getAgency().getId() == null) {

            throw new RuntimeException(
                    "Agency is required"
            );
        }


        /*
         * Get the Agency ID supplied by frontend/Postman.
         */
        Long agencyId =
                coordinator.getAgency().getId();


        /*
         * Find the actual Agency from database.
         */
        Agency agency =
                agencyRepository.findById(agencyId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Agency not found with id: "
                                                + agencyId
                                )
                        );


        /*
         * One Agency can have only one Coordinator.
         */
        Optional<Coordinator> existingCoordinator =
                coordinatorRepository.findByAgencyId(agencyId);


        if (existingCoordinator.isPresent()) {

            throw new ConflictException(
                    "Agency already has a coordinator"
            );
        }


        /*
         * Attach the managed Agency entity.
         */
        coordinator.setAgency(agency);


        /*
         * Save Coordinator.
         *
         * startDate and endDate are now
         * automatically persisted by JPA.
         */
        return coordinatorRepository.save(
                coordinator
        );
    }


    // ==========================================================
    // GET ALL COORDINATORS
    // ==========================================================

    public List<Coordinator> getAllCoordinators() {

        return coordinatorRepository.findAll();
    }


    // ==========================================================
    // GET COORDINATOR BY ID
    // ==========================================================

    public Optional<Coordinator> getCoordinatorById(
            Long id) {

        return coordinatorRepository.findById(id);
    }


    // ==========================================================
    // UPDATE COORDINATOR
    // ==========================================================

    public Coordinator updateCoordinator(
            Long id,
            Coordinator updatedCoordinator) {

        /*
         * Find existing Coordinator.
         */
        Coordinator existingCoordinator =
                coordinatorRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coordinator not found with id: "
                                                + id
                                )
                        );


        // ------------------------------------------------------
        // Validate Agency
        // ------------------------------------------------------

        if (updatedCoordinator.getAgency() == null ||
                updatedCoordinator.getAgency().getId() == null) {

            throw new RuntimeException(
                    "Agency is required"
            );
        }


        /*
         * Get new Agency ID.
         */
        Long newAgencyId =
                updatedCoordinator.getAgency().getId();


        /*
         * Find Agency from database.
         */
        Agency agency =
                agencyRepository.findById(newAgencyId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Agency not found with id: "
                                                + newAgencyId
                                )
                        );


        // ------------------------------------------------------
        // Check Agency Conflict
        // ------------------------------------------------------

        Optional<Coordinator> coordinatorUsingAgency =
                coordinatorRepository.findByAgencyId(
                        newAgencyId
                );


        /*
         * If another Coordinator already uses this Agency,
         * prevent the update.
         */
        if (coordinatorUsingAgency.isPresent()
                && !coordinatorUsingAgency
                        .get()
                        .getId()
                        .equals(id)) {

            throw new ConflictException(
                    "Agency already has a coordinator"
            );
        }


        // ------------------------------------------------------
        // Update Existing Coordinator
        // ------------------------------------------------------

        existingCoordinator.setName(
                updatedCoordinator.getName()
        );


        existingCoordinator.setAgency(
                agency
        );


        /*
         * Batch Name
         */
        existingCoordinator.setBatchName(
                updatedCoordinator.getBatchName()
        );


        /*
         * Batch Start Date
         */
        existingCoordinator.setStartDate(
                updatedCoordinator.getStartDate()
        );


        /*
         * Batch End Date
         */
        existingCoordinator.setEndDate(
                updatedCoordinator.getEndDate()
        );


        /*
         * Coordinator Designation
         */
        existingCoordinator.setDesignation(
                updatedCoordinator.getDesignation()
        );


        /*
         * Coordinator Phone
         */
        existingCoordinator.setPhone(
                updatedCoordinator.getPhone()
        );


        /*
         * Coordinator Email
         */
        existingCoordinator.setEmail(
                updatedCoordinator.getEmail()
        );


        /*
         * Coordinator Status
         */
        existingCoordinator.setStatus(
                updatedCoordinator.getStatus()
        );


        /*
         * Save updated Coordinator.
         */
        return coordinatorRepository.save(
                existingCoordinator
        );
    }


    // ==========================================================
    // DELETE COORDINATOR
    // ==========================================================

    public void deleteCoordinator(Long id) {

        /*
         * Check whether Coordinator exists.
         */
        if (!coordinatorRepository.existsById(id)) {

            throw new RuntimeException(
                    "Coordinator not found with id: "
                            + id
            );
        }


        /*
         * Delete Coordinator.
         */
        coordinatorRepository.deleteById(id);
    }
}

