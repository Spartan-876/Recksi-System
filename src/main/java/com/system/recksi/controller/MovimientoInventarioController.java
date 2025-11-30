package com.system.recksi.controller;

import com.system.recksi.DTO.FiltroMovimentoDTO;
import com.system.recksi.DTO.MovimientoInventarioDTO;
import com.system.recksi.service.Interfaces.MovimientoInventarioService;
import com.system.recksi.service.Interfaces.TipoMovimientoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/movimientoInventario")
public class MovimientoInventarioController {

    private final MovimientoInventarioService movimientoInventarioService;
    private final TipoMovimientoService tipoMovimientoService;

    public MovimientoInventarioController(MovimientoInventarioService movimientoInventarioService, TipoMovimientoService tipoMovimientoService) {
        this.movimientoInventarioService = movimientoInventarioService;
        this.tipoMovimientoService = tipoMovimientoService;
    }

    @GetMapping("/listar")
    public String mostrarPaginaMovimientosInventario() {
        return "movimientosInventario";
    }

    @GetMapping("/api/listar")
    public ResponseEntity<?> listarMovimientosInventarioApi() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", movimientoInventarioService.listarMovimientosInventario());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/buscar")
    public ResponseEntity<?> buscarMovimientosInventarioApi(@Valid @RequestBody FiltroMovimentoDTO filtro, BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();

        if (bindingResult.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errores.put(error.getField(), error.getDefaultMessage()));
            response.put("success", false);
            response.put("message", "Datos inválidos");
            response.put("errors", errores);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            response.put("success", true);
            response.put("data", movimientoInventarioService.buscarMovimientoInventario(filtro));
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        }catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error interno al buscar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

    }

    @PostMapping("/api/guardar")
    public ResponseEntity<?> guardarMovimientoInventarioApi(@Valid @RequestBody MovimientoInventarioDTO movimentoInventario, BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();

        if (bindingResult.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errores.put(error.getField(), error.getDefaultMessage()));
            response.put("success", false);
            response.put("message", "Datos inválidos");
            response.put("errors", errores);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            movimientoInventarioService.guardarMovimientoInventario(movimentoInventario);
            response.put("success", true);
            response.put("message", "Movimiento de inventario guardado");
            return ResponseEntity.ok(response);
        }catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message",e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al guardar el movimiento de inventario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/api/actualizar/{id}")
    public ResponseEntity<?> actualizarMovimientoInventarioApi(@PathVariable Long id, @Valid @RequestBody MovimientoInventarioDTO movimentoInventario, BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();
        if (bindingResult.hasErrors()) {
            Map<String, String> errores = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errores.put(error.getField(), error.getDefaultMessage()));
            response.put("success", false);
            response.put("message", "Datos inválidos");
            response.put("errors", errores);
            return ResponseEntity.badRequest().body(response);
        }
        try {
            movimientoInventarioService.actualizarMovimientoInventario(id, movimentoInventario);
            response.put("success", true);
            response.put("message", "Movimiento de inventario actualizado");
            return ResponseEntity.ok(response);
        }catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message",e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error al actualizar el movimiento de inventario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/api/eliminar/{id}")
    public ResponseEntity<?> eliminarMovimientoInventarioApi(@PathVariable Long id) {
        try {
            movimientoInventarioService.eliminarMovimientoInventario(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Movimiento de inventario eliminado");
            return ResponseEntity.ok(response);
        }catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error al eliminar el movimiento de inventario: "+e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/api/stock/{id}")
    public ResponseEntity<?> obtenerStockAlmacenApi(@PathVariable Long id) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", movimientoInventarioService.calcularStockActual(id));
            return ResponseEntity.ok(response);
        }catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error al obtener el stock del almacen: "+e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/api/TipoMovimiento")
    public ResponseEntity<?> obtenerTipoMovimientoApi() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", tipoMovimientoService.listarTipoMovimientos());
        return ResponseEntity.ok(response);
    }
}
