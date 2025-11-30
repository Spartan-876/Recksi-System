package com.system.recksi.repository.DAO;

public interface StockDao {

    Integer sumarEntradas(Long almacenId);

    Integer sumarSalidas(Long almacenId);

}
