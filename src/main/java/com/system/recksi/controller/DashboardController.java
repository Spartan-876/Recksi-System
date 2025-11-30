package com.system.recksi.controller;

import com.system.recksi.service.Implementaciones.UsuarioService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    private final UsuarioService usuarioService;

    public DashboardController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/")
    public String mostrarDashboard(Model model) {

        long totalUsuarios = usuarioService.contarUsuarios();

        model.addAttribute("totalUsuarios", totalUsuarios);

        return "index";
    }
}