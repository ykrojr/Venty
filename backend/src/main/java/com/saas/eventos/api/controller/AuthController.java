package com.saas.eventos.api.controller;

import com.saas.eventos.api.dto.AuthRequest;
import com.saas.eventos.api.dto.AuthResponse;
import com.saas.eventos.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestParam String nomeEmpresa,
            @RequestParam String nomeAdmin,
            @RequestParam String email,
            @RequestParam String senha) {
        
        return ResponseEntity.ok(authService.registrarEmpresa(nomeEmpresa, nomeAdmin, email, senha));
    }
}
