package com.chargequest.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Table(
	    name = "bookings",
	    uniqueConstraints = {
	        @UniqueConstraint(
	            columnNames = {"user_id", "station_id", "start_time"}
	        )
	    }
	)
public class Booking  extends BaseEntity{
	   @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long bookingId;

	    @ManyToOne(fetch = FetchType.LAZY)
	    @JoinColumn(name = "user_id")
	    private User user;

	    @ManyToOne
	    @JoinColumn(name = "station_id")
	    private Station station;
	    private LocalDateTime startTime;
	    private LocalDateTime endTime;
	    @Enumerated(EnumType.STRING)
	    private BookingStatus bookingStatus;
	    @Enumerated(EnumType.STRING)
	    private PaymentStatus paymentStatus;
	    private Double totalAmount;
	    @Enumerated(EnumType.STRING)
	    private ConnectorType connectorTypeNeeded;
	    private Integer estimatedChargingTime;
	    private Integer chargerAssigned;
	    @OneToMany(mappedBy = "booking" )
	    private List<Payment> payments = new ArrayList<>();
}
