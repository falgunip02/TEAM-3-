package com.cafeteria.app.repository;

import com.cafeteria.app.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserId(String userId);
    List<Order> findByStatus(String status);
    List<Order> findByUserIdAndStatus(String userId, String status);
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Order> findByPickupTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
}

