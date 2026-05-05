package com.saas.eventos.api.controller;

import com.saas.eventos.api.dto.DashboardDTO;
import com.saas.eventos.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Retorna métricas gerais de todos os eventos para o Dashboard")
    @GetMapping
    public ResponseEntity<DashboardDTO> obterMetricas() {
        return ResponseEntity.ok(dashboardService.obterMetricasDashboard());
    }
}
