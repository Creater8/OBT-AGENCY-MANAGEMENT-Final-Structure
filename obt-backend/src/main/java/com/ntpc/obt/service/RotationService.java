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
     * Before returning rotations, automatically process
     * any completed agency rollover.
     *
     * This is important because the dashboard calls:
     *
     * GET /api/rotations
     *
     * to obtain the rotation order.
     *
     * Therefore the dashboard must receive the already
     * updated database order.
     */

    public List<Rotation> getAllRotations() {

        performAutomaticRotationRollover();

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
     * rotationOrder is optional.
     *
     * If rotationOrder is null:
     *
     *     automatically assign the next available order.
     *
     * There is NO fixed maximum.
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
         * Automatically determine next order.
         */

        if (rotationOrder == null) {

            rotationOrder =
                    getNextAutomaticRotationOrder();
        }


        /*
         * Rotation order must be positive.
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
         * Prevent duplicate rotation orders.
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
     * MAIN ROTATION LOGIC.
     *
     * IMPORTANT:
     *
     * Automatic rollover happens BEFORE determining the
     * current active agency.
     *
     * This ensures that when an agency completes, its
     * rotation position is immediately updated.
     *
     * Example:
     *
     * BEFORE:
     *
     * A = 1
     * B = 2
     * C = 3
     * D = 4
     *
     * D completes.
     *
     * AFTER:
     *
     * D = 1
     * A = 2
     * B = 3
     * C = 4
     *
     * Even if C is now active, D remains at position 1.
     */

    public Agency getCurrentRotationAgency() {

        /*
         * First perform automatic rollover.
         */

        performAutomaticRotationRollover();


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
         * Current:
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


            boolean active =
                    !today.isBefore(startDate)
                            &&
                    !today.isAfter(endDate);


            if (active) {

                currentRotations.add(rotation);
            }
        }


        /*
         * If an agency is currently active, it becomes
         * the current agency.
         *
         * Rotation order is used only to resolve an
         * unexpected overlap.
         */

        if (!currentRotations.isEmpty()) {

            currentRotations.sort(
                    Comparator.comparing(
                            Rotation::getRotationOrder,
                            Comparator.nullsLast(
                                    Comparator.naturalOrder()
                            )
                    )
            );


            return currentRotations
                    .get(0)
                    .getAgency();
        }


        /*
         * ==================================================
         * STEP 2
         * FIND FUTURE AGENCY
         * ==================================================
         *
         * If no agency is currently active, find the
         * nearest future agency.
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
         * Nearest future agency wins.
         *
         * Same start date:
         * lower rotation order wins.
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
         * FALLBACK TO ROTATION ORDER 1
         * ==================================================
         */

        rotations.sort(
                Comparator.comparing(
                        Rotation::getRotationOrder,
                        Comparator.nullsLast(
                                Comparator.naturalOrder()
                        )
                )
        );


        for (Rotation rotation : rotations) {

            if (rotation == null) {

                continue;
            }


            if (rotation.getAgency() == null) {

                continue;
            }


            if (
                    rotation.getRotationOrder() != null
                            &&
                    rotation.getRotationOrder() == 1
            ) {

                return rotation.getAgency();
            }
        }


        /*
         * Final fallback.
         */

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
     * AUTOMATIC ROTATION ROLLOVER
     * ======================================================
     *
     * This is the important correction.
     *
     * A completed agency means:
     *
     *      endDate < today
     *
     * The agency with the latest completed end date is
     * treated as the agency that most recently completed.
     *
     * Once found:
     *
     *      completed agency -> position 1
     *
     * Every agency currently before it moves one position
     * forward.
     *
     * Example:
     *
     * A = 1
     * B = 2
     * C = 3
     * D = 4
     *
     * D completes:
     *
     * D = 1
     * A = 2
     * B = 3
     * C = 4
     *
     * The result is persisted to the database.
     */

    private void performAutomaticRotationRollover() {

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

            return;
        }


        /*
         * ==================================================
         * FIND MOST RECENTLY COMPLETED AGENCY
         * ==================================================
         */

        Rotation mostRecentlyCompleted =
                null;


        LocalDate latestEndDate =
                null;


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
             * Completed agency.
             */

            if (endDate.isBefore(today)) {

                if (
                        latestEndDate == null
                                ||
                        endDate.isAfter(latestEndDate)
                ) {

                    latestEndDate =
                            endDate;

                    mostRecentlyCompleted =
                            rotation;
                }
            }
        }


        /*
         * Nothing completed.
         */

        if (mostRecentlyCompleted == null) {

            return;
        }


        /*
         * ==================================================
         * CHECK WHETHER ROLLOVER IS ALREADY DONE
         * ==================================================
         *
         * If the completed agency is already at position 1,
         * do nothing.
         */

        if (
                mostRecentlyCompleted.getRotationOrder() != null
                        &&
                mostRecentlyCompleted
                        .getRotationOrder() == 1
        ) {

            return;
        }


        /*
         * ==================================================
         * PERFORM REORDER
         * ==================================================
         */

        reorderCompletedAgencyToFirst(
                rotations,
                mostRecentlyCompleted
        );
    }


    /*
     * ======================================================
     * REORDER COMPLETED AGENCY TO FIRST POSITION
     * ======================================================
     *
     * Example:
     *
     * BEFORE:
     *
     * A = 1
     * B = 2
     * C = 3
     * D = 4
     *
     * Completed = D
     *
     * AFTER:
     *
     * D = 1
     * A = 2
     * B = 3
     * C = 4
     */

    private void reorderCompletedAgencyToFirst(
            List<Rotation> rotations,
            Rotation completedRotation
    ) {

        if (
                rotations == null
                        ||
                rotations.isEmpty()
                        ||
                completedRotation == null
        ) {

            return;
        }


        /*
         * Sort according to existing order.
         */

        rotations.sort(
                Comparator.comparing(
                        Rotation::getRotationOrder,
                        Comparator.nullsLast(
                                Comparator.naturalOrder()
                        )
                )
        );


        /*
         * Find completed agency position.
         */

        int completedIndex =
                rotations.indexOf(
                        completedRotation
                );


        if (completedIndex < 0) {

            return;
        }


        /*
         * Already first.
         */

        if (completedIndex == 0) {

            return;
        }


        /*
         * ==================================================
         * CREATE NEW ORDER
         * ==================================================
         */

        List<Rotation> reordered =
                new ArrayList<>();


        /*
         * Completed agency becomes first.
         */

        reordered.add(
                completedRotation
        );


        /*
         * All other agencies follow in their existing
         * relative order.
         */

        for (Rotation rotation : rotations) {

            if (rotation == null) {

                continue;
            }


            if (rotation == completedRotation) {

                continue;
            }


            reordered.add(rotation);
        }


        /*
         * ==================================================
         * DETERMINE SAFE TEMPORARY ORDER
         * ==================================================
         *
         * Because rotationOrder may be UNIQUE in the
         * database, we cannot directly perform:
         *
         * D = 4 -> 1
         * A = 1 -> 2
         *
         * without temporarily creating duplicate values.
         */

        int highestOrder =
                0;


        for (Rotation rotation : reordered) {

            if (rotation == null) {

                continue;
            }


            Integer currentOrder =
                    rotation.getRotationOrder();


            if (
                    currentOrder != null
                            &&
                    currentOrder > highestOrder
            ) {

                highestOrder =
                        currentOrder;
            }
        }


        long temporaryBase =
                (long) highestOrder
                        +
                reordered.size()
                        +
                1000L;


        if (
                temporaryBase
                        +
                        reordered.size()
                        >=
                        Integer.MAX_VALUE
        ) {

            throw new IllegalArgumentException(
                    "Rotation order values are too large to perform automatic rollover."
            );
        }


        /*
         * ==================================================
         * ASSIGN TEMPORARY UNIQUE VALUES
         * ==================================================
         */

        for (
                int index = 0;
                index < reordered.size();
                index++
        ) {

            Rotation rotation =
                    reordered.get(index);


            rotation.setRotationOrder(
                    (int)
                            (
                                    temporaryBase
                                            +
                                    index
                            )
            );
        }


        /*
         * Persist temporary values first.
         */

        rotationRepository.saveAll(
                reordered
        );


        rotationRepository.flush();


        /*
         * ==================================================
         * ASSIGN FINAL ORDER
         * ==================================================
         *
         * Example:
         *
         * D A B C
         *
         * becomes:
         *
         * 1 2 3 4
         */

        for (
                int index = 0;
                index < reordered.size();
                index++
        ) {

            Rotation rotation =
                    reordered.get(index);


            rotation.setRotationOrder(
                    index + 1
            );
        }


        /*
         * Persist final order.
         */

        rotationRepository.saveAll(
                reordered
        );


        rotationRepository.flush();
    }


    /*
     * ======================================================
     * GET CURRENT ROTATION COORDINATOR
     * ======================================================
     *
     * IMPORTANT:
     *
     * This method is NOT read-only because
     * getCurrentRotationAgency() may perform a rollover.
     */

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
     * No fixed maximum.
     *
     * Example:
     *
     * 1,2,3 -> 4
     *
     * 1,2,5 -> 6
     *
     * 10,25 -> 26
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


        int highestOrder =
                0;


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

                highestOrder =
                        order;
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
             * Two date ranges overlap when:
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
