package com.grev.gamesreview.repository;


import com.grev.gamesreview.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AvaliacoesRepository  extends JpaRepository<Avaliacao, Long> {

    @Modifying
    @Query("UPDATE Avaliacao a SET a.usuario = null WHERE a.usuario.id = :usuarioId")
    void desvincularUsuario(@Param("usuarioId") Long usuarioId);

}

