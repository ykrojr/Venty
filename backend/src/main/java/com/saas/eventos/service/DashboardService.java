package com.saas.eventos.service;

import com.saas.eventos.api.dto.DashboardDTO;
import com.saas.eventos.api.dto.EventoDTO;
import com.saas.eventos.domain.model.StatusEvento;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EventoService eventoService;

    public DashboardDTO obterMetricasDashboard() {
        List<EventoDTO> eventos = eventoService.listarEventosDoCliente();

        long totalEventos = eventos.size();
        long eventosConcluidos = eventos.stream()
                .filter(e -> e.getStatus() == StatusEvento.CONCLUIDO || e.isConcluido())
                .count();

        BigDecimal receitaTotal = eventos.stream()
                .map(e -> e.getPrecoBase() != null ? e.getPrecoBase() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal custosTotais = eventos.stream()
                .map(e -> e.getCustoTotalProdutos() != null ? e.getCustoTotalProdutos() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal lucroTotal = receitaTotal.subtract(custosTotais);

        return DashboardDTO.builder()
                .totalEventos(totalEventos)
                .eventosConcluidos(eventosConcluidos)
                .receitaTotal(receitaTotal)
                .custosTotais(custosTotais)
                .lucroTotal(lucroTotal)
                .eventosPorStatus(eventos.stream()
                        .collect(Collectors.groupingBy(e -> e.getStatus() != null ? e.getStatus().name() : "PLANEJAMENTO", Collectors.counting())))
                .build();
    }
}
