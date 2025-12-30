package com.bact_trace.core.controller;

import com.bact_trace.core.model.PatientCase;
import com.bact_trace.core.repository.CaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
@CrossOrigin(origins = "*")
public class CaseController {

    @Autowired
    private CaseRepository caseRepository;

    // We use RestTemplate to talk to Python
    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_AI_URL = "http://localhost:8000/analyze"; 

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientCase> createCase(
            @RequestParam("audio") MultipartFile audio,
            @RequestParam("image") MultipartFile image,
            @RequestParam("patientName") String patientName,
            @RequestParam("age") int age,
            @RequestParam("gender") String gender,
            @RequestParam("village") String village
    ) {
        System.out.println("⚠️ Orchestrator: Received files for " + patientName);

        // 1. CALL PYTHON AI
        // We forward the files to the Python Service
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("audio", audio.getResource());
        body.add("image", image.getResource());

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        System.out.println("...Forwarding to Python AI...");
        Map<String, Object> aiResult = restTemplate.postForObject(PYTHON_AI_URL, requestEntity, Map.class);
        
        System.out.println("✅ AI Result: " + aiResult);

        // 2. SAVE TO DB
        PatientCase newCase = new PatientCase();
        newCase.setDoctorId("DOC-001");
        newCase.setPatientName(patientName);
        newCase.setAge(age);
        newCase.setGender(gender);
        newCase.setVillageName(village);
        newCase.setCountryCode("IN");

        // Map AI results to Java Object
        newCase.setCoughDiagnosis((String) aiResult.get("coughDiagnosis"));
        newCase.setCoughConfidence((Double) aiResult.get("coughConfidence"));
        newCase.setVisualDiagnosis((String) aiResult.get("visualDiagnosis"));
        newCase.setFinalRecommendation((String) aiResult.get("finalRecommendation"));

        caseRepository.save(newCase);

        return ResponseEntity.ok(newCase);
    }

    @GetMapping("/ping")
    public String ping() { return "Core Online"; }
}