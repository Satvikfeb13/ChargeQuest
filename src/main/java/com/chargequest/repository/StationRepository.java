package com.chargequest.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chargequest.model.Station;

public interface StationRepository extends JpaRepository<Station, Long> {

}
