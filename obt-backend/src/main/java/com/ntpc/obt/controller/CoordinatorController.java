package com.ntpc.obt.controller;
import jakarta.validation.Valid;
import com.ntpc.obt.entity.Coordinator;
import com.ntpc.obt.service.CoordinatorService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coordinators")
@CrossOrigin(origins = "*")
public class CoordinatorController {

    private final CoordinatorService coordinatorService;

    public CoordinatorController(CoordinatorService coordinatorService) {
        this.coordinatorService = coordinatorService;
    }

    // Create Coordinator
    @PostMapping
    public ResponseEntity<Coordinator> createCoordinator(
    		@Valid @RequestBody Coordinator coordinator) {

        Coordinator createdCoordinator =
                coordinatorService.createCoordinator(coordinator);
   

        return ResponseEntity.ok(createdCoordinator);
    }

    // Get all Coordinators
    @GetMapping
    public ResponseEntity<List<Coordinator>> getAllCoordinators() {

        return ResponseEntity.ok(
                coordinatorService.getAllCoordinators()
        );
    }
    // Get Coordinator by ID
    @GetMapping("/{id}")
    public ResponseEntity<Coordinator> getCoordinatorById(
            @PathVariable Long id) {

        return coordinatorService.getCoordinatorById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }
    // Update Coordinator
    @PutMapping("/{id}")
    public ResponseEntity<Coordinator> updateCoordinator(
            @PathVariable Long id,
            @Valid @RequestBody Coordinator coordinator) {

        return ResponseEntity.ok(
                coordinatorService.updateCoordinator(id, coordinator)
        );
    }

    // Delete Coordinator
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoordinator(
            @PathVariable Long id) {

        coordinatorService.deleteCoordinator(id);

        return ResponseEntity.noContent().build();
    }
}