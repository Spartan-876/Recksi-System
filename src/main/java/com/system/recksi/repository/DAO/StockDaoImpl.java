package com.system.recksi.repository.DAO;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

@Repository
public class StockDaoImpl implements StockDao {

    @PersistenceContext
    private EntityManager em;

    @Override
    public Integer sumarEntradas(Long almacenId) {
        String jpql = "SELECT COALESCE(SUM(m.cantidad), 0) FROM MovimientoInventario m " +
                "WHERE m.almacenDestino.id = :id " +
                "AND m.estado = 1";

        TypedQuery<Long> query = em.createQuery(jpql, Long.class);

        query.setParameter("id", almacenId);

        return query.getSingleResult().intValue();
    }

    @Override
    public Integer sumarSalidas(Long almacenId) {
        String jpql = "SELECT COALESCE(SUM(m.cantidad), 0) FROM MovimientoInventario m " +
                "WHERE m.almacenOrigen.id = :id " +
                "AND m.estado = 1";

        TypedQuery<Long> query = em.createQuery(jpql, Long.class);
        query.setParameter("id", almacenId);

        return query.getSingleResult().intValue();
    }
}