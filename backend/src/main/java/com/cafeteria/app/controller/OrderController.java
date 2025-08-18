//package com.cafeteria.app.controller;
//
//import com.cafeteria.app.dto.MessageResponse;
//import com.cafeteria.app.model.Order;
//import com.cafeteria.app.repository.OrderRepository;
//import com.cafeteria.app.security.UserPrincipal;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//import javax.validation.Valid;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//@CrossOrigin(origins = "*", maxAge = 3600)
//@RestController
//@RequestMapping("/api/orders")
//public class OrderController {
//
//    @Autowired
//    private OrderRepository orderRepository;
//
//    /**
//     * Get ALL orders (Admin/Staff only)
//     */
//    @GetMapping
//    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
//    public ResponseEntity<List<Order>> getAllOrders() {
//        List<Order> orders = orderRepository.findAll();
//        return ResponseEntity.ok(orders);
//    }
//
//    /**
//     * Get ONLY the orders of the logged-in employee
//     */
//    @GetMapping("/my-orders")
//    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('STAFF') or hasRole('ADMIN')")
//    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
//        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
//        List<Order> orders = orderRepository.findByUserId(userPrincipal.getId());
//        return ResponseEntity.ok(orders);
//    }
//
//    /**
//     * Get order by ID — Employees can only view their own orders,
//     * Admin/Staff can view any order.
//     */
//    @GetMapping("/{id}")
//    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('STAFF') or hasRole('ADMIN')")
//    public ResponseEntity<Order> getOrderById(@PathVariable String id, Authentication authentication) {
//        Optional<Order> optionalOrder = orderRepository.findById(id);
//
//        if (optionalOrder.isPresent()) {
//            Order order = optionalOrder.get();
//            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
//
//            boolean isStaffOrAdmin = userPrincipal.getAuthorities().stream()
//                    .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") ||
//                            a.getAuthority().equals("ROLE_ADMIN"));
//
//            if (isStaffOrAdmin || order.getUserId().equals(userPrincipal.getId())) {
//                return ResponseEntity.ok(order);
//            } else {
//                return ResponseEntity.status(403).build(); // Forbidden
//            }
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    /**
//     * Get orders by status (Admin/Staff only)
//     */
//    @GetMapping("/status/{status}")
//    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
//    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
//        List<Order> orders = orderRepository.findByStatus(status);
//        return ResponseEntity.ok(orders);
//    }
//
//    /**
//     * Create new order (Employee only)
//     */
//    @PostMapping
//    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('STAFF') or hasRole('ADMIN')")
//    public ResponseEntity<?> createOrder(@Valid @RequestBody Order order, Authentication authentication) {
//        try {
//            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
//            order.setUserId(userPrincipal.getId());
//            order.setStatus("pending");
//            order.setOrderDate(LocalDateTime.now());
//            order.setCreatedAt(LocalDateTime.now());
//            order.setUpdatedAt(LocalDateTime.now());
//
//            Order savedOrder = orderRepository.save(order);
//            return ResponseEntity.ok(savedOrder);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(new MessageResponse("Error creating order: " + e.getMessage()));
//        }
//    }
//
//    /**
//     * Update order status (Admin/Staff only)
//     */
//    @PutMapping("/{id}/status")
//    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
//    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestBody String status) {
//        Optional<Order> optionalOrder = orderRepository.findById(id);
//
//        if (optionalOrder.isPresent()) {
//            Order order = optionalOrder.get();
//            order.setStatus(status.replace("\"", "")); // Remove quotes from JSON string
//            order.setUpdatedAt(LocalDateTime.now());
//
//            Order updatedOrder = orderRepository.save(order);
//            return ResponseEntity.ok(updatedOrder);
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }
//
//    /**
//     * Delete order — Employees can delete their own orders,
//     * Admin/Staff can delete any order.
//     */
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('STAFF') or hasRole('ADMIN')")
//    public ResponseEntity<?> deleteOrder(@PathVariable String id, Authentication authentication) {
//        Optional<Order> optionalOrder = orderRepository.findById(id);
//
//        if (optionalOrder.isPresent()) {
//            Order order = optionalOrder.get();
//            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
//
//            boolean isStaffOrAdmin = userPrincipal.getAuthorities().stream()
//                    .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") ||
//                            a.getAuthority().equals("ROLE_ADMIN"));
//
//            if (isStaffOrAdmin || order.getUserId().equals(userPrincipal.getId())) {
//                orderRepository.deleteById(id);
//                return ResponseEntity.ok(new MessageResponse("Order deleted successfully!"));
//            } else {
//                return ResponseEntity.status(403).body(new MessageResponse("Access denied!"));
//            }
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }
//}
//








package com.cafeteria.app.controller;

import com.cafeteria.app.dto.MessageResponse;
import com.cafeteria.app.model.Order;
import com.cafeteria.app.repository.OrderRepository;
import com.cafeteria.app.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    // Inner class for status update request
    public static class StatusUpdateRequest {
        private String status;
        private String notes;

        public StatusUpdateRequest() {
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    /**
     * Get ALL orders (Admin/Staff only)
     */
    @GetMapping
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return ResponseEntity.ok(orders);
    }

    /**
     * Get ONLY the orders of the logged-in employee
     */
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getMyOrders(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Order> orders = orderRepository.findByUserId(userPrincipal.getId());
        return ResponseEntity.ok(orders);
    }

    /**
     * Get order by ID — Employees can only view their own orders,
     * Admin/Staff can view any order.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<Order> getOrderById(@PathVariable String id, Authentication authentication) {
        Optional<Order> optionalOrder = orderRepository.findById(id);

        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            boolean isStaffOrAdmin = userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") ||
                            a.getAuthority().equals("ROLE_ADMIN"));

            if (isStaffOrAdmin || order.getUserId().equals(userPrincipal.getId())) {
                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get orders by status (Admin/Staff only)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        List<Order> orders = orderRepository.findByStatus(status);
        return ResponseEntity.ok(orders);
    }

    /**
     * Create new order (Employee only)
     */
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> createOrder(@Valid @RequestBody Order order, Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            LocalDateTime now = LocalDateTime.now();

            order.setUserId(userPrincipal.getId());
            order.setStatus("pending");
            order.setOrderDate(now);
            order.setCreatedAt(now);
            order.setUpdatedAt(now);

            // Initialize notes to empty string if not provided
            if (order.getNotes() == null) {
                order.setNotes("");
            }

            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating order: " + e.getMessage()));
        }
    }

    /**
     * Update order status and notes (Admin/Staff only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request
    ) {
        Optional<Order> optionalOrder = orderRepository.findById(id);

        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            order.setStatus(request.getStatus());

            // Update notes if provided
            if (request.getNotes() != null) {
                order.setNotes(request.getNotes());
            } else {
                // Preserve existing notes if not provided
                order.setNotes(order.getNotes() != null ? order.getNotes() : "");
            }

            order.setUpdatedAt(LocalDateTime.now());

            Order updatedOrder = orderRepository.save(order);
            return ResponseEntity.ok(updatedOrder);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete order — Employees can delete their own orders,
     * Admin/Staff can delete any order.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('STAFF') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteOrder(@PathVariable String id, Authentication authentication) {
        Optional<Order> optionalOrder = orderRepository.findById(id);

        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            boolean isStaffOrAdmin = userPrincipal.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") ||
                            a.getAuthority().equals("ROLE_ADMIN"));

            if (isStaffOrAdmin || order.getUserId().equals(userPrincipal.getId())) {
                orderRepository.deleteById(id);
                return ResponseEntity.ok(new MessageResponse("Order deleted successfully!"));
            } else {
                return ResponseEntity.status(403).body(new MessageResponse("Access denied!"));
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}