package com.saas.eventos.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = true) // nullable true por enquanto para não quebrar dados antigos, depois podemos forçar.
    private Cliente cliente;

    // Tipos corretos para data e hora
    private LocalDate data;
    private LocalTime hora;

    private String pacote;

    @Column(length = 2000)
    private String detalhes;

    private String local;

    private BigDecimal precoBase;
    private BigDecimal valorEntrada;
    private BigDecimal desconto;

    // Status do ciclo de vida do evento
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatusEvento status = StatusEvento.PLANEJAMENTO;

    // Substituído pelo campo status
    @Builder.Default
    @Column(nullable = false)
    private boolean concluido = false;

    // A qual empresa (Tenant) este evento pertence
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // Cada evento tem sua própria lista de produtos (insumos isolados por evento)
    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Produto> produtos = new ArrayList<>();

    // Timestamps automáticos
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
