package com.saas.eventos.api.controller;

import com.saas.eventos.api.dto.EventoDTO;
import com.saas.eventos.domain.model.StatusEvento;
import com.saas.eventos.service.EventoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
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

    @Operation(summary = "Busca os detalhes de um evento específico")
    @GetMapping("/{id}")
    public ResponseEntity<EventoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(eventoService.buscarPorId(id));
    }

    @Operation(summary = "Cria um novo evento para a empresa logada")
    @PostMapping
    public ResponseEntity<EventoDTO> criar(@Valid @RequestBody EventoDTO dto) {
        return ResponseEntity.ok(eventoService.criarEvento(dto));
    }

    @Operation(summary = "Atualiza os dados de um evento existente")
    @PutMapping("/{id}")
    public ResponseEntity<EventoDTO> editar(@PathVariable Long id, @Valid @RequestBody EventoDTO dto) {
        return ResponseEntity.ok(eventoService.editarEvento(id, dto));
    }

    @Operation(summary = "Muda o status do evento")
    @PatchMapping("/{id}/status")
    public ResponseEntity<EventoDTO> mudarStatus(@PathVariable Long id, @RequestParam StatusEvento status) {
        return ResponseEntity.ok(eventoService.mudarStatus(id, status));
    }

    @Operation(summary = "Exclui um evento")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        eventoService.excluirEvento(id);
        return ResponseEntity.noContent().build();
    }
}
