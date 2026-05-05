package com.saas.eventos.exception;

public class AcessoNegadoException extends RuntimeException {
    public AcessoNegadoException() {
        super("Você não tem permissão para acessar este recurso.");
    }

    public AcessoNegadoException(String recurso) {
        super("Sem permissão para acessar: " + recurso);
    }
}
