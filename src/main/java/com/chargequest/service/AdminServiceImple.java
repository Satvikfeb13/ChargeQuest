package com.chargequest.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chargequest.customException.ResourceNotFoundException;
import com.chargequest.model.Role;
import com.chargequest.model.User;
import com.chargequest.repository.UserRepository;
import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.ResponseStatus;
import com.chargequest.tempdto.UserResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminServiceImple implements AdminService {
	private final UserRepository userRepository;
	private final ModelMapper modelMapper;
	@Override
	public List<UserResponseDTO> getAllUsers() {
		return userRepository.findAll().stream().map(user->{
			UserResponseDTO dto=modelMapper.map(user, UserResponseDTO.class);
			dto.setRole(user.getRole().name());
			return dto;
		})
		.collect(Collectors.toList());
	}

	@Override
	public ApiResponse makeUserAdmin(Long userId) {
		 User user=userRepository.
				 findById(userId).orElseThrow(()-> new ResourceNotFoundException("User Not Found"));
		 user.setRole(Role.ROLE_ADMIN);
		 userRepository.save(user);
		return new ApiResponse("User Promoted to admin", ResponseStatus.SUCCESS);
	}

	@Override
	public ApiResponse deleteUser(Long userId) {
		 User user=userRepository.
				 findById(userId).orElseThrow(()-> new ResourceNotFoundException("User Not Found"));
		 userRepository.delete(user);
		return new ApiResponse("User Deleted Successfully", ResponseStatus.SUCCESS);
	}

}
