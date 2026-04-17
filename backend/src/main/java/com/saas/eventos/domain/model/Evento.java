package com.saas.eventos.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "eventos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String cpf;
    private String celular;
    private String endereco;
    private String email;
    private String data;
    private String hora;
    private String pacote;
    
    @Column(length = 2000)
    private String detalhes;

    private BigDecimal precoBase;
    private BigDecimal valorEntrada;
    private BigDecimal desconto;

    @Builder.Default
    @Column(nullable = false)
    private boolean concluido = false;

    // A qual empresa (Tenant) este evento pertence
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // NOVO: Cada evento tem sua própria lista de produtos (OneToMany direto)
    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Produto> produtos = new ArrayList<>();
}
