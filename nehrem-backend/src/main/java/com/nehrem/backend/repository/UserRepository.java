package com.nehrem.backend.repository;

import com.nehrem.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByRole(User.Role role);

    List<User> findByRoleAndActiveTrue(User.Role role);

    /** Returns all subscribed users with the given role for Telegram notifications. */
    List<User> findByRoleAndTelegramSubscribedTrue(User.Role role);

    /** Looks up a user by their Telegram chat ID (for subscription management). */
    Optional<User> findByTelegramChatId(Long telegramChatId);

    /** Returns all users in the given roles (used for phone-number matching during subscription). */
    List<User> findByRoleIn(List<User.Role> roles);
}
