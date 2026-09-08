package com.ayurveda.ipr.portal.service;

import com.ayurveda.ipr.portal.model.*;
import org.springframework.stereotype.Service;

/**
 * Unified Orchestration Gateway for the 5 Dynamic Search & Regulatory Portals.
 */
@Service
public class ExternalPortalService {

    private final AbschClientService abschClientService;
    private final InpassQueryService inpassQueryService;
    private final WipoPatentscopeService wipoPatentscopeService;
    private final UsptoQueryService usptoQueryService;
    private final AyushResearchPortalService ayushResearchPortalService;

    public ExternalPortalService(AbschClientService abschClientService,
                                 InpassQueryService inpassQueryService,
                                 WipoPatentscopeService wipoPatentscopeService,
                                 UsptoQueryService usptoQueryService,
                                 AyushResearchPortalService ayushResearchPortalService) {
        this.abschClientService = abschClientService;
        this.inpassQueryService = inpassQueryService;
        this.wipoPatentscopeService = wipoPatentscopeService;
        this.usptoQueryService = usptoQueryService;
        this.ayushResearchPortalService = ayushResearchPortalService;
    }

    /**
     * Resolves all 5 external portals for a given botanical term or Ayurvedic query.
     */
    public ExternalPortalsPayload resolveAllPortals(String query) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : "Ashwagandha";

        // 1. InPASS Search Formulation
        InpassQueryResponse inpass = inpassQueryService.generateInpassQuery(cleanQuery);

        // 2. ABS Clearing-House Live REST Query
        AbschResponse absch = abschClientService.searchIndianAbsPermits(cleanQuery);

        // 3. WIPO PATENTSCOPE Deep-Link
        WipoQueryResponse wipo = wipoPatentscopeService.generateWipoDeepLink(cleanQuery, inpass.getMatchedIpcClass());

        // 4. USPTO 35 U.S.C. 101/102 Query Builder
        UsptoQueryResponse uspto = usptoQueryService.generateUsptoQuery(cleanQuery, inpass.getMatchedIpcClass());

        // 5. AYUSH Research Portal Evidence Connector
        AyushEvidenceResponse ayush = ayushResearchPortalService.mapEvidenceForFormulation(cleanQuery);

        return new ExternalPortalsPayload(cleanQuery, absch, inpass, wipo, uspto, ayush);
    }
}
