package com.chargequest.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import com.chargequest.model.Station;
import com.chargequest.model.StationCategory;
import com.chargequest.repository.StationCategoryRepositary;
import com.chargequest.repository.StationRepository;
import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.StationRequestDTO;

@ExtendWith(MockitoExtension.class)
class StationServiceImplTest {

    @Mock
    private StationRepository stationRepository;

    @Mock
    private StationCategoryRepositary stationCategoryRepository;

    @Mock
    private ModelMapper modelMapper;
    
    

    @InjectMocks
    private StationServiceImple stationService;

    @Test
    void addStation_ShouldSaveStationSuccessfully() {

        // Arrange
        StationRequestDTO request = new StationRequestDTO();
        request.setStationName("EV Station");
        request.setAddress("Pune");
        request.setPricePerUnit(15.0);
        request.setCategoryId(1L);   // IMPORTANT

        // DTO -> Entity mapped object
        Station mappedStation = new Station();
        mappedStation.setStationName("EV Station");
        mappedStation.setAddress("Pune");
        mappedStation.setPricePerUnit(15.0);

        // Category mock
        StationCategory category = new StationCategory();
        category.setCategoryId(1L);  

        // Saved station
        Station savedStation = new Station();
        savedStation.setStationId(1L);
        savedStation.setStationName("EV Station");
        savedStation.setAddress("Pune");

        // Mock behaviors
        when(modelMapper.map(any(StationRequestDTO.class), eq(Station.class)))
                .thenReturn(mappedStation);

        when(stationCategoryRepository.findById(1L))
                .thenReturn(Optional.of(category));

        when(stationRepository.save(any(Station.class)))
                .thenReturn(savedStation);

        // Act
        ApiResponse response = stationService.addStation(request);

        // Assert
        assertNotNull(response);
        assertEquals("Charging Station Added Successfully", response.getMessage());

        verify(stationCategoryRepository).findById(1L);
        verify(stationRepository).save(any(Station.class));
    }


    @Test
    void getStationById_ShouldReturnStation_WhenExists() {

        Long stationId = 1L;

        Station station = new Station();
        station.setStationId(stationId);
        station.setAddress("Pune");

        when(stationRepository.findById(stationId))
                .thenReturn(Optional.of(station));

        var result = stationService.getStationById(stationId);

        assertEquals(stationId, result.getStationId());
    }
}

