package com.ntpc.obt.service;

import com.ntpc.obt.entity.Coordinator;
import com.ntpc.obt.exception.ConflictException;
import com.ntpc.obt.repository.CoordinatorRepository;
import com.ntpc.obt.entity.Batch;
import com.ntpc.obt.repository.BatchRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
@Service
public class BatchService {

    private final BatchRepository batchRepository;
    private final CoordinatorRepository coordinatorRepository;

    public BatchService(
            BatchRepository batchRepository,
            CoordinatorRepository coordinatorRepository) {

        this.batchRepository = batchRepository;
        this.coordinatorRepository = coordinatorRepository;
    }

    public Batch createBatch(Batch batch) {

        Long coordinatorId = batch.getCoordinator().getId();

        // Check whether Coordinator exists
        Optional<Coordinator> coordinatorOptional =
                coordinatorRepository.findById(coordinatorId);

        if (coordinatorOptional.isEmpty()) {

            throw new RuntimeException(
                    "Coordinator not found with id: " + coordinatorId
            );
        }

        // Check whether Coordinator already has a Batch
        Optional<Batch> existingBatch =
                batchRepository.findByCoordinatorId(coordinatorId);

        if (existingBatch.isPresent()) {

            throw new ConflictException(
                    "Coordinator already has a batch"
            );
        }

        Coordinator coordinator = coordinatorOptional.get();

        batch.setCoordinator(coordinator);

        return batchRepository.save(batch);
    }
    
    

    // Get all Batches
    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    // Get Batch by ID
    public Optional<Batch> getBatchById(Long id) {
        return batchRepository.findById(id);
    }

    // Update Batch
    public Batch updateBatch(Long id, Batch updatedBatch) {

        // Find existing Batch
        Batch existingBatch = batchRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Batch not found with id: " + id
                        )
                );

        // Get Coordinator ID from request
        Long coordinatorId =
                updatedBatch.getCoordinator().getId();

        // Check Coordinator exists
        Coordinator coordinator =
                coordinatorRepository.findById(coordinatorId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coordinator not found with id: "
                                                + coordinatorId
                                )
                        );

        // Check whether Coordinator belongs to another Batch
        Optional<Batch> coordinatorBatch =
                batchRepository.findByCoordinatorId(coordinatorId);

        if (coordinatorBatch.isPresent()
                && !coordinatorBatch.get().getId().equals(id)) {

            throw new ConflictException(
                    "Coordinator already has a batch"
            );
        }

        // Update Batch fields
        existingBatch.setBatchName(
                updatedBatch.getBatchName()
        );

        existingBatch.setStartDate(
                updatedBatch.getStartDate()
        );

        existingBatch.setEndDate(
                updatedBatch.getEndDate()
        );

        existingBatch.setCoordinator(
                coordinator
        );

        existingBatch.setStatus(
                updatedBatch.getStatus()
        );

        return batchRepository.save(existingBatch);
    }
    
    //delete batch// Delete Batch
    public void deleteBatch(Long id) {

        if (!batchRepository.existsById(id)) {

            throw new RuntimeException(
                    "Batch not found with id: " + id
            );
        }

        batchRepository.deleteById(id);
    }
}