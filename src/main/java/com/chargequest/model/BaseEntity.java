package com.chargequest.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {
	
    @Column(nullable = false, updatable = false)
    @CreationTimestamp
	private LocalDateTime createdAt;
    
    @Column(nullable = false) 
    @UpdateTimestamp
	private LocalDateTime updatedAt;
    
}
