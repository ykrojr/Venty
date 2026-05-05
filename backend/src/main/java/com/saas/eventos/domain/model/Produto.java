package com.saas.eventos.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    // MUDANÇA ARQUITETURAL: Agora cada Produto pertence a UM Evento específico
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id")
    @JsonIgnore
    private Evento evento;

    // Relacionamento (Um Produto tem Vários Subprodutos: Insumos ou Equipe)
    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SubProduto> subprodutos = new ArrayList<>();

    // Cálculos matemáticos migrados do seu app Desktop Original!
    public BigDecimal calcularCustoMateriais() {
        if (subprodutos == null) return BigDecimal.ZERO;
        return subprodutos.stream()
                .filter(s -> !s.isEhFuncionario())
                .map(SubProduto::getTotalItem)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calcularCustoFuncionarios() {
        if (subprodutos == null) return BigDecimal.ZERO;
        return subprodutos.stream()
                .filter(SubProduto::isEhFuncionario)
                .map(SubProduto::getTotalItem)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calcularCustoTotal() {
        return calcularCustoMateriais().add(calcularCustoFuncionarios());
    }
}
