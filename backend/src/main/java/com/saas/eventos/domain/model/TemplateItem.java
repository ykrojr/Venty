package com.saas.eventos.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "template_itens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private TemplateCardapio template;

    @OneToMany(mappedBy = "templateItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<TemplateSubProduto> subprodutos = new java.util.ArrayList<>();
}
