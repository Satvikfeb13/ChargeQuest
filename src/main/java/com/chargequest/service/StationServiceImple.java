package com.chargequest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chargequest.DTO.ApiResponse;
import com.chargequest.DTO.ResponseStatus;
import com.chargequest.DTO.StationRequestDTO;
import com.chargequest.DTO.StationResponseDTO;
import com.chargequest.customException.ResourceNotFoundException;
import com.chargequest.model.Station;
import com.chargequest.model.StationCategory;
import com.chargequest.model.StationStatus;
import com.chargequest.repository.StationCategoryRepositary;
import com.chargequest.repository.StationRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class StationServiceImple implements StationService {
	private final StationRepository stationRepositary;
    private final StationCategoryRepositary stationCategoryRepository;
	private final ModelMapper modelMapper;
	
	private StationResponseDTO mapToDTO(Station station) {

	    StationResponseDTO dto = new StationResponseDTO();

	    dto.setStationId(station.getStationId());
	    dto.setStationName(station.getStationName());
	    dto.setAddress(station.getAddress());

	    dto.setTotalSlots(station.getTotalSlots());
	    dto.setAvailableSlots(station.getAvailableSlots());

	    // ✅ PRICE (fixes 0 issue)
	    dto.setPricePerUnit(station.getPricePerUnit());

	    // ✅ CATEGORY → TYPE
	    if (station.getCategory() != null) {
	        dto.setCategoryId(station.getCategory().getCategoryId());
	        dto.setCategoryName(station.getCategory().getCategoryName());
	    }

	    return dto;
	}

	@Override
	public List<StationResponseDTO> getAllStations() {
	    return stationRepositary.findAll()
	            .stream()
	            .map(this::mapToDTO)
	            .collect(Collectors.toList());
	}


	@Override
	public StationResponseDTO getStationById(Long stationId) {
	    Station station = stationRepositary.findById(stationId)
	            .orElseThrow(() -> new ResourceNotFoundException("Station not found"));

	    return mapToDTO(station);
	}
    @Override
    public ApiResponse addStation(StationRequestDTO request) {

        Station station = modelMapper.map(request, Station.class);
       
        station.setStatus(StationStatus.ACTIVE);
        station.setAvailableSlots(request.getTotalSlots());

        StationCategory category = stationCategoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Invalid category id"));

        station.setCategory(category);

        stationRepositary.save(station);

        return new ApiResponse(
                "Charging Station Added Successfully",
                ResponseStatus.SUCCESS
        );
    }


	@Override
	public ApiResponse updateStation(Long stationId, StationRequestDTO request) {
		Station station = stationRepositary.findById(stationId).orElseThrow(()-> new ResourceNotFoundException("Station Not Found"));
		modelMapper.map(request, station);
		stationRepositary.save(station);
		return  new ApiResponse("Charging Station Updated successfully", ResponseStatus.SUCCESS);
	}

	@Override
	public ApiResponse deleteStation(Long stationId) {
		Station station = stationRepositary.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found"));
	    station.setStatus(StationStatus.INACTIVE);
	    stationRepositary.save(station);

		return  new ApiResponse("Charging Station Removed Successfully", ResponseStatus.SUCCESS);
	}
	
	public void setMaintenanceMode(Long id) {
	    Station station = stationRepositary.findById(id)
	            .orElseThrow(() -> new ResourceNotFoundException("Station not found"));

	    station.setStatus(StationStatus.MAINTENANCE);
	    stationRepositary.save(station);
	}

}
