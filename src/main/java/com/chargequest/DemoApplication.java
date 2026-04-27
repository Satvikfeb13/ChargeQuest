package com.chargequest;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.chargequest.model.Station;
import com.chargequest.model.StationCategory;
import com.chargequest.tempdto.StationCategoryRequestDTO;
import com.chargequest.tempdto.StationRequestDTO;

@EnableScheduling
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}
	
	@Bean
	public ModelMapper modelMapper() {
	    ModelMapper mapper = new ModelMapper();

	    mapper.getConfiguration()
	          .setPropertyCondition(Conditions.isNotNull())
	          .setMatchingStrategy(MatchingStrategies.STRICT);

	    mapper.typeMap(StationRequestDTO.class, Station.class)
	          .addMapping(StationRequestDTO::getStationName, Station::setStationName);

	    mapper.typeMap(StationCategoryRequestDTO.class, StationCategory.class)
	          .addMapping(
	              StationCategoryRequestDTO::getCategoryName,
	              StationCategory::setCategoryName
	          );

	    return mapper;
	}
}
	