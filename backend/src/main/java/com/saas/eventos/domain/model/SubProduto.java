package com.saas.eventos.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "subprodutos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @Column(nullable = false)
    private int quantidade;

    // Regra principal herdada do sistema desktop antigo: é garçom/segurança ou é material?
    @Column(nullable = false)
    private boolean ehFuncionario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    @JsonIgnore
    private Produto produto;

    public BigDecimal getTotalItem() {
        if (ehFuncionario) {
            // Se for funcionário, assumimos qtde como 1 ou o valor base da diária dele * qtde se preferir.
            // Para manter igual ao seu projeto original: Diária * Quantidade de Profissionais 
            return precoUnitario.multiply(BigDecimal.valueOf(quantidade));
        }
        return precoUnitario.multiply(BigDecimal.valueOf(quantidade));
    }
}
