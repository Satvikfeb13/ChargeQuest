package com.chargequest.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.chargequest.tempdto.ApiResponse;
import com.chargequest.tempdto.ResponseStatus;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component // spring bean
@RequiredArgsConstructor
public class CustomJwtVerificationFilter extends OncePerRequestFilter {
	private final JwtUtils jwtUtils;
	private final ObjectMapper objectMapper;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		try {
			// 1. Check for Authorization header in the incoming request -> get its value
			String authHeader = request.getHeader("Authorization");
			if (authHeader != null && authHeader.startsWith("Bearer ")) {
				String jwt = authHeader.substring(7).trim();
				// 2. validate token
				Claims claims = jwtUtils.validateToken(jwt);
				// 3. Create authentication object - user id & user role -
				// extract the claims
//				Long userId = ((Number) claims.get("user_id")).longValue();
		        Long userId = Long.valueOf(claims.get("user_id").toString());
				String role = claims.get("user_role", String.class);
				List<SimpleGrantedAuthority> grantedAuthorities = List.of(new SimpleGrantedAuthority("ROLE_"+ role));
				// 4. add these details UserPrincipal
				UserPrincipal principal = new UserPrincipal(userId, claims.getSubject(), null, grantedAuthorities, role);
				Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null,
						grantedAuthorities);
				// 5. store Authentication object under spring security context
				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
			// delegate request handling to the next filter in the chain
			filterChain.doFilter(request, response);
		} catch (Exception e) {
			e.printStackTrace();
			SecurityContextHolder.clearContext();// important
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType("application/json");
			ApiResponse resp= new ApiResponse(e.getMessage(), ResponseStatus.FAILED);
			response.getWriter().write(objectMapper.writeValueAsString(resp));
			return;
		}

	}
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

}
