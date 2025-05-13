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
                .route("Event",
                        r->r.path("/Event/**")
                                .uri("lb://Event"))
                .route("Supervisor",
                        r->r.path("/Supervisor/**")
                                .uri("lb://Supervisor"))
                .route("Feedback",
                        r->r.path("/mic1Feedback/**")
                                .uri("lb://Feedback"))
                .route("Tasks",
                        r -> r.path("/mic1Tasks/**")
                                .uri("lb://Tasks"))
                .route("MessGroupMember",
                        r -> r.path("/messages/**")
                                .uri("lb://MessGroupMember"))
                .route("MessGroupMember",
                        r -> r.path("/groups/**")
                                .uri("lb://MessGroupMember"))
                .route("MessGroupMember",
                        r -> r.path("/group-members/**")
                                .uri("lb://MessGroupMember"))
                .route("User",
                        r->r.path("/api/auth/**")
                                .uri("lb://User"))
                .route("User",
                        r->r.path("/api/dashboard/**")
                                .uri("lb://User"))
                .route("Payment",
                        r->r.path("/api/payments/**")
                                .uri("lb://Payment"))
                .route("Payment",
                        r->r.path("/api/payment/**")
                                .uri("lb://Payment"))
                .route("Interview",
                        r->r.path("/api/interviews/**")
                                .uri("lb://Interview"))

                .route("Internship",
                        r->r.path("/**")
                                .uri("http://localhost:8089"))



                .build();
    }
}
