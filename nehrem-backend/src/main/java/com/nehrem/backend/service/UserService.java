package com.nehrem.backend.service;

import com.nehrem.backend.dto.UserDTO;

public interface UserService {
    void changePassword(String username, UserDTO.ChangePasswordRequest request);
}
