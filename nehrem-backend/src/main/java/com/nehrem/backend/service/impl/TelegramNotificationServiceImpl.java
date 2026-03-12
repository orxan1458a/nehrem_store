package com.nehrem.backend.service.impl;

import com.nehrem.backend.dto.OrderDTO;
import com.nehrem.backend.entity.User;
import com.nehrem.backend.repository.UserRepository;
import com.nehrem.backend.service.TelegramNotificationService;
import com.nehrem.backend.telegram.NehremTelegramBot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Sends Telegram notifications for order lifecycle events.
 *
 * All public methods are {@code @Async}: they run in a background thread and
 * never block the caller's transaction/response.
 *
 * The bot bean is optional — if {@code telegram.bot.token} is not configured
 * the bot is absent and all methods become silent no-ops.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TelegramNotificationServiceImpl implements TelegramNotificationService {

    private final UserRepository userRepository;

    /**
     * Optional: only present when {@code telegram.bot.token} property is set.
     * Field injection is used so the rest of the app starts normally without it.
     */
    @Autowired(required = false)
    private NehremTelegramBot bot;

    // ── Public API ────────────────────────────────────────────────────────────

    @Async
    @Override
    public void notifyAdminsNewOrder(OrderDTO.Response order) {
        if (bot == null) return;
        String message = buildNewOrderMessage(order);
        notifyRole(User.Role.ADMIN, message);
    }

    @Async
    @Override
    public void notifyOrderAccepted(OrderDTO.Response order) {
        if (bot == null) return;

        Long courierId = order.getCourier() != null ? order.getCourier().getId() : null;
        if (courierId != null) {
            // Notify the assigned courier
            userRepository.findById(courierId).ifPresent(courier -> {
                if (Boolean.TRUE.equals(courier.getTelegramSubscribed())
                        && courier.getTelegramChatId() != null) {
                    bot.sendNotification(courier.getTelegramChatId(),
                            buildCourierAssignmentMessage(order));
                }
            });
        } else {
            // No courier assigned yet — remind all subscribed admins
            String reminder = "Xatırlatma: Sifariş #" + order.getId()
                    + " qəbul edildi, lakin hələ heç bir kuryer təyin edilməyib.";
            notifyRole(User.Role.ADMIN, reminder);
        }
    }

    @Async
    @Override
    public void notifyAdminOrderUpdate(OrderDTO.Response order, String status) {
        if (bot == null) return;
        notifyRole(User.Role.ADMIN, buildOrderUpdateMessage(order, status));
    }

    // ── Message builders ──────────────────────────────────────────────────────

    private String buildNewOrderMessage(OrderDTO.Response order) {
        StringBuilder sb = new StringBuilder();
        sb.append("Yeni sifariş var.\n\n");
        sb.append("Sifariş İD: #").append(order.getId()).append("\n");
        sb.append("Alıcı: ")
          .append(order.getFirstName()).append(" ").append(order.getLastName()).append("\n");
        sb.append("Telefon: ").append(order.getPhone()).append("\n");
        sb.append("Çatdırılma: ").append(
                order.getDeliveryMethod().name().equals("DELIVERY") ? "Çatdırılma 🚚" : "Mağazadan götürmə 🏪"
        ).append("\n");

        if (order.getAddress() != null && !order.getAddress().isBlank()) {
            sb.append("Ünvan📍: ").append(order.getAddress()).append("\n");
        }
        if (order.getNotes() != null && !order.getNotes().isBlank()) {
            sb.append("Qeyd: ").append(order.getNotes()).append("\n");
        }

        sb.append("\nMəhsullar:\n");
        for (OrderDTO.ItemResponse item : order.getItems()) {
            sb.append("- ").append(item.getProductName())
              .append(" x").append(item.getQuantity()).append("\n");
        }

        sb.append("\nToplam: ").append(order.getTotalAmount()).append(" AZN");
        return sb.toString();
    }

    private String buildCourierAssignmentMessage(OrderDTO.Response order) {
        StringBuilder sb = new StringBuilder();
        sb.append("New Delivery Assigned\n\n");
        sb.append("Order ID: #").append(order.getId()).append("\n");
        sb.append("Customer: ")
          .append(order.getFirstName()).append(" ").append(order.getLastName()).append("\n");
        sb.append("Phone: ").append(order.getPhone()).append("\n");

        if (order.getAddress() != null && !order.getAddress().isBlank()) {
            sb.append("Address: ").append(order.getAddress()).append("\n");
        }

        sb.append("\nProducts:\n");
        for (OrderDTO.ItemResponse item : order.getItems()) {
            sb.append("- ").append(item.getProductName())
              .append(" x").append(item.getQuantity()).append("\n");
        }

        return sb.toString();
    }

    private String buildOrderUpdateMessage(OrderDTO.Response order, String status) {
        StringBuilder sb = new StringBuilder();
        sb.append("Order Update\n\n");
        sb.append("Order ID: #").append(order.getId()).append("\n");

        if (order.getCourier() != null) {
            sb.append("Courier: ").append(order.getCourier().getName()).append("\n");
        }

        sb.append("Status: ").append(status);
        return sb.toString();
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private void notifyRole(User.Role role, String message) {
        List<User> subscribers = userRepository.findByRoleAndTelegramSubscribedTrue(role);
        for (User user : subscribers) {
            bot.sendNotification(user.getTelegramChatId(), message);
        }
    }
}
