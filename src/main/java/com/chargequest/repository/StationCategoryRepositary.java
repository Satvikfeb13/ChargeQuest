package com.chargequest.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chargequest.model.StationCategory;

public interface StationCategoryRepositary  extends JpaRepository<StationCategory, Long> {

}
