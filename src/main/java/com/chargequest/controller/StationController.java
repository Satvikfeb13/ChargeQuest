	package com.chargequest.controller;
	
	import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chargequest.service.StationService;
import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.StationRequestDTO;
import com.chargequest.tempdto.StationResponseDTO;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
	
	@RestController
	@RequestMapping("/api/v1/stations")
	@RequiredArgsConstructor
	@SecurityRequirement(name = "bearerAuth")
	public class StationController {
		private final StationService stationService;
		@GetMapping
		public ResponseEntity<List<StationResponseDTO>> getAllStations(){
			return ResponseEntity.ok(stationService.getAllStations());
		}
		
		@GetMapping("/{id}")
		public  ResponseEntity<StationResponseDTO>getStationById(@PathVariable @Min(1) Long id){
			return ResponseEntity.ok(stationService.getStationById(id));
		}
		 	@PostMapping
		    @PreAuthorize("hasRole('ADMIN')")
		    public ResponseEntity<ApiResponse> addStation(@Valid @RequestBody StationRequestDTO request) {
		        return ResponseEntity.ok(stationService.addStation(request));
		    }
	
		    @PutMapping("/{id}")
		    @PreAuthorize("hasRole('ADMIN')")
		    public ResponseEntity<ApiResponse> updateStation(
		            @PathVariable Long id,
		            @RequestBody StationRequestDTO request) {
		        return ResponseEntity.ok(stationService.updateStation(id, request));
		    }
	
		    @DeleteMapping("/{id}")
		    @PreAuthorize("hasRole('ADMIN')")
		    public ResponseEntity<ApiResponse> deleteStation(@PathVariable Long id) {
		        return ResponseEntity.ok(stationService.deleteStation(id));
		    }
		    
		    @PatchMapping("/{id}/maintenance")
		    @PreAuthorize("hasRole('ADMIN')")
		    public ResponseEntity<String> setMaintenance(@PathVariable Long id) {
		        stationService.setMaintenanceMode(id);
		        return ResponseEntity.ok("Station set to maintenance");
		    }
		
	
	}
