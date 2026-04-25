package com.chargequest.model;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "Station_categories")
public class StationCategory {
		@Id
		@GeneratedValue(strategy = GenerationType.IDENTITY)
	   private Long categoryId;
	    @Column(nullable = false)
	    private String categoryName;
	    private String connectorType;
	    private String powerOutput;
	    private String pricingModel;
	    private Integer minChargingTime;
	    private Integer maxChargingTime;
	    @OneToMany(mappedBy = "category")
	    private List<Station> stations=null;
}
