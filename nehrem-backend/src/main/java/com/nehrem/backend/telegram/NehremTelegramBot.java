package com.nehrem.backend.telegram;

import com.nehrem.backend.entity.User;
import com.nehrem.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Contact;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardRemove;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.List;
import java.util.Optional;

/**
 * Telegram Long-Polling Bot that handles user subscriptions.
 *
 * Flow:
 *   1. User sends /start → bot requests phone number via contact button.
 *   2. User shares contact → backend matches phone against users table.
 *   3. On match: save telegramChatId, mark telegramSubscribed = true.
 *
 * Only activated when {@code telegram.bot.token} property is set.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "telegram.bot.token")
public class NehremTelegramBot extends TelegramLongPollingBot {

    private final UserRepository userRepository;
    private final String botUsername;

    public NehremTelegramBot(
            UserRepository userRepository,
            @Value("${telegram.bot.token}") String botToken,
            @Value("${telegram.bot.username}") String botUsername) {
        super(botToken);
        this.userRepository = userRepository;
        this.botUsername = botUsername;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    // ── Incoming updates ──────────────────────────────────────────────────────

    @Override
    public void onUpdateReceived(Update update) {
        if (!update.hasMessage()) return;
        Message message = update.getMessage();
        long chatId = message.getChatId();

        if (message.hasText() && "/start".equals(message.getText().trim())) {
            handleStart(chatId);
        } else if (message.hasContact()) {
            handleContact(chatId, message.getContact());
        }
    }

    // ── Subscription handlers ─────────────────────────────────────────────────

    private void handleStart(long chatId) {
        Optional<User> existing = userRepository.findByTelegramChatId(chatId);
        if (existing.isPresent() && Boolean.TRUE.equals(existing.get().getTelegramSubscribed())) {
            sendText(chatId, "Siz artıq sifariş bildirişlərinə abunə olmusunuz.");
            return;
        }

        KeyboardButton phoneBtn = new KeyboardButton("Telefon nömrəsini paylaş");
        phoneBtn.setRequestContact(true);

        KeyboardRow row = new KeyboardRow();
        row.add(phoneBtn);

        ReplyKeyboardMarkup markup = new ReplyKeyboardMarkup();
        markup.setKeyboard(List.of(row));
        markup.setResizeKeyboard(true);
        markup.setOneTimeKeyboard(true);

        SendMessage msg = new SendMessage();
        msg.setChatId(chatId);
        msg.setText("EvTrend Bildiriş Botuna xoş gəlmisiniz!\n\n"
                + "Sifariş bildirişlərinə abunə olmaq üçün zəhmət olmasa telefon nömrənizi paylaşın. 📱");
        msg.setReplyMarkup(markup);

        execute(msg);
    }

    private void handleContact(long chatId, Contact contact) {
        String normalized = normalizePhone(contact.getPhoneNumber());

        // Limit search to admin and courier accounts only
        List<User> staffUsers = userRepository.findByRoleIn(
                List.of(User.Role.ADMIN, User.Role.COURIER));

        Optional<User> match = staffUsers.stream()
                .filter(u -> u.getPhone() != null
                        && normalizePhone(u.getPhone()).equals(normalized))
                .findFirst();

        if (match.isEmpty()) {
            sendText(chatId, "Bu telefon nömrəsi ilə heç bir hesab tapılmadı.\n\n"
                    + "alnız qeydiyyatdan keçmiş adminlər və kuryerlər abunə ola bilər.");
            return;
        }

        User user = match.get();

        if (Boolean.TRUE.equals(user.getTelegramSubscribed())) {
            sendText(chatId, "Siz artıq sifariş bildirişlərinə abunə olmusunuz. ✅");
            return;
        }

        user.setTelegramChatId(chatId);
        user.setTelegramSubscribed(true);
        userRepository.save(user);

        String name = user.getName() != null ? user.getName() : user.getUsername();

        ReplyKeyboardRemove remove = new ReplyKeyboardRemove();
        remove.setRemoveKeyboard(true);

        SendMessage msg = new SendMessage();
        msg.setChatId(chatId);
        msg.setText("Uğurla abunə oldunuz! Salam, " + name + "!\n\n"
                + "Artıq sifariş bildirişlərini burada alacaqsınız. 📩");
        msg.setReplyMarkup(remove);

        execute(msg);
        log.info("User '{}' (role={}) subscribed to Telegram notifications via chatId={}",
                user.getUsername(), user.getRole(), chatId);
    }

    // ── Outbound messaging ────────────────────────────────────────────────────

    /**
     * Sends a plain-text notification message to a specific chat ID.
     * Silently swallows errors so notification failures never break order processing.
     */
    public void sendNotification(Long chatId, String text) {
        if (chatId == null || text == null) return;
        sendText(chatId, text);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void sendText(long chatId, String text) {
        SendMessage msg = new SendMessage();
        msg.setChatId(chatId);
        msg.setText(text);
        execute(msg);
    }

    /** Execute and swallow TelegramApiException so bot errors are non-fatal. */
    private void execute(SendMessage msg) {
        try {
            execute((org.telegram.telegrambots.meta.api.methods.BotApiMethod<?>) msg);
        } catch (TelegramApiException e) {
            log.warn("Telegram send failed for chatId {}: {}", msg.getChatId(), e.getMessage());
        }
    }

    /**
     * Normalizes a phone number to its last 9 digits for comparison.
     * Handles formats: +994XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXX (Azerbaijan mobile).
     */
    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        return digits.length() >= 9 ? digits.substring(digits.length() - 9) : digits;
    }
}
