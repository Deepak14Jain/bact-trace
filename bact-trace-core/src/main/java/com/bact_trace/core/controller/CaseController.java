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

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/cases")
@CrossOrigin(origins = "*")
public class CaseController {

    @Autowired
    private CaseRepository caseRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_AI_URL = "http://localhost:8000/analyze"; 

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientCase> createCase(
            @RequestParam("audio") MultipartFile audio,
            @RequestParam("image") MultipartFile image,
            
            // Basic Info
            @RequestParam("patientName") String patientName,
            @RequestParam("age") int age,
            @RequestParam("gender") String gender,
            @RequestParam("village") String village,
            @RequestParam(value = "doctorId", defaultValue = "DOC-MOBILE") String doctorId,

            // --- NEW: ROBUST AI FIELDS ---
            @RequestParam(value = "temperature", defaultValue = "98.6") String temperature,
            @RequestParam(value = "symptomsDays", defaultValue = "1") String symptomsDays,
            @RequestParam(value = "hasPhlegm", defaultValue = "No") String hasPhlegm,
            @RequestParam(value = "breathingDifficulty", defaultValue = "No") String breathingDifficulty,
            
            // --- NEW: GEOLOCATION ---
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude
    ) {
        System.out.println("⚠️ Orchestrator: Processing Case for " + patientName);

        // 1. CALL PYTHON AI (Include Clinical Data for "Robust" Analysis)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("audio", audio.getResource());
        body.add("image", image.getResource());
        
        // Pass Context to Python
        body.add("age", String.valueOf(age));
        body.add("temperature", temperature);
        body.add("symptomsDays", symptomsDays);
        body.add("hasPhlegm", hasPhlegm);
        body.add("breathingDifficulty", breathingDifficulty);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        System.out.println("...Forwarding Clinical Data to Python AI...");
        Map<String, Object> aiResult = restTemplate.postForObject(PYTHON_AI_URL, requestEntity, Map.class);
        
        System.out.println("✅ AI Result: " + aiResult);

        // 2. SAVE TO DB
        PatientCase newCase = new PatientCase();
        newCase.setDoctorId(doctorId);
        newCase.setPatientName(patientName);
        newCase.setAge(age);
        newCase.setGender(gender);
        newCase.setVillageName(village);
        newCase.setCountryCode("IN");

        // Save New Fields
        newCase.setTemperature(temperature);
        newCase.setSymptomsDays(symptomsDays);
        newCase.setHasPhlegm(hasPhlegm);
        newCase.setBreathingDifficulty(breathingDifficulty);
        newCase.setLatitude(latitude);
        newCase.setLongitude(longitude);

        if (aiResult != null) {
            newCase.setCoughDiagnosis((String) aiResult.get("coughDiagnosis"));
            newCase.setCoughConfidence((Double) aiResult.get("coughConfidence"));
            newCase.setVisualDiagnosis((String) aiResult.get("visualDiagnosis"));
            newCase.setFinalRecommendation((String) aiResult.get("finalRecommendation"));
        }

        caseRepository.save(newCase);

        return ResponseEntity.ok(newCase);
    }

    @GetMapping("/ping")
    public String ping() { return "Core Online"; }

    @GetMapping("/analytics")
    public ResponseEntity<List<PatientCase>> getAllCases() {
        // Return all cases so the map can plot them
        // In a real app, you would filter by date (e.g., "Last 30 Days")
        List<PatientCase> cases = caseRepository.findAll();
        return ResponseEntity.ok(cases);
    }
}