package com.system.recksi.repository;

import com.system.recksi.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario,Long> {

    List<MovimientoInventario> findAllByEstadoNot(Integer estado);

    Long countByEstadoNot(Integer estado);

    @Query("SELECT m FROM MovimientoInventario m WHERE " +
            "m.estado = 1 " +
            "AND (:fechaInicio IS NULL OR m.fechaHora >= :fechaInicio) " +
            "AND (:fechaFin IS NULL OR m.fechaHora <= :fechaFin) " +
            "AND (:tipoId IS NULL OR m.tipoMovimiento.id = :tipoId) " +
            "AND (:usuarioId IS NULL OR m.usuario.id = :usuarioId) " +
            "AND (:almacenId IS NULL OR (m.almacenOrigen.id = :almacenId OR m.almacenDestino.id = :almacenId))"
    )
    List<MovimientoInventario> buscarConFiltros(
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            @Param("tipoId") Long tipoId,
            @Param("usuarioId") Long usuarioId,
            @Param("almacenId") Long almacenId
    );

}
