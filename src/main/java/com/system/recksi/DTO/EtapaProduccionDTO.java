package com.system.recksi.DTO;

public class EtapaProduccionDTO {

    private String nombreEtapa;
    private Integer cantidadActual;
    private Integer stockMinimo;
    private String estado;
    private String colorBootstrap;
    private String icono;

    public EtapaProduccionDTO() {
    }

    public EtapaProduccionDTO(String nombreEtapa, Integer cantidadActual, Integer stockMinimo) {
        this.nombreEtapa = nombreEtapa;
        this.cantidadActual = cantidadActual;
        this.stockMinimo = stockMinimo;
    }

    public String getNombreEtapa() {
        return nombreEtapa;
    }

    public void setNombreEtapa(String nombreEtapa) {
        this.nombreEtapa = nombreEtapa;
    }

    public Integer getCantidadActual() {
        return cantidadActual;
    }

    public void setCantidadActual(Integer cantidadActual) {
        this.cantidadActual = cantidadActual;
    }

    public Integer getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(Integer stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getColorBootstrap() {
        return colorBootstrap;
    }

    public void setColorBootstrap(String colorBootstrap) {
        this.colorBootstrap = colorBootstrap;
    }

    public String getIcono() {
        return icono;
    }

    public void setIcono(String icono) {
        this.icono = icono;
    }
}
