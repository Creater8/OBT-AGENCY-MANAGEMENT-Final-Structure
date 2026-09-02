package com.ntpc.obt.controller;

import jakarta.validation.Valid;

import com.ntpc.obt.entity.Batch;
import com.ntpc.obt.service.BatchService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@CrossOrigin(origins = "*")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    // Create Batch
    @PostMapping
    public ResponseEntity<Batch> createBatch(
            @Valid @RequestBody Batch batch) {

        Batch createdBatch =
                batchService.createBatch(batch);

        return ResponseEntity.ok(createdBatch);
    }

    // Get all Batches
    @GetMapping
    public ResponseEntity<List<Batch>> getAllBatches() {

        return ResponseEntity.ok(
                batchService.getAllBatches()
        );
    }

    // Get Batch by ID
    @GetMapping("/{id}")
    public ResponseEntity<Batch> getBatchById(
            @PathVariable Long id) {

        return batchService.getBatchById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // Update Batch
    @PutMapping("/{id}")
    public ResponseEntity<Batch> updateBatch(
            @PathVariable Long id,
            @Valid @RequestBody Batch batch) {

        return ResponseEntity.ok(
                batchService.updateBatch(id, batch)
        );
    }
    
   
  
    // Delete Batch
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(
            @PathVariable Long id) {

        batchService.deleteBatch(id);

        return ResponseEntity.noContent().build();
    }
}