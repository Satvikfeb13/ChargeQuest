package com.chargequest.service;

import java.util.List;

import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.StationRequestDTO;
import com.chargequest.tempdto.StationResponseDTO;

public interface StationService {
    List<StationResponseDTO> getAllStations();

    StationResponseDTO getStationById(Long stationId);

    ApiResponse addStation(StationRequestDTO request);

    ApiResponse updateStation(Long stationId, StationRequestDTO request);

    ApiResponse deleteStation(Long stationId);

	void setMaintenanceMode(Long stationId);
}
