package com.saas.eventos.exception;

public class EventoNotFoundException extends RuntimeException {
    public EventoNotFoundException(Long id) {
        super("Evento com ID " + id + " não foi encontrado.");
    }
}
