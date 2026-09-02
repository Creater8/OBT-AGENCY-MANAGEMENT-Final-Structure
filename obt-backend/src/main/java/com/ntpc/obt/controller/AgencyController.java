package com.ntpc.obt.controller;

import com.ntpc.obt.entity.Agency;
import com.ntpc.obt.service.AgencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/agencies")
@CrossOrigin(origins = "*")
public class AgencyController {

    private final AgencyService agencyService;

    public AgencyController(AgencyService agencyService) {
        this.agencyService = agencyService;
    }

    // Create Agency
    @PostMapping
    public ResponseEntity<Agency> createAgency(
            @Valid @RequestBody Agency agency) {

        Agency createdAgency =
                agencyService.createAgency(agency);

        return ResponseEntity.ok(createdAgency);
    }

    // Get all Agencies
    @GetMapping
    public ResponseEntity<List<Agency>> getAllAgencies() {

        return ResponseEntity.ok(
                agencyService.getAllAgencies()
        );
    }

 // Get Agency by ID
    @GetMapping("/{id}")
    public ResponseEntity<Agency> getAgencyById(
            @PathVariable Long id
    ) {

        Agency agency = agencyService.getAgencyById(id);

        return ResponseEntity.ok(agency);
    }

    // Update Agency
    @PutMapping("/{id}")
    public ResponseEntity<Agency> updateAgency(
            @PathVariable Long id,
            @Valid @RequestBody Agency agency) {

        return ResponseEntity.ok(
                agencyService.updateAgency(id, agency)
        );
    }

    // Delete Agency
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgency(
            @PathVariable Long id) {

        agencyService.deleteAgency(id);

        return ResponseEntity.noContent().build();
    }
}