package com.chargequest.service;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogRequest {
	   private String serviceName;
	    private String level;
	    private String message;

}
