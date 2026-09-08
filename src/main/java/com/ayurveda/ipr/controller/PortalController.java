package com.ayurveda.ipr.controller;

import com.ayurveda.ipr.portal.model.ExternalPortalsPayload;
import com.ayurveda.ipr.portal.service.ExternalPortalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller exposing live query generation and API checks for the 5 Dynamic Portals:
 * 1. ABS Clearing-House (ABSCH)
 * 2. InPASS (Indian Patent Office)
 * 3. WIPO PATENTSCOPE (Geneva)
 * 4. USPTO Patent Public Search (USA)
 * 5. Ministry of AYUSH Research Portal (India)
 */
@RestController
@RequestMapping("/api/v1/portals")
@CrossOrigin(origins = "*")
@Tag(name = "External Portals & Registries", description = "Live connectors and smart query formulators for CBD ABSCH, InPASS, WIPO PATENTSCOPE, USPTO, and AYUSH Research Portal")
public class PortalController {

    private final ExternalPortalService externalPortalService;

    public PortalController(ExternalPortalService externalPortalService) {
        this.externalPortalService = externalPortalService;
    }

    /**
     * GET /api/v1/portals/lookup?query=Ashwagandha
     * Returns real-time IRCC compliance permits, InPASS boolean syntax, 1-click WIPO URLs,
     * USPTO 35 U.S.C. 101 guidance, and AYUSH clinical evidence links.
     */
    @GetMapping("/lookup")
    @Operation(
            summary = "Lookup all 5 external portals",
            description = "Fetches live UN CBD IRCC permits for India, generates InPASS Boolean search syntax, constructs 1-click WIPO PATENTSCOPE deep-links, provides USPTO 35 U.S.C. 101 Product of Nature guidance, and maps AYUSH clinical trial evidence.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Composite payload from all 5 external portals",
                            content = @Content(schema = @Schema(implementation = ExternalPortalsPayload.class))
                    )
            }
    )
    public ResponseEntity<ExternalPortalsPayload> lookupPortals(
            @Parameter(description = "Botanical plant name, Sanskrit name, or formulation keyword (e.g. 'Ashwagandha', 'Curcuma', 'Tulsi')", example = "Ashwagandha")
            @RequestParam(defaultValue = "Ashwagandha") String query) {
        ExternalPortalsPayload payload = externalPortalService.resolveAllPortals(query);
        return ResponseEntity.ok(payload);
    }
}
