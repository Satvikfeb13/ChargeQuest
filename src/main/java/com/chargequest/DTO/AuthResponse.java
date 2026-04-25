package com.chargequest.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
//JWT , message
public class AuthResponse {
	private String jwt;
	private String message;
	
}
