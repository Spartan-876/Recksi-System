package com.system.recksi.repository;

import com.system.recksi.DTO.EtapaProduccionDTO;
import com.system.recksi.model.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlmacenRepository extends JpaRepository<Almacen, Long> {

    List<Almacen> findAllByEstadoNot(Integer estado);

    Optional<Almacen> findById(Long id);

    Optional<Almacen> findByNombre(String nombre);

    Long countByEstadoNot(Integer estado);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    boolean existsByNombreIgnoreCaseAndEstadoNot(String nombre, Integer estado);

    boolean existsByNombreIgnoreCaseAndIdNotAndEstadoNot(String nombre, Long id, Integer estado);

    @Query("SELECT new com.system.recksi.DTO.EtapaProduccionDTO(a.nombre, a.stockActual, a.stockMinimo) " +
            "FROM Almacen a " +
            "WHERE a.id IN :idsAlmacenes " +
            "ORDER BY a.id ASC")
    List<EtapaProduccionDTO> obtenerEmbudoProduccion(@Param("idsAlmacenes") List<Long> idsAlmacenes);

}
