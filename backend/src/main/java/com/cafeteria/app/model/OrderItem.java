package com.cafeteria.app.model;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.Min;

public class OrderItem {
    @NotNull(message = "Menu item ID cannot be null")
    private String menuItemId;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Price at order cannot be null")
    @Positive(message = "Price must be positive")
    private Double priceAtOrder;

    // Default constructor
    public OrderItem() {}

    // Parameterized constructor
    public OrderItem(String menuItemId, Integer quantity, Double priceAtOrder) {
        this.menuItemId = menuItemId;
        this.quantity = quantity;
        this.priceAtOrder = priceAtOrder;
    }

    // Getters and Setters
    public String getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(String menuItemId) {
        this.menuItemId = menuItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPriceAtOrder() {
        return priceAtOrder;
    }

    public void setPriceAtOrder(Double priceAtOrder) {
        this.priceAtOrder = priceAtOrder;
    }

    // toString method for debugging
    @Override
    public String toString() {
        return "OrderItem{" +
                "menuItemId='" + menuItemId + '\'' +
                ", quantity=" + quantity +
                ", priceAtOrder=" + priceAtOrder +
                '}';
    }

    // equals method for comparison
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;

        OrderItem orderItem = (OrderItem) obj;
        return menuItemId != null ? menuItemId.equals(orderItem.menuItemId) : orderItem.menuItemId == null;
    }

    // hashCode method
    @Override
    public int hashCode() {
        return menuItemId != null ? menuItemId.hashCode() : 0;
    }
}