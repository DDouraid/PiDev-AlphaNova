package tn.esprit.documents;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class DocumentsApplication {
	public static void main(String[] args) {
		SpringApplication.run(DocumentsApplication.class, args);
	}
}