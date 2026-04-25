package com.chargequest.customException;

public class AuthenticationException  extends RuntimeException{
	public AuthenticationException(String message){
		super(message);
	}

}
