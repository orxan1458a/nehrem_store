package com.nehrem.backend.repository;

import com.nehrem.backend.entity.Courier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourierRepository extends JpaRepository<Courier, Long> {
    List<Courier> findByActiveTrue();
    Optional<Courier> findByUsernameAndPassword(String username, String password);
}
