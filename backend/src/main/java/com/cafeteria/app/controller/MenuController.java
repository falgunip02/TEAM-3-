package com.cafeteria.app.controller;

import com.cafeteria.app.dto.MessageResponse;
import com.cafeteria.app.model.MenuItem;
import com.cafeteria.app.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    MenuItemRepository menuItemRepository;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        List<MenuItem> menuItems = menuItemRepository.findAll();
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/available")
    public ResponseEntity<List<MenuItem>> getAvailableMenuItems() {
        List<MenuItem> menuItems = menuItemRepository.findByAvailable(true);
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable String id) {
        Optional<MenuItem> menuItem = menuItemRepository.findById(id);
        if (menuItem.isPresent()) {
            return ResponseEntity.ok(menuItem.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<MenuItem>> getMenuItemsByCategory(@PathVariable String category) {
        List<MenuItem> menuItems = menuItemRepository.findByCategoryAndAvailable(category, true);
        return ResponseEntity.ok(menuItems);
    }

    @PostMapping
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> createMenuItem(@Valid @RequestBody MenuItem menuItem) {
        try {
            MenuItem savedMenuItem = menuItemRepository.save(menuItem);
            return ResponseEntity.ok(savedMenuItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating menu item: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> updateMenuItem(@PathVariable String id, @Valid @RequestBody MenuItem menuItemDetails) {
        Optional<MenuItem> optionalMenuItem = menuItemRepository.findById(id);
        
        if (optionalMenuItem.isPresent()) {
            MenuItem menuItem = optionalMenuItem.get();
            menuItem.setName(menuItemDetails.getName());
            menuItem.setDescription(menuItemDetails.getDescription());
            menuItem.setPrice(menuItemDetails.getPrice());
            menuItem.setCategory(menuItemDetails.getCategory());
            menuItem.setImageUrl(menuItemDetails.getImageUrl());
            menuItem.setAvailable(menuItemDetails.getAvailable());
            menuItem.setUpdatedAt(LocalDateTime.now());

            MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
            return ResponseEntity.ok(updatedMenuItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String id) {
        Optional<MenuItem> menuItem = menuItemRepository.findById(id);
        
        if (menuItem.isPresent()) {
            menuItemRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Menu item deleted successfully!"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

