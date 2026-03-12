package com.nehrem.backend.config;

import com.nehrem.backend.telegram.NehremTelegramBot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

/**
 * Registers the Telegram bot with the long-polling API and enables @Async
 * so notification calls do not block the order-processing thread.
 */
@Slf4j
@Configuration
@EnableAsync
public class TelegramBotConfig {

    /**
     * Registers the bot for long-polling updates.
     * Only created when the bot bean itself is present (i.e. token is configured).
     */
    @Bean
    @ConditionalOnBean(NehremTelegramBot.class)
    TelegramBotsApi telegramBotsApi(NehremTelegramBot bot) throws TelegramApiException {
        TelegramBotsApi api = new TelegramBotsApi(DefaultBotSession.class);
        api.registerBot(bot);
        log.info("Telegram bot '{}' registered and listening for updates.", bot.getBotUsername());
        return api;
    }
}
