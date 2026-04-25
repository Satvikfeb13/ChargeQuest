package com.chargequest.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "stations")
public class Station extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stationId;

    @Column(name = "station_name", nullable = false)
    private String stationName;

    @Column(nullable = false)
    private String address;

    private Double latitude;
    private Double longitude;
    @Enumerated(EnumType.STRING)
    private StationStatus status;
    private Double pricePerUnit;
    private String description;

    private Integer totalSlots;
    private Integer availableSlots;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private StationCategory category;
    @OneToMany(mappedBy = "station")
    private List<Booking> bookings= new ArrayList<>();
    @OneToMany(mappedBy = "station")
    private List<Review> reviews= new ArrayList<>();

}
