package com.saas.eventos.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioAutenticado {
    private String email;
    private Long tenantId;
}
