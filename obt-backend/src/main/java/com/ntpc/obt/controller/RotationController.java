package com.ntpc.obt.controller;

import com.ntpc.obt.entity.Agency;
import com.ntpc.obt.entity.Coordinator;
import com.ntpc.obt.entity.Rotation;
import com.ntpc.obt.service.RotationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rotations")
@CrossOrigin(origins = "*")
public class RotationController {

    private final RotationService rotationService;

    /*
     * ======================================================
     * CONSTRUCTOR
     * ======================================================
     */

    public RotationController(RotationService rotationService) {
        this.rotationService = rotationService;
    }

    /*
     * ======================================================
     * GET ALL ROTATIONS
     * ======================================================
     *
     * Returns all rotations in their backend-defined
     * rotation order.
     *
     * API:
     *
     * GET /api/rotations
     */

    @GetMapping
    public ResponseEntity<List<Rotation>> getAllRotations() {

        return ResponseEntity.ok(
                rotationService.getAllRotations()
        );
    }

    /*
     * ======================================================
     * GET ROTATION BY ID
     * ======================================================
     *
     * API:
     *
     * GET /api/rotations/{id}
     */

    @GetMapping("/{id}")
    public ResponseEntity<Rotation> getRotationById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                rotationService.getRotationById(id)
        );
    }

    /*
     * ======================================================
     * CREATE ROTATION
     * ======================================================
     *
     * rotationOrder is optional.
     *
     * If rotationOrder is not provided, the backend
     * automatically generates the next available order.
     *
     * API:
     *
     * POST /api/rotations/agency/{agencyId}
     *
     * Optional request parameter:
     *
     * ?rotationOrder=1
     *
     * Examples:
     *
     * POST /api/rotations/agency/5
     *
     * OR
     *
     * POST /api/rotations/agency/5?rotationOrder=3
     */

    @PostMapping("/agency/{agencyId}")
    public ResponseEntity<Rotation> createRotation(
            @PathVariable Long agencyId,
            @RequestParam(required = false) Integer rotationOrder
    ) {

        Rotation rotation =
                rotationService.createRotation(
                        agencyId,
                        rotationOrder
                );

        return ResponseEntity.ok(rotation);
    }

    /*
     * ======================================================
     * UPDATE ROTATION
     * ======================================================
     *
     * Updates both:
     *
     * - Agency
     * - Rotation order
     *
     * API:
     *
     * PUT /api/rotations/{id}/agency/{agencyId}?rotationOrder=3
     *
     */

    @PutMapping("/{id}/agency/{agencyId}")
    public ResponseEntity<Rotation> updateRotation(
            @PathVariable Long id,
            @PathVariable Long agencyId,
            @RequestParam Integer rotationOrder
    ) {

        Rotation rotation =
                rotationService.updateRotation(
                        id,
                        agencyId,
                        rotationOrder
                );

        return ResponseEntity.ok(rotation);
    }

    /*
     * ======================================================
     * GET ROTATION BY AGENCY
     * ======================================================
     *
     * API:
     *
     * GET /api/rotations/agency/{agencyId}
     */

    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<Rotation> getRotationByAgencyId(
            @PathVariable Long agencyId
    ) {

        return ResponseEntity.ok(
                rotationService.getRotationByAgencyId(
                        agencyId
                )
        );
    }

    /*
     * ======================================================
     * GET ROTATION BY ROTATION ORDER
     * ======================================================
     *
     * API:
     *
     * GET /api/rotations/order/{rotationOrder}
     *
     * IMPORTANT:
     *
     * RotationService method name is:
     *
     * getRotationByOrder()
     *
     */

    @GetMapping("/order/{rotationOrder}")
    public ResponseEntity<Rotation> getRotationByOrder(
            @PathVariable Integer rotationOrder
    ) {

        return ResponseEntity.ok(
                rotationService.getRotationByOrder(
                        rotationOrder
                )
        );
    }

    /*
     * ======================================================
     * GET CURRENT ROTATION AGENCY
     * ======================================================
     *
     * THIS IS THE MAIN ROTATION API.
     *
     * The RotationService determines the Agency using
     * the Coordinator's:
     *
     * - startDate
     * - endDate
     *
     * Logic:
     *
     * 1. If an Agency is currently active:
     *       startDate <= today <= endDate
     *
     *    return that Agency.
     *
     * 2. If no Agency is currently active:
     *
     *    find the nearest future Agency.
     *
     * 3. If there is no future Agency:
     *
     *    Restart from the first Agency according to
     *    rotationOrder.
     *
     * API:
     *
     * GET /api/rotations/current-agency
     *
     */

    @GetMapping("/current-agency")
    public ResponseEntity<Agency> getCurrentRotationAgency() {

        return ResponseEntity.ok(
                rotationService.getCurrentRotationAgency()
        );
    }

    /*
     * ======================================================
     * GET CURRENT ROTATION COORDINATOR
     * ======================================================
     *
     * Returns the Coordinator associated with the
     * current rotation Agency.
     *
     * The Coordinator contains:
     *
     * - name
     * - agency
     * - batchName
     * - startDate
     * - endDate
     * - designation
     * - phone
     * - email
     * - status
     *
     * API:
     *
     * GET /api/rotations/current-coordinator
     *
     */

    @GetMapping("/current-coordinator")
    public ResponseEntity<Coordinator> getCurrentRotationCoordinator() {

        return ResponseEntity.ok(
                rotationService.getCurrentRotationCoordinator()
        );
    }

    /*
     * ======================================================
     * DELETE ROTATION
     * ======================================================
     *
     * API:
     *
     * DELETE /api/rotations/{id}
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRotation(
            @PathVariable Long id
    ) {

        rotationService.deleteRotation(id);

        return ResponseEntity.noContent().build();
    }

}
