package com.nabard.satelliteFarm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableFeignClients
public class SatelliteFarmApplication {

	public static void main(String[] args) {
		SpringApplication.run(SatelliteFarmApplication.class, args);
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**").allowedOrigins("http://localhost:5173/", "http://localhost:5173",
						"http://localhost:5174", "http://localhost:5174/","https://nabard-sigma.vercel.app/","https://nabard-sigma.vercel.app").allowedMethods("*");
			}
		};
	}

}
