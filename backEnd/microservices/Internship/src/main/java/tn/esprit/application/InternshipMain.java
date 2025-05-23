package tn.esprit.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;



@SpringBootApplication
@EnableDiscoveryClient
public class InternshipMain {

	public static void main(String[] args) {
		SpringApplication.run(InternshipMain.class, args);
	}
}
