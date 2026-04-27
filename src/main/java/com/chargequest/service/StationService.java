package com.chargequest.service;

import java.util.List;

import com.chargequest.dto.ApiResponse;
import com.chargequest.dto.StationRequestDTO;
import com.chargequest.dto.StationResponseDTO;

public interface StationService {
    List<StationResponseDTO> getAllStations();

    StationResponseDTO getStationById(Long stationId);

    ApiResponse addStation(StationRequestDTO request);

    ApiResponse updateStation(Long stationId, StationRequestDTO request);

    ApiResponse deleteStation(Long stationId);

	void setMaintenanceMode(Long stationId);
}
