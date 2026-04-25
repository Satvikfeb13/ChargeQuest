package com.chargequest.config;

import java.util.List;


import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chargequest.model.User;
import com.chargequest.repository.UserRepository;

import lombok.RequiredArgsConstructor;



@Service
@Transactional
@RequiredArgsConstructor
public class CustomUserDetailsServiceImpl implements UserDetailsService {
	private final UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String email) {
		User user=userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User by this email doesn't exist!!!!!!!!"));
		//email verified
		return new UserPrincipal(user.getUserId(),
				user.getEmail(),user.getPassword(),
				List.of(new SimpleGrantedAuthority(user.getRole().name())),user.getRole().name());
	}

}
