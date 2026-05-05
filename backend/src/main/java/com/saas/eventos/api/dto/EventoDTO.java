package com.saas.eventos.api.dto;

import com.saas.eventos.domain.model.Evento;
import com.saas.eventos.domain.model.Cliente;
import com.saas.eventos.domain.model.StatusEvento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoDTO {
    private Long id;

    @NotBlank(message = "O nome do evento é obrigatório.")
    @Size(min = 3, max = 200, message = "O nome deve ter entre 3 e 200 caracteres.")
    private String nome;

    // Dados do Cliente
    private Long clienteId;
    private String clienteNome;

    private LocalDate data;
    private LocalTime hora;

    private String pacote;

    @Size(max = 2000, message = "Os detalhes podem ter no máximo 2000 caracteres.")
    private String detalhes;

    private String local;

    @NotNull(message = "O preço base é obrigatório.")
    private BigDecimal precoBase;

    private BigDecimal valorEntrada;
    private BigDecimal desconto;
    private boolean concluido;
    private StatusEvento status;

    // Financeiro calculado automaticamente
    private List<ProdutoDTO> produtos;
    private BigDecimal custoTotalProdutos;
    private BigDecimal lucroEsperado;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EventoDTO fromEntity(Evento evento) {
        BigDecimal base = evento.getPrecoBase() != null ? evento.getPrecoBase() : BigDecimal.ZERO;

        List<ProdutoDTO> produtosDTO = new ArrayList<>();
        BigDecimal totalGastos = BigDecimal.ZERO;

        if (evento.getProdutos() != null) {
            produtosDTO = evento.getProdutos().stream()
                    .map(ProdutoDTO::fromEntity)
                    .collect(Collectors.toList());

            for (ProdutoDTO p : produtosDTO) {
                totalGastos = totalGastos.add(p.getCustoTotal());
            }
        }

        BigDecimal lucro = base.subtract(totalGastos);

        Long clienteId = evento.getCliente() != null ? evento.getCliente().getId() : null;
        String clienteNome = evento.getCliente() != null ? evento.getCliente().getNome() : null;

        return EventoDTO.builder()
                .id(evento.getId())
                .nome(evento.getNome())
                .clienteId(clienteId)
                .clienteNome(clienteNome)
                .data(evento.getData())
                .hora(evento.getHora())
                .pacote(evento.getPacote())
                .detalhes(evento.getDetalhes())
                .local(evento.getLocal())
                .precoBase(base)
                .valorEntrada(evento.getValorEntrada())
                .desconto(evento.getDesconto())
                .concluido(evento.isConcluido())
                .status(evento.getStatus())
                .produtos(produtosDTO)
                .custoTotalProdutos(totalGastos)
                .lucroEsperado(lucro)
                .createdAt(evento.getCreatedAt())
                .updatedAt(evento.getUpdatedAt())
                .build();
    }
}
