package com.ntpc.obt.repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import com.ntpc.obt.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BatchRepository extends JpaRepository<Batch, Long> {

	@Query("SELECT b FROM Batch b WHERE b.coordinator.id = :coordinatorId")
	Optional<Batch> findByCoordinatorId(@Param("coordinatorId") Long coordinatorId);

}