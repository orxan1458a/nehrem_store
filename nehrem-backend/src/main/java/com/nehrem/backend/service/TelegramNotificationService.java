package com.nehrem.backend.service;

import com.nehrem.backend.dto.OrderDTO;

/**
 * Notification layer for Telegram Bot messages.
 * All methods are fire-and-forget (async) and must never block order processing.
 */
public interface TelegramNotificationService {

    /** Notify all subscribed ADMIN users about a newly placed order. */
    void notifyAdminsNewOrder(OrderDTO.Response order);

    /**
     * Notify the assigned courier about a new delivery task.
     * If no courier is assigned, sends a reminder to all subscribed ADMINs instead.
     */
    void notifyOrderAccepted(OrderDTO.Response order);

    /**
     * Notify all subscribed ADMINs about a courier action (delivered or cancelled).
     *
     * @param order    the affected order
     * @param status   human-readable status string, e.g. "Delivered" or "Cancelled"
     */
    void notifyAdminOrderUpdate(OrderDTO.Response order, String status);
}
