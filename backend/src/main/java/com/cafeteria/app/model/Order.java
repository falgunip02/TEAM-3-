package com.cafeteria.app.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;




@Document(collection = "orders")
public class Order {
    @Id
    private String id;


    private String userId;

    @NotNull
    @Valid // This ensures OrderItem validation is also applied
    private List<OrderItem> items;

    @NotNull
    @Positive
    private Double totalPrice;

    @NotNull
    private String status; // "pending", "preparing", "ready_for_pickup", "picked_up", "cancelled"

    private String pickupTime; // Changed to String to match frontend ISO string

    private LocalDateTime orderDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;




        private String notes;

        // ... getters and setters ...
        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }



    // Default constructor
    public Order() {
        this.orderDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "pending";
    }

    // Parameterized constructor
    public Order(String userId, List<OrderItem> items, Double totalPrice, String pickupTime) {
        this.userId = userId;
        this.items = items;
        this.totalPrice = totalPrice;
        this.pickupTime = pickupTime;
        this.status = "pending";
        this.orderDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(String pickupTime) {
        this.pickupTime = pickupTime;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // toString method for debugging
    @Override
    public String toString() {
        return "Order{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", items=" + items +
                ", totalPrice=" + totalPrice +
                ", status='" + status + '\'' +
                ", pickupTime='" + pickupTime + '\'' +
                ", orderDate=" + orderDate +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}