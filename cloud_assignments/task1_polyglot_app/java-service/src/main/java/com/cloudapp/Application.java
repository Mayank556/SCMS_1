package com.cloudapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Document(collection = "tasks")
class Task {
    @Id
    private String id;
    private String title;
    private String description;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

interface TaskRepository extends MongoRepository<Task, String> {}

@RestController
@CrossOrigin(origins = "*")
class CloudController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${python.service.url:http://localhost:8000/analyze}")
    private String pythonServiceUrl;

    @GetMapping("/")
    public String healthCheck() {
        return "Java Orchestrator is Running!";
    }

    @GetMapping("/tasks")
    public List<Task> getTasks() {
        return taskRepository.findAll();
    }

    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }

    @PostMapping("/analyze-task")
    public Map<String, Object> analyzeTask(@RequestBody Task task) {
        try {
            return restTemplate.postForObject(pythonServiceUrl, task, Map.class);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Python service unavailable at " + pythonServiceUrl);
            errorResponse.put("details", e.getMessage());
            return errorResponse;
        }
    }
}
