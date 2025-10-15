# Getting Started

Welcome to GripDay development! This guide will help you set up your development environment and start contributing to the open-core B2B marketing automation platform.

## 🎯 Quick Start Decision Matrix

| Use Case                         | Recommended Approach   | Setup Time | Production Similarity |
| -------------------------------- | ---------------------- | ---------- | --------------------- |
| **Initial Development**          | Docker Compose         | 10 minutes | Low                   |
| **Service Integration Testing**  | Minikube (Recommended) | 30 minutes | High                  |
| **Kubernetes Learning**          | Minikube               | 30 minutes | High                  |
| **Production-Ready Development** | Minikube               | 30 minutes | Very High             |
| **CI/CD Pipeline Testing**       | Minikube               | 30 minutes | Very High             |

> **💡 Cloud-Native Recommendation**: Use Minikube for development to leverage Kubernetes' built-in service discovery instead of legacy solutions like Eureka. This ensures dev/prod parity and follows modern cloud-native practices.

## 📋 Prerequisites

### Required Software

```bash
# Core Development Tools
- Git 2.40+
- Java 25+ (OpenJDK or Oracle JDK)
- Node.js 18+ with npm/pnpm
- Docker Desktop 4.20+
- kubectl 1.28+

# Recommended for Kubernetes Development
- Minikube 1.31+
- Helm 3.12+
- k9s (Kubernetes CLI UI)

# Optional but Helpful
- IntelliJ IDEA or VS Code
- Postman or Insomnia (API testing)
- DBeaver (Database management)
```

### System Requirements

- **CPU**: 4+ cores (8+ recommended for Kubernetes)
- **Memory**: 8GB RAM minimum (16GB+ recommended)
- **Storage**: 50GB+ free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux

## 🚀 Option 1: Quick Start with Docker Compose

Perfect for initial development and testing individual services.

### 1. Clone the Repository

```bash
git clone https://github.com/gripday/gripday-platform.git
cd gripday-platform
```

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, Kafka, and monitoring
./scripts/docker-dev.sh start-infrastructure

# Verify services are running
./scripts/docker-dev.sh status
```

### 3. Start Core Services

```bash
# Start all microservices
./scripts/docker-dev.sh start-services

# Or start individual services for development
./scripts/docker-dev.sh start auth-service
./scripts/docker-dev.sh start contact-service
```

### 4. Access the Platform

- **API Gateway**: http://localhost:8080
- **Grafana**: http://localhost:3000 (admin/gripday_admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

### 5. Development Workflow

```bash
# View logs for specific service
./scripts/docker-dev.sh logs auth-service

# Restart service after changes
./scripts/docker-dev.sh restart auth-service

# Stop everything
./scripts/docker-dev.sh stop
```

## ☸️ Option 2: Kubernetes Development with Minikube

Recommended for production-like development and learning cloud-native patterns.

### 1. Start Minikube Cluster

```bash
# Start Minikube with adequate resources
minikube start \
  --driver=docker \
  --cpus=4 \
  --memory=8192 \
  --disk-size=50g \
  --kubernetes-version=v1.28.0

# Enable necessary addons
minikube addons enable ingress
minikube addons enable metrics-server
minikube addons enable dashboard
```

### 2. Install Kubernetes Operators

```bash
# Install required operators for GripDay
./scripts/k8s-setup.sh install-operators

# Verify operators are running
kubectl get pods -A | grep -E "(cnpg|strimzi|prometheus)"
```

### 3. Deploy Infrastructure

```bash
# Deploy PostgreSQL clusters, Kafka, Redis
./scripts/k8s-setup.sh deploy-infrastructure

# Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l app=postgres-auth --timeout=300s
kubectl wait --for=condition=ready pod -l app=kafka --timeout=300s
```

### 4. Deploy GripDay Services

```bash
# Deploy all microservices
helm install gripday ./k8s/helm/gripday-services

# Or deploy individual services for development
helm install auth-service ./k8s/helm/gripday-services \
  --set services.authService.enabled=true \
  --set services.contactService.enabled=false
```

### 5. Access Services

```bash
# Get Minikube IP
minikube ip

# Port forward for local access
kubectl port-forward svc/api-gateway 8080:8080
kubectl port-forward svc/grafana 3000:3000

# Or use Minikube tunnel for LoadBalancer services
minikube tunnel
```

## 🛠️ Development Environment Setup

### IDE Configuration

#### IntelliJ IDEA

```bash
# Install required plugins
- Spring Boot
- Kubernetes
- Docker
- Database Tools and SQL

# Import project
File → Open → Select gripday-platform directory
```

#### VS Code

```bash
# Install recommended extensions
- Extension Pack for Java
- Spring Boot Extension Pack
- Kubernetes
- Docker
- REST Client

# Open project
code gripday-platform
```

### Environment Variables

Create `.env` file in project root:

```bash
# Database Configuration
POSTGRES_USER=gripday_user
POSTGRES_PASSWORD=gripday_pass
POSTGRES_DB=gripday

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=gripday_redis_pass

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION_MS=86400000

# Email Configuration (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🏗️ Project Structure

```
gripday-platform/
├── services/                    # Microservices
│   ├── api-gateway/            # Spring Cloud Gateway
│   ├── auth-service/           # Authentication & Authorization
│   ├── contact-service/        # Contact Management
│   ├── email-service/          # Email Marketing
│   ├── campaign-service/       # Campaign Automation
│   ├── form-service/           # Form Builder
│   ├── scoring-service/        # Lead Scoring
│   └── analytics-service/      # Analytics & Reporting
├── frontend/                   # React 19 Frontend
│   ├── web-app/               # Main web application
│   └── admin-dashboard/       # Admin interface
├── shared/                     # Shared libraries
│   ├── common/                # Common utilities
│   ├── events/                # Event definitions
│   └── security/              # Security utilities
├── infrastructure/             # Infrastructure as Code
│   ├── docker/                # Docker configurations
│   ├── k8s/                   # Kubernetes manifests
│   └── helm/                  # Helm charts
├── scripts/                   # Development scripts
├── docs/                      # Documentation
└── tests/                     # Integration tests
```

## 🔧 Service Development

### Creating a New Microservice

1. **Generate Service Template**

```bash
./scripts/create-service.sh my-new-service
cd services/my-new-service
```

2. **Service Structure**

```
my-new-service/
├── src/main/java/com/gripday/mynewservice/
│   ├── MyNewServiceApplication.java
│   ├── config/                 # Configuration classes
│   ├── controller/             # REST controllers
│   ├── service/                # Business logic
│   ├── repository/             # Data access
│   ├── entity/                 # JPA entities
│   ├── dto/                    # Data transfer objects
│   └── event/                  # Event handlers
├── src/main/resources/
│   ├── application.yml         # Configuration
│   ├── db/migration/           # Flyway migrations
│   └── static/                 # Static resources
├── src/test/                   # Tests
├── Dockerfile                  # Container image
├── pom.xml                     # Maven dependencies
└── README.md                   # Service documentation
```

3. **Basic Service Implementation**

```java
@SpringBootApplication
@EnableJpaRepositories
@EnableKafka
public class MyNewServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyNewServiceApplication.class, args);
    }
}

@RestController
@RequestMapping("/api/v1/mynewservice")
@Validated
public class MyNewServiceController {

    private final MyNewServiceService service;

    @GetMapping
    public ResponseEntity<List<MyEntityDto>> getAll() {
        List<MyEntityDto> entities = service.findAll();
        return ResponseEntity.ok(entities);
    }

    @PostMapping
    public ResponseEntity<MyEntityDto> create(@Valid @RequestBody CreateMyEntityRequest request) {
        MyEntityDto entity = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(entity);
    }
}
```

### Database Migrations

1. **Create Migration**

```bash
# Create new migration file
touch services/my-service/src/main/resources/db/migration/V1__Create_my_table.sql
```

2. **Migration Example**

```sql
-- V1__Create_contacts_table.sql
CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX idx_contacts_email ON contacts(email);
```

### Event-Driven Communication

1. **Publishing Events**

```java
@Service
public class ContactService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ContactDto createContact(CreateContactRequest request) {
        Contact contact = // ... create contact

        // Publish event
        ContactCreatedEvent event = ContactCreatedEvent.builder()
            .contactId(contact.getId())
            .email(contact.getEmail())
            .tenantId(contact.getTenantId())
            .timestamp(Instant.now())
            .build();

        kafkaTemplate.send("contact.created", event);

        return ContactDto.from(contact);
    }
}
```

2. **Consuming Events**

```java
@Component
public class ContactEventHandler {

    @KafkaListener(topics = "contact.created")
    public void handleContactCreated(ContactCreatedEvent event) {
        log.info("Processing contact created event: {}", event);

        // Process the event
        // Update analytics, trigger campaigns, etc.
    }
}
```

## 🧪 Testing

### Unit Tests

```java
@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @InjectMocks
    private ContactService contactService;

    @Test
    void shouldCreateContact() {
        // Given
        CreateContactRequest request = CreateContactRequest.builder()
            .firstName("John")
            .lastName("Doe")
            .email("john.doe@example.com")
            .build();

        Contact savedContact = Contact.builder()
            .id(1L)
            .firstName("John")
            .lastName("Doe")
            .email("john.doe@example.com")
            .build();

        when(contactRepository.save(any(Contact.class))).thenReturn(savedContact);

        // When
        ContactDto result = contactService.createContact(request);

        // Then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("john.doe@example.com");
    }
}
```

### Integration Tests

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class ContactControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldCreateContact() {
        // Given
        CreateContactRequest request = CreateContactRequest.builder()
            .firstName("John")
            .lastName("Doe")
            .email("john.doe@example.com")
            .build();

        // When
        ResponseEntity<ContactDto> response = restTemplate.postForEntity(
            "/api/v1/contacts", request, ContactDto.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getEmail()).isEqualTo("john.doe@example.com");
    }
}
```

### Running Tests

```bash
# Run all tests
./mvnw test

# Run tests for specific service
./mvnw test -pl services/contact-service

# Run integration tests
./mvnw verify -Pintegration-tests

# Run with coverage
./mvnw test jacoco:report
```

## 🔍 Debugging

### Local Debugging

```bash
# Start service in debug mode
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 \
  -jar services/contact-service/target/contact-service.jar

# Or use IDE debug configuration
```

### Kubernetes Debugging

```bash
# Port forward for debugging
kubectl port-forward pod/contact-service-xxx 5005:5005

# View logs
kubectl logs -f deployment/contact-service

# Execute into pod
kubectl exec -it pod/contact-service-xxx -- /bin/bash
```

## 📊 Monitoring & Observability

### Local Monitoring

- **Grafana**: http://localhost:3000 (admin/gripday_admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **Kibana**: http://localhost:5601

### Application Metrics

```java
@RestController
public class ContactController {

    private final MeterRegistry meterRegistry;
    private final Counter contactCreatedCounter;

    public ContactController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.contactCreatedCounter = Counter.builder("contacts.created")
            .description("Number of contacts created")
            .register(meterRegistry);
    }

    @PostMapping
    public ResponseEntity<ContactDto> createContact(@RequestBody CreateContactRequest request) {
        ContactDto contact = contactService.createContact(request);
        contactCreatedCounter.increment();
        return ResponseEntity.status(HttpStatus.CREATED).body(contact);
    }
}
```

## 🚀 Deployment

### Local Deployment

```bash
# Build all services
./mvnw clean package -DskipTests

# Build Docker images
./scripts/build-images.sh

# Deploy to local Kubernetes
helm upgrade --install gripday ./k8s/helm/gripday-services
```

### Production Deployment

```bash
# Build and push images
./scripts/build-and-push.sh

# Deploy with GitOps (ArgoCD)
kubectl apply -f k8s/argocd/applications/
```

## 📚 Next Steps

1. **[Local Development Setup](/development/local-setup)** - Detailed environment setup
2. **[Contributing Guide](/contributing)** - How to contribute to the project
3. **[Architecture Overview](/architecture/system-design)** - System design and architecture
4. **[Requirements](/requirements/functional)** - Functional and technical requirements

## 🤝 Getting Help

- **Documentation**: Browse the complete documentation
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Discord**: Join our developer community

---

_Welcome to the GripDay development community! We're excited to have you contribute to the future of open-core B2B marketing automation._
