package com.saas.eventos.api.dto;

import com.saas.eventos.domain.model.Evento;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class EventoDTO {
    private Long id;
    private String nome;
    private String cpf;
    private String celular;
    private String endereco;
    private String email;
    private String data;
    private String hora;
    private String pacote;
    private String detalhes;
    private BigDecimal precoBase;
    private BigDecimal valorEntrada;
    private BigDecimal desconto;
    private boolean concluido;

    // Financeiro calculado automaticamente
    private List<ProdutoDTO> produtos;
    private BigDecimal custoTotalProdutos;
    private BigDecimal lucroEsperado;

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

        return EventoDTO.builder()
                .id(evento.getId())
                .nome(evento.getNome())
                .cpf(evento.getCpf())
                .celular(evento.getCelular())
                .endereco(evento.getEndereco())
                .email(evento.getEmail())
                .data(evento.getData())
                .hora(evento.getHora())
                .pacote(evento.getPacote())
                .detalhes(evento.getDetalhes())
                .precoBase(base)
                .valorEntrada(evento.getValorEntrada())
                .desconto(evento.getDesconto())
                .concluido(evento.isConcluido())
                .produtos(produtosDTO)
                .custoTotalProdutos(totalGastos)
                .lucroEsperado(lucro)
                .build();
    }
}
