package com.ntpc.obt.service;

import com.ntpc.obt.entity.Agency;
import com.ntpc.obt.entity.Coordinator;
import com.ntpc.obt.entity.Rotation;
import com.ntpc.obt.exception.ConflictException;
import com.ntpc.obt.repository.AgencyRepository;
import com.ntpc.obt.repository.CoordinatorRepository;
import com.ntpc.obt.repository.RotationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RotationService {

    private final RotationRepository rotationRepository;
    private final AgencyRepository agencyRepository;
    private final CoordinatorRepository coordinatorRepository;

    public RotationService(
            RotationRepository rotationRepository,
            AgencyRepository agencyRepository,
            CoordinatorRepository coordinatorRepository
    ) {
        this.rotationRepository = rotationRepository;
        this.agencyRepository = agencyRepository;
        this.coordinatorRepository = coordinatorRepository;
    }

    /*
     * ======================================================
     * GET ALL ROTATIONS
     * ======================================================
     *
     * Always return rotations according to their backend
     * rotation order.
     */
    @Transactional(readOnly = true)
    public List<Rotation> getAllRotations() {

        return rotationRepository
                .findAllByOrderByRotationOrderAsc();
    }

    /*
     * ======================================================
     * GET ROTATION BY ID
     * ======================================================
     */
    @Transactional(readOnly = true)
    public Rotation getRotationById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Rotation ID cannot be null."
            );
        }

        return rotationRepository
                .findById(id)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Rotation not found with ID: " + id
                        )
                );
    }

    /*
     * ======================================================
     * GET ROTATION BY AGENCY ID
     * ======================================================
     */
    @Transactional(readOnly = true)
    public Rotation getRotationByAgencyId(Long agencyId) {

        if (agencyId == null) {
            throw new IllegalArgumentException(
                    "Agency ID cannot be null."
            );
        }

        return rotationRepository
                .findByAgencyId(agencyId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Rotation not found for Agency ID: "
                                        + agencyId
                        )
                );
    }

    /*
     * ======================================================
     * GET ROTATION BY ORDER
     * ======================================================
     */
    @Transactional(readOnly = true)
    public Rotation getRotationByOrder(
            Integer rotationOrder
    ) {

        if (rotationOrder == null) {
            throw new IllegalArgumentException(
                    "Rotation order cannot be null."
            );
        }

        return rotationRepository
                .findByRotationOrder(rotationOrder)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Rotation not found for rotation order: "
                                        + rotationOrder
                        )
                );
    }

    /*
     * ======================================================
     * CREATE ROTATION
     * ======================================================
     *
     * If rotationOrder is supplied:
     *      use the supplied order.
     *
     * If rotationOrder is null:
     *      automatically assign the next available order.
     *
     * There is NO 1-5 restriction.
     */
    public Rotation createRotation(
            Long agencyId,
            Integer rotationOrder
    ) {

        if (agencyId == null) {
            throw new IllegalArgumentException(
                    "Agency ID cannot be null."
            );
        }

        Agency agency =
                agencyRepository
                        .findById(agencyId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Agency not found with ID: "
                                                + agencyId
                                )
                        );

        /*
         * One Agency can have only one Rotation.
         */
        if (
                rotationRepository
                        .findByAgencyId(agencyId)
                        .isPresent()
        ) {

            throw new ConflictException(
                    "Agency already has a rotation."
            );
        }

        /*
         * Backend automatically determines the order
         * when one is not supplied.
         */
        if (rotationOrder == null) {

            rotationOrder =
                    getNextAutomaticRotationOrder();
        }

        /*
         * Rotation order must be a positive whole number.
         *
         * There is NO maximum.
         */
        if (rotationOrder <= 0) {

            throw new IllegalArgumentException(
                    "Rotation order must be a positive whole number."
            );
        }

        /*
         * Rotation order must be unique.
         */
        if (
                rotationRepository
                        .findByRotationOrder(rotationOrder)
                        .isPresent()
        ) {

            throw new ConflictException(
                    "Rotation order "
                            + rotationOrder
                            + " is already assigned."
            );
        }

        Rotation rotation =
                new Rotation(
                        agency,
                        rotationOrder
                );

        return rotationRepository.save(rotation);
    }

    /*
     * ======================================================
     * UPDATE ROTATION
     * ======================================================
     */
    public Rotation updateRotation(
            Long id,
            Long agencyId,
            Integer rotationOrder
    ) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Rotation ID cannot be null."
            );
        }

        if (agencyId == null) {
            throw new IllegalArgumentException(
                    "Agency ID cannot be null."
            );
        }

        if (rotationOrder == null) {
            throw new IllegalArgumentException(
                    "Rotation order cannot be null."
            );
        }

        if (rotationOrder <= 0) {
            throw new IllegalArgumentException(
                    "Rotation order must be a positive whole number."
            );
        }

        Rotation rotation =
                rotationRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Rotation not found with ID: "
                                                + id
                                )
                        );

        Agency agency =
                agencyRepository
                        .findById(agencyId)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Agency not found with ID: "
                                                + agencyId
                                )
                        );

        /*
         * If another Rotation already owns this order,
         * do not allow duplicate rotation orders.
         */
        Optional<Rotation> existing =
                rotationRepository
                        .findByRotationOrder(rotationOrder);

        if (
                existing.isPresent()
                        &&
                !existing.get()
                        .getId()
                        .equals(id)
        ) {

            throw new ConflictException(
                    "Rotation order "
                            + rotationOrder
                            + " is already assigned."
            );
        }

        rotation.setAgency(agency);
        rotation.setRotationOrder(rotationOrder);

        return rotationRepository.save(rotation);
    }

    /*
     * ======================================================
     * DELETE ROTATION
     * ======================================================
     */
    public void deleteRotation(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Rotation ID cannot be null."
            );
        }

        Rotation rotation =
                rotationRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Rotation not found with ID: "
                                                + id
                                )
                        );

        rotationRepository.delete(rotation);
    }

    /*
     * ======================================================
     * GET CURRENT ROTATION AGENCY
     * ======================================================
     *
     * THIS IS THE MAIN ROTATION LOGIC.
     *
     * The Coordinator's:
     *
     *      startDate
     *      endDate
     *
     * determine the actual active period.
     *
     * The Agency itself does NOT contain dates.
     *
     * Logic:
     *
     * 1. Find an agency whose coordinator is currently active.
     *
     * 2. If no agency is currently active,
     *    find the next future agency.
     *
     * 3. If there is no future agency,
     *    restart from the lowest rotation order.
     */
    @Transactional(readOnly = true)
    public Agency getCurrentRotationAgency() {

        LocalDate today =
                LocalDate.now();

        List<Rotation> rotations =
                rotationRepository
                        .findAllByOrderByRotationOrderAsc();

        if (
                rotations == null
                        ||
                rotations.isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "No rotation agencies are configured."
            );
        }

        /*
         * ==================================================
         * STEP 1
         * FIND CURRENTLY ACTIVE AGENCY
         * ==================================================
         *
         * Current means:
         *
         * startDate <= today <= endDate
         */
        List<Rotation> currentRotations =
                new ArrayList<>();

        for (Rotation rotation : rotations) {

            if (rotation == null) {
                continue;
            }

            Agency agency =
                    rotation.getAgency();

            if (agency == null) {
                continue;
            }

            Long agencyId =
                    agency.getId();

            if (agencyId == null) {
                continue;
            }

            Optional<Coordinator> coordinatorOptional =
                    coordinatorRepository
                            .findByAgencyId(agencyId);

            if (coordinatorOptional.isEmpty()) {
                continue;
            }

            Coordinator coordinator =
                    coordinatorOptional.get();

            LocalDate startDate =
                    coordinator.getStartDate();

            LocalDate endDate =
                    coordinator.getEndDate();

            if (
                    startDate == null
                            ||
                    endDate == null
            ) {
                continue;
            }

            /*
             * Ignore invalid date ranges.
             */
            if (endDate.isBefore(startDate)) {
                continue;
            }

            /*
             * Agency is currently active.
             */
            boolean active =
                    !today.isBefore(startDate)
                            &&
                    !today.isAfter(endDate);

            if (active) {

                currentRotations.add(rotation);
            }
        }

        /*
         * If multiple records somehow qualify,
         * backend rotation order remains the authority.
         */
        if (!currentRotations.isEmpty()) {

            currentRotations.sort(
                    Comparator.comparing(
                            Rotation::getRotationOrder
                    )
            );

            return currentRotations
                    .get(0)
                    .getAgency();
        }

        /*
         * ==================================================
         * STEP 2
         * FIND NEXT FUTURE AGENCY
         * ==================================================
         *
         * Future means:
         *
         * startDate > today
         *
         * The nearest upcoming start date wins.
         *
         * If two agencies have the same start date,
         * rotationOrder decides.
         */
        List<RotationWithDate> futureRotations =
                new ArrayList<>();

        for (Rotation rotation : rotations) {

            if (rotation == null) {
                continue;
            }

            Agency agency =
                    rotation.getAgency();

            if (agency == null) {
                continue;
            }

            Long agencyId =
                    agency.getId();

            if (agencyId == null) {
                continue;
            }

            Optional<Coordinator> coordinatorOptional =
                    coordinatorRepository
                            .findByAgencyId(agencyId);

            if (coordinatorOptional.isEmpty()) {
                continue;
            }

            Coordinator coordinator =
                    coordinatorOptional.get();

            LocalDate startDate =
                    coordinator.getStartDate();

            LocalDate endDate =
                    coordinator.getEndDate();

            if (
                    startDate == null
                            ||
                    endDate == null
            ) {
                continue;
            }

            if (endDate.isBefore(startDate)) {
                continue;
            }

            /*
             * Future agency.
             */
            if (startDate.isAfter(today)) {

                futureRotations.add(
                        new RotationWithDate(
                                rotation,
                                startDate
                        )
                );
            }
        }

        /*
         * Select nearest future start date.
         *
         * If dates are equal, lower rotation order wins.
         */
        if (!futureRotations.isEmpty()) {

            futureRotations.sort(
                    Comparator
                            .comparing(
                                    RotationWithDate::getStartDate
                            )
                            .thenComparing(
                                    item ->
                                            item.getRotation()
                                                    .getRotationOrder()
                            )
            );

            return futureRotations
                    .get(0)
                    .getRotation()
                    .getAgency();
        }

        /*
         * ==================================================
         * STEP 3
         * ROTATION ROLLOVER
         * ==================================================
         *
         * No currently active agency.
         *
         * No future agency.
         *
         * Therefore every configured coordinator period
         * has already ended.
         *
         * Start the cycle again from the FIRST agency
         * according to backend rotation order.
         */
        rotations.sort(
                Comparator.comparing(
                        Rotation::getRotationOrder
                )
        );

        for (Rotation rotation : rotations) {

            if (rotation == null) {
                continue;
            }

            if (rotation.getAgency() == null) {
                continue;
            }

            return rotation.getAgency();
        }

        throw new IllegalArgumentException(
                "No valid agency is available for rotation."
        );
    }

    /*
     * ======================================================
     * GET CURRENT ROTATION COORDINATOR
     * ======================================================
     *
     * Convenience method for dashboard.
     *
     * The dashboard can use this result to display:
     *
     *      Agency
     *      Coordinator
     *      Start Date
     *      End Date
     */
    @Transactional(readOnly = true)
    public Coordinator getCurrentRotationCoordinator() {

        Agency agency =
                getCurrentRotationAgency();

        if (agency == null) {

            throw new IllegalArgumentException(
                    "No current rotation agency found."
            );
        }

        Long agencyId =
                agency.getId();

        if (agencyId == null) {

            throw new IllegalArgumentException(
                    "Current rotation agency has no ID."
            );
        }

        return coordinatorRepository
                .findByAgencyId(agencyId)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "No coordinator found for current rotation agency."
                        )
                );
    }

    /*
     * ======================================================
     * GET NEXT AUTOMATIC ROTATION ORDER
     * ======================================================
     *
     * Existing:
     *
     * 1, 2, 3 -> 4
     *
     * 1, 2, 5 -> 6
     *
     * 10, 25 -> 26
     *
     * There is NO maximum.
     */
    private Integer getNextAutomaticRotationOrder() {

        List<Rotation> rotations =
                rotationRepository
                        .findAllByOrderByRotationOrderAsc();

        if (
                rotations == null
                        ||
                rotations.isEmpty()
        ) {

            return 1;
        }

        int highestOrder = 0;

        for (Rotation rotation : rotations) {

            if (rotation == null) {
                continue;
            }

            Integer order =
                    rotation.getRotationOrder();

            if (order == null) {
                continue;
            }

            if (order > highestOrder) {
                highestOrder = order;
            }
        }

        return highestOrder + 1;
    }

    /*
     * ======================================================
     * VALIDATE COORDINATOR DATES
     * ======================================================
     */
    private void validateCoordinatorDates(
            Coordinator coordinator
    ) {

        if (coordinator == null) {

            throw new IllegalArgumentException(
                    "Coordinator cannot be null."
            );
        }

        if (
                coordinator.getStartDate() == null
                        ||
                coordinator.getEndDate() == null
        ) {

            throw new IllegalArgumentException(
                    "Coordinator Start Date and End Date are required."
            );
        }

        if (
                coordinator.getEndDate()
                        .isBefore(
                                coordinator.getStartDate()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Coordinator End Date cannot be earlier than Start Date."
            );
        }
    }

    /*
     * ======================================================
     * CHECK AGENCY DATE OVERLAP
     * ======================================================
     *
     * Agency periods MUST NOT overlap.
     */
    private void validateNoAgencyDateOverlap(
            Long agencyId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        List<Coordinator> coordinators =
                coordinatorRepository.findAll();

        if (
                coordinators == null
                        ||
                coordinators.isEmpty()
        ) {

            return;
        }

        for (
                Coordinator existingCoordinator :
                coordinators
        ) {

            if (existingCoordinator == null) {
                continue;
            }

            if (
                    existingCoordinator.getAgency() == null
                            ||
                    existingCoordinator
                            .getAgency()
                            .getId() == null
            ) {

                continue;
            }

            /*
             * Ignore the same Agency.
             */
            if (
                    existingCoordinator
                            .getAgency()
                            .getId()
                            .equals(agencyId)
            ) {

                continue;
            }

            LocalDate existingStart =
                    existingCoordinator.getStartDate();

            LocalDate existingEnd =
                    existingCoordinator.getEndDate();

            if (
                    existingStart == null
                            ||
                    existingEnd == null
            ) {

                continue;
            }

            /*
             * Two ranges overlap when:
             *
             * start1 <= end2
             *
             * AND
             *
             * end1 >= start2
             */
            boolean overlaps =
                    !startDate.isAfter(existingEnd)
                            &&
                    !endDate.isBefore(existingStart);

            if (overlaps) {

                throw new ConflictException(
                        "Agency date range overlaps with Agency ID "
                                +
                                existingCoordinator
                                        .getAgency()
                                        .getId()
                                +
                                ". Agencies cannot have overlapping active periods."
                );
            }
        }
    }

    /*
     * ======================================================
     * INTERNAL FUTURE ROTATION HOLDER
     * ======================================================
     */
    private static class RotationWithDate {

        private final Rotation rotation;
        private final LocalDate startDate;

        private RotationWithDate(
                Rotation rotation,
                LocalDate startDate
        ) {
            this.rotation = rotation;
            this.startDate = startDate;
        }

        private Rotation getRotation() {
            return rotation;
        }

        private LocalDate getStartDate() {
            return startDate;
        }
    }
}