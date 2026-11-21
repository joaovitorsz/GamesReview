package com.grev.gamesreview.repository;

import com.grev.gamesreview.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface GameRepository extends JpaRepository<Game, Long> {

    @Query(value = """
            SELECT * FROM games g
            WHERE (CAST(:titulo AS text) IS NULL OR REGEXP_REPLACE(g.titulo, '\\s+', '', 'g') ~* CAST(:titulo AS text))
                AND (CAST(:genero AS text) IS NULL OR REGEXP_REPLACE(g.genero, '\\s+', '', 'g') ~* CAST(:genero AS text))
                AND (CAST(:metacritic AS integer) IS NULL OR g.metacritic = CAST(:metacritic AS integer))
                ORDER BY g.id
                """, nativeQuery = true)

    List<Game> filtrar(
            @Param("titulo") String titulo,
            @Param("genero") String genero,
            @Param("metacritic") Integer metacritic);
}
