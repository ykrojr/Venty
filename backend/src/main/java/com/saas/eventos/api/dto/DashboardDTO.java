package com.saas.eventos.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalEventos;
    private long eventosConcluidos;
    private BigDecimal receitaTotal;
    private BigDecimal custosTotais;
    private BigDecimal lucroTotal;
    private Map<String, Long> eventosPorStatus;
}
