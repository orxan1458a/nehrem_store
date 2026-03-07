package com.nehrem.backend.repository;

import com.nehrem.backend.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {

    Optional<Visitor> findByDeviceId(String deviceId);

    @Query("SELECT COUNT(v) FROM Visitor v WHERE v.lastActivity >= :since")
    long countActive(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(v) FROM Visitor v WHERE v.firstVisit >= :startOfDay")
    long countToday(@Param("startOfDay") LocalDateTime startOfDay);
}
