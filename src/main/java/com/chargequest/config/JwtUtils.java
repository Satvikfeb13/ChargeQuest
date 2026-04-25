package com.chargequest.config;

import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component //to declare a spring bean 
public class JwtUtils {
	@Value("${jwt.expiration.time}")
	private long jwtExpirationTime;
	@Value("${jwt.secret}")
	private String jwtSecret;
	private SecretKey secretKey;
	
	@PostConstruct
	public void myInit()
	{
		secretKey=Keys.hmacShaKeyFor(jwtSecret.getBytes());		 
	}
	//create JWT - header , payload, signature
	public String generateToken(UserPrincipal principal) {
		//iat  
		Date now=new Date();
		//exp
		Date expiresAt=new Date(now.getTime()+jwtExpirationTime);
		return Jwts.builder() //creates a builder fro JWT creation
					.subject(principal.getEmail()) //setting subject
					.issuedAt(now) //iat
					.expiration(expiresAt) //exp
					//custom claims - user id & user role
					.claims(Map.of("user_id",String.valueOf(principal.getUserId())
							, "user_role", principal.getUserRole().replace("ROLE_", "")))
					.signWith(secretKey, Jwts.SIG.HS256)
				.compact();
				
	}
	public Claims validateToken(String jwt) {
		return Jwts.parser() //attach a parser
				.verifyWith(secretKey)
				.build() //builds JwtsParser
				.parseSignedClaims(jwt)
				.getPayload();
		
	}

}
