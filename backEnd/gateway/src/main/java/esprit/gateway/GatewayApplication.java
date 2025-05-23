package esprit.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("Internship",
                        r -> r.path("/api/**")
                                .uri("http://localhost:8082"))
                .route("Event",
                        r -> r.path("/api/**")
                                .uri("http://localhost:8085"))
                .route("Supervisor",
                        r -> r.path("/api/**")
                                .uri("http://localhost:8081"))
                .build();
    }
}
