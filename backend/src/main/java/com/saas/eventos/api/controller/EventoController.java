package com.saas.eventos.api.controller;

import com.saas.eventos.api.dto.EventoDTO;
import com.saas.eventos.service.EventoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/eventos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class EventoController {

    private final EventoService eventoService;

    @Operation(summary = "Lista os eventos da empresa logada")
    @GetMapping
    public ResponseEntity<List<EventoDTO>> listar() {
        return ResponseEntity.ok(eventoService.listarEventosDoCliente());
    }

    @Operation(summary = "Cria um novo evento para a empresa logada")
    @PostMapping
    public ResponseEntity<EventoDTO> criar(@RequestBody EventoDTO dto) {
        return ResponseEntity.ok(eventoService.criarEvento(dto));
    }
}
