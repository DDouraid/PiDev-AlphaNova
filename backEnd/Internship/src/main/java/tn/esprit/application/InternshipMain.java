package tn.esprit.application;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import tn.esprit.application.services.InternshipServ;

import java.time.LocalDate;

@SpringBootApplication
@EnableDiscoveryClient
public class InternshipMain {

	public static void main(String[] args) {
		SpringApplication.run(InternshipMain.class, args);
	}

	@Bean
	public CommandLineRunner run(InternshipServ applicationService) {
		return args -> {
			System.out.println("Application saved successfully!");
		};
	}
}
