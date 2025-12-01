package com.system.recksi.controller;

import com.system.recksi.repository.MovimientoInventarioRepository;
import com.system.recksi.service.Interfaces.ReportesService;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    private final ReportesService reportesService;
    private final MovimientoInventarioRepository movimientoInventarioRepository;

    public DashboardController(ReportesService reportesService, MovimientoInventarioRepository movimientoInventarioRepository) {
        this.reportesService = reportesService;
        this.movimientoInventarioRepository = movimientoInventarioRepository;
    }

    @GetMapping("/")
    public String mostrarDashboard(Model model) {

        List<Long> idsAgua = Arrays.asList(1L, 2L, 3L);
        model.addAttribute("embudoAgua", reportesService.obtenerDatosEmbudo(idsAgua));
        model.addAttribute("ultimosMovimientos", movimientoInventarioRepository.findTop5ByOrderByFechaHoraDesc());

        return "index";
    }
}