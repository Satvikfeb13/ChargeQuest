package com.chargequest.customException;

public class ResourceNotFoundException  extends RuntimeException{
	public ResourceNotFoundException(String message) {
	super(message);
}
}
