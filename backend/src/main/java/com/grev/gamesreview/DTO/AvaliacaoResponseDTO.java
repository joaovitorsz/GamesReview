package com.grev.gamesreview.DTO;

import com.grev.gamesreview.model.Avaliacao;

public record AvaliacaoResponseDTO(long id, String avaliador, Double nota, String comentario, Long gameId, String autorEmail) {
    public AvaliacaoResponseDTO(Avaliacao avaliacao) {
        this(avaliacao.getId(),
                avaliacao.getAvaliador(),
                avaliacao.getNota(),
                avaliacao.getComentario(),
                avaliacao.getGame() != null ? avaliacao.getGame().getId() : null,
                avaliacao.getUsuario() != null ? avaliacao.getUsuario().getEmail() : null
        );
    }
}
