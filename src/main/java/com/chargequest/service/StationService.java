package com.chargequest.service;

import java.util.List;

import com.chargequest.DTO.ApiResponse;
import com.chargequest.DTO.StationRequestDTO;
import com.chargequest.DTO.StationResponseDTO;

public interface StationService {
    List<StationResponseDTO> getAllStations();

    StationResponseDTO getStationById(Long stationId);

    ApiResponse addStation(StationRequestDTO request);

    ApiResponse updateStation(Long stationId, StationRequestDTO request);

    ApiResponse deleteStation(Long stationId);

	void setMaintenanceMode(Long stationId);
}
