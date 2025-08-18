package com.cafeteria.app.repository;

import com.cafeteria.app.model.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByAvailable(Boolean available);
    List<MenuItem> findByCategory(String category);
    List<MenuItem> findByCategoryAndAvailable(String category, Boolean available);
}

