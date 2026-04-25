package com.chargequest.customException;

public class PaymentException extends RuntimeException{
public PaymentException(String message) {
	super(message);
}
}
