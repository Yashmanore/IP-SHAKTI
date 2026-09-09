package com.ayurveda.ipr.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3.0 (Swagger) Configuration for IP-SHAKTI Sahayak.
 * Accessible at:
 * - Swagger UI: http://localhost:8080/swagger-ui/index.html
 * - OpenAPI JSON: http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ipShaktiOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("IP-SHAKTI Sahayak API")
                        .description("AI Assistant for Intellectual Property Rights (IPR) & Regulatory Guidance in Ayurveda.\n\n" +
                                "### Core Capabilities:\n" +
                                "- **Conversational Dialogue Orchestration**: Multi-turn dialogue with interactive clarifying chips and 5-Pillar synthesis.\n" +
                                "- **Rule 158-B Product Classification Engine**: Deterministic decision tree distinguishing Classical, Proprietary, Phytopharmaceutical, Ayurveda Aahar, and Cosmetics.\n" +
                                "- **Dual-Regime RAG (Neon pgvector)**: Vector similarity search across 27 authoritative legal PDFs and 4 curated JSON knowledge datasets.\n" +
                                "- **Live Regulatory Portals**: Connectors to UN CBD ABSCH, InPASS (IP India), WIPO PATENTSCOPE, USPTO §101, and AYUSH Research Portal.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("IP-SHAKTI Dev Team")
                                .url("https://github.com/Yashmanore/IP-SHAKTI"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8085").description("Local Development Server"),

                        new Server().url("https://ip-shakti-backend.onrender.com").description("Production Cloud Server (Render)")
                ));
    }
}
