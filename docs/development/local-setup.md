# Local Development Setup

This detailed guide walks you through setting up a complete GripDay development environment on your local machine. Choose between Docker Compose for quick development or Minikube for production-like Kubernetes development.

## 🎯 Setup Options Comparison

| Approach           | Best For                                    | Setup Time | Production Similarity | Resource Usage   |
| ------------------ | ------------------------------------------- | ---------- | --------------------- | ---------------- |
| **Docker Compose** | Quick development, service testing          | 10 minutes | Low                   | Low (4GB RAM)    |
| **Minikube**       | Kubernetes development, integration testing | 30 minutes | High                  | Medium (8GB RAM) |
| **Kind**           | CI/CD testing, lightweight K8s              | 20 minutes | High                  | Low (6GB RAM)    |

## 🐳 Docker Compose Setup

Perfect for rapid development and testing individual microservices.

### Prerequisites

```bash
# Required Software
- Docker Desktop 4.20+ (with Docker Compose V2)
- Git 2.40+
- Java 21+ (for local development)
- Node.js 18+ (for frontend development)
- Make (optional, for convenience commands)

# System Requirements
- CPU: 4+ cores
- Memory: 8GB RAM minimum
- Storage: 20GB free space
- OS: Windows 10/11, macOS 10.15+, or Linux
```

### Step-by-Step Setup

#### 1. Clone Repository

```bash
git clone https://github.com/GripDay/gripday.git gripday-platform
cd gripday-platform
```

#### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration (required)
nano .env
```

**Essential Environment Variables:**

```bash
# Database Configuration
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_USER=gripday_user
POSTGRES_DB=gripday

# JWT Security (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRATION_MS=86400000

# Redis Configuration
REDIS_PASSWORD=your-redis-password-here

# Email Configuration (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application Settings
ENVIRONMENT=development
LOG_LEVEL=DEBUG
ENABLE_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=false
```

#### 3. Create Docker Network

```bash
# Create dedicated network for GripDay services
docker network create gripday-network
```

#### 4. Start Infrastructure Services

```bash
# Start databases, message queue, and caching
docker-compose -f docker/infrastructure.yml up -d

# Verify infrastructure is running
docker-compose -f docker/infrastructure.yml ps

# Check service health
./scripts/health-check-infrastructure.sh
```

**Infrastructure Services Started:**

- **PostgreSQL Clusters**: Auth, Contact, Email, Campaign, Analytics databases
- **Redis**: Caching and session management
- **Apache Kafka**: Event streaming with Zookeeper
- **Schema Registry**: Kafka schema management

#### 5. Start Application Services

```bash
# Start all microservices
docker-compose -f docker/services.yml up -d

# Or start services individually for development
docker-compose -f docker/services.yml up -d user-service
docker-compose -f docker/services.yml up -d contact-service
docker-compose -f docker/services.yml up -d email-service
```

**Application Services Started:**

- **API Gateway**: Service orchestration (port 8080)
- **User Service**: Authentication and authorization (port 8081)
- **Contact Service**: Contact management (port 8082)
- **Email Service**: Email marketing (port 8083)
- **Campaign Service**: Campaign automation (port 8084)
- **Form Service**: Form builder (port 8085)
- **Scoring Service**: Lead scoring (port 8086)
- **Analytics Service**: Analytics and reporting (port 8087)

#### 6. Start Frontend Application

```bash
# Start React frontend
docker-compose -f docker/frontend.yml up -d

# Or run locally for development
cd frontend/web-app
pnpm install
pnpm run dev
```

#### 7. Start Monitoring Stack

```bash
# Start monitoring and observability
docker-compose -f docker/monitoring.yml up -d
```

**Monitoring Services:**

- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Dashboards and visualization (port 3001)
- **Jaeger**: Distributed tracing (port 16686)
- **Elasticsearch**: Log storage and search (port 9200)
- **Kibana**: Log analysis and visualization (port 5601)

### Development Workflow

#### Service Development

```bash
# View logs for specific service
docker-compose logs -f contact-service

# Restart service after code changes
docker-compose restart contact-service

# Rebuild service with changes
docker compose up --build -d contact-service

# Execute into service container
docker-compose exec contact-service bash
```

#### Database Management

```bash
# Connect to specific database
docker-compose exec postgres-contacts psql -U gripday_user -d gripday_contacts

# Run database migrations
docker-compose exec contact-service ./mvnw liquibase:update

# Reset database (data loss!)
docker-compose exec postgres-contacts psql -U gripday_user -d gripday_contacts -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

#### Kafka Management

```bash
# List Kafka topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Create topic
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --create --topic test-topic --partitions 3 --replication-factor 1

# Consume messages
docker-compose exec kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic contact.events --from-beginning
```

### Access Points

- **🌐 Web Application**: http://localhost:3000
- **🔌 API Gateway**: http://localhost:8080
- **📊 Grafana**: http://localhost:3001 (admin/admin)
- **🔍 Jaeger**: http://localhost:16686
- **📈 Prometheus**: http://localhost:9090
- **📋 Kibana**: http://localhost:5601
- **🔧 API Documentation**: http://localhost:8080/swagger-ui.html

## ☸️ Minikube Setup

Recommended for Kubernetes-native development that mirrors production deployment.

### Prerequisites

```bash
# Required Software
- Minikube 1.31+
- kubectl 1.28+
- Helm 3.12+
- Docker Desktop
- Git 2.40+

# System Requirements
- CPU: 4+ cores (8+ recommended)
- Memory: 16GB RAM minimum
- Storage: 50GB free space
- Virtualization: Enabled in BIOS
```

### Step-by-Step Setup

#### 1. Install Minikube and Tools

```bash
# Install Minikube (Linux)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installations
minikube version
kubectl version --client
helm version
```

#### 2. Start Minikube Cluster

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
minikube addons enable registry

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

#### 3. Install Kubernetes Operators

```bash
# Install CloudNativePG Operator for PostgreSQL
kubectl apply -f https://raw.githubusercontent.com/cloudnative-pg/cloudnative-pg/release-1.21/releases/cnpg-1.21.0.yaml

# Install Strimzi Kafka Operator
kubectl create namespace kafka
kubectl apply -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka

# Install Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# Verify operators are running
kubectl get pods -A | grep -E "(cnpg|strimzi|prometheus)"
```

#### 4. Deploy Infrastructure

```bash
# Deploy PostgreSQL clusters
kubectl apply -f k8s/infrastructure/postgresql-clusters.yaml

# Deploy Kafka cluster
kubectl apply -f k8s/infrastructure/kafka-cluster.yaml

# Deploy Redis cluster
kubectl apply -f k8s/infrastructure/redis-cluster.yaml

# Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l app=postgres-auth --timeout=300s
kubectl wait --for=condition=ready pod -l app=kafka --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis --timeout=300s
```

#### 5. Deploy GripDay Services

```bash
# Install GripDay Helm chart
helm install gripday ./k8s/helm/gripday-services \
  --namespace gripday \
  --create-namespace \
  --values k8s/helm/values-development.yaml

# Wait for services to be ready
kubectl wait --for=condition=available deployment --all -n gripday --timeout=600s

# Check deployment status
kubectl get pods -n gripday
kubectl get services -n gripday
```

#### 6. Configure Ingress

```bash
# Apply ingress configuration
kubectl apply -f k8s/ingress/development-ingress.yaml

# Get Minikube IP
minikube ip

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
echo "$(minikube ip) gripday.local api.gripday.local app.gripday.local" | sudo tee -a /etc/hosts
```

### Minikube Development Workflow

#### Service Management

```bash
# View all pods
kubectl get pods -n gripday

# View service logs
kubectl logs -f deployment/contact-service -n gripday

# Port forward for local access
kubectl port-forward svc/api-gateway 8080:8080 -n gripday &
kubectl port-forward svc/grafana 3000:3000 -n monitoring &

# Scale service
kubectl scale deployment contact-service --replicas=3 -n gripday

# Restart deployment
kubectl rollout restart deployment/contact-service -n gripday
```

#### Development Debugging

```bash
# Execute into pod
kubectl exec -it deployment/contact-service -n gripday -- bash

# Port forward for debugging
kubectl port-forward pod/contact-service-xxx 5005:5005 -n gripday

# View resource usage
kubectl top pods -n gripday
kubectl top nodes
```

#### Configuration Updates

```bash
# Update ConfigMap
kubectl create configmap gripday-config --from-file=application.yml --dry-run=client -o yaml | kubectl apply -f -

# Update Secret
kubectl create secret generic gripday-secrets \
  --from-literal=postgres-password=newpassword \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart services to pick up changes
kubectl rollout restart deployment -n gripday
```

### Access Points (Minikube)

- **🌐 Web Application**: http://app.gripday.local
- **🔌 API Gateway**: http://api.gripday.local
- **📊 Grafana**: http://localhost:3000 (admin/prom-operator)
- **🔍 Jaeger**: http://localhost:16686
- **📈 Prometheus**: http://localhost:9090
- **📋 Kibana**: http://localhost:5601
- **☸️ Kubernetes Dashboard**: `minikube dashboard`

## 🛠️ IDE Configuration

### IntelliJ IDEA Setup

#### Required Plugins

```bash
# Install these plugins:
- Spring Boot
- Kubernetes
- Docker
- Database Tools and SQL
- Lombok
- SonarLint
```

#### Project Configuration

```bash
# Import project
File → Open → Select gripday-platform directory

# Configure JDK
File → Project Structure → Project → Project SDK → Add JDK → Select Java 21

# Configure Maven
File → Settings → Build Tools → Maven → Maven home directory

# Configure Docker
File → Settings → Build Tools → Docker → Connect to Docker daemon
```

#### Run Configurations

```xml
<!-- .idea/runConfigurations/Contact_Service.xml -->
<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="Contact Service" type="SpringBootApplicationConfigurationType">
    <option name="SPRING_BOOT_MAIN_CLASS" value="com.gripday.contact.ContactServiceApplication" />
    <option name="ALTERNATIVE_JRE_PATH" />
    <option name="SHORTEN_COMMAND_LINE" value="NONE" />
    <option name="ENABLE_DEBUG_MODE" value="false" />
    <option name="ENABLE_LAUNCH_OPTIMIZATION" value="true" />
    <option name="HIDE_BANNER" value="false" />
    <envs>
      <env name="SPRING_PROFILES_ACTIVE" value="development" />
      <env name="POSTGRES_HOST" value="localhost" />
      <env name="POSTGRES_PORT" value="5433" />
      <env name="REDIS_HOST" value="localhost" />
      <env name="KAFKA_BOOTSTRAP_SERVERS" value="localhost:9092" />
    </envs>
    <method v="2">
      <option name="Make" enabled="true" />
    </method>
  </configuration>
</component>
```

### VS Code Setup

#### Required Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "vscjava.vscode-java-pack",
    "pivotal.vscode-spring-boot",
    "ms-kubernetes-tools.vscode-kubernetes-tools",
    "ms-azuretools.vscode-docker",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

#### Workspace Configuration

```json
// .vscode/settings.json
{
  "java.configuration.updateBuildConfiguration": "automatic",
  "java.compile.nullAnalysis.mode": "automatic",
  "java.format.settings.url": "https://raw.githubusercontent.com/google/styleguide/gh-pages/eclipse-java-google-style.xml",
  "spring-boot.ls.problem.application-properties.enabled": true,
  "kubernetes.defaultNamespace": "gripday",
  "docker.defaultRegistryPath": "localhost:5000"
}
```

#### Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Debug Contact Service",
      "request": "launch",
      "mainClass": "com.gripday.contact.ContactServiceApplication",
      "projectName": "contact-service",
      "env": {
        "SPRING_PROFILES_ACTIVE": "development",
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5433",
        "REDIS_HOST": "localhost",
        "KAFKA_BOOTSTRAP_SERVERS": "localhost:9092"
      },
      "vmArgs": "-Dspring.profiles.active=development"
    }
  ]
}
```

## 🔧 Service Development

### Creating a New Microservice

#### 1. Generate Service Structure

```bash
# Use the service generator script
./scripts/create-service.sh my-new-service

# This creates:
# services/my-new-service/
# ├── src/main/java/com/gripday/mynewservice/
# ├── src/main/resources/
# ├── src/test/
# ├── Dockerfile
# ├── pom.xml
# └── README.md
```

#### 2. Service Template Structure

```
my-new-service/
├── src/main/java/com/gripday/mynewservice/
│   ├── MyNewServiceApplication.java      # Main application class
│   ├── config/                           # Configuration classes
│   │   ├── DatabaseConfig.java
│   │   ├── KafkaConfig.java
│   │   └── SecurityConfig.java
│   ├── controller/                       # REST controllers
│   │   └── MyNewServiceController.java
│   ├── service/                          # Business logic
│   │   ├── MyNewServiceService.java
│   │   └── impl/
│   ├── repository/                       # Data access
│   │   └── MyNewServiceRepository.java
│   ├── entity/                           # JPA entities
│   │   └── MyNewServiceEntity.java
│   ├── dto/                              # Data transfer objects
│   │   ├── MyNewServiceDto.java
│   │   └── CreateMyNewServiceRequest.java
│   └── event/                            # Event handlers
│       ├── MyNewServiceEventPublisher.java
│       └── MyNewServiceEventHandler.java
├── src/main/resources/
│   ├── application.yml                   # Configuration
│   ├── application-development.yml       # Dev configuration
│   ├── db/migration/                     # Liquibase migrations
│   │   └── V1__Create_initial_schema.sql
│   └── static/                           # Static resources
└── src/test/                             # Tests
    ├── java/
    └── resources/
```

#### 3. Basic Service Implementation

```java
// MyNewServiceApplication.java
@SpringBootApplication
@EnableJpaRepositories
@EnableKafka
@EnableScheduling
public class MyNewServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyNewServiceApplication.class, args);
    }
}

// MyNewServiceController.java
@RestController
@RequestMapping("/api/v1/mynewservice")
@Validated
@Tag(name = "My New Service", description = "My new service operations")
public class MyNewServiceController {

    private final MyNewServiceService service;

    public MyNewServiceController(MyNewServiceService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List entities", description = "Retrieve a paginated list of entities")
    public ResponseEntity<PagedResponse<MyNewServiceDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PagedResponse<MyNewServiceDto> entities = service.findAll(page, size);
        return ResponseEntity.ok(entities);
    }

    @PostMapping
    @Operation(summary = "Create entity", description = "Create a new entity")
    public ResponseEntity<MyNewServiceDto> create(
            @Valid @RequestBody CreateMyNewServiceRequest request) {

        MyNewServiceDto entity = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(entity);
    }
}
```

### Database Migrations

#### Creating Migrations

```bash
# Create new migration file
touch services/my-service/src/main/resources/db/migration/V1.1.0__Add_new_feature.sql
```

#### Migration Example

```sql
-- V1.1.0__Add_scoring_fields.sql
-- Description: Add scoring fields to support lead qualification

-- Add scoring columns
ALTER TABLE contacts
ADD COLUMN score INTEGER DEFAULT 0,
ADD COLUMN score_updated_at TIMESTAMP,
ADD COLUMN qualification_status VARCHAR(20) DEFAULT 'unqualified';

-- Create indexes for performance
CREATE INDEX idx_contacts_score ON contacts(score DESC);
CREATE INDEX idx_contacts_qualification_status ON contacts(qualification_status);

-- Add constraints
ALTER TABLE contacts
ADD CONSTRAINT chk_contacts_score CHECK (score >= 0 AND score <= 1000),
ADD CONSTRAINT chk_contacts_qualification_status
    CHECK (qualification_status IN ('unqualified', 'marketing_qualified', 'sales_qualified', 'customer'));

-- Update existing contacts
UPDATE contacts
SET score = 0,
    score_updated_at = CURRENT_TIMESTAMP,
    qualification_status = 'unqualified'
WHERE score IS NULL;
```

#### Running Migrations

```bash
# Run migrations for specific service
cd services/contact-service
./mvnw liquibase:update

# Or via Docker
docker-compose exec contact-service ./mvnw liquibase:update


```

### Event-Driven Development

#### Publishing Events

```java
@Service
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;
    private final EventPublisher eventPublisher;

    public ContactDto createContact(CreateContactRequest request) {
        // Create and save contact
        Contact contact = Contact.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail())
            .tenantId(TenantContext.getTenantId())
            .build();

        Contact savedContact = contactRepository.save(contact);

        // Publish domain event
        ContactCreatedEvent event = ContactCreatedEvent.builder()
            .contactId(savedContact.getId())
            .email(savedContact.getEmail())
            .tenantId(savedContact.getTenantId())
            .timestamp(Instant.now())
            .build();

        eventPublisher.publishContactCreated(event);

        return ContactDto.from(savedContact);
    }
}
```

#### Consuming Events

```java
@Component
@Slf4j
public class ContactEventHandler {

    private final AnalyticsService analyticsService;
    private final CampaignService campaignService;

    @KafkaListener(topics = "contact.events", groupId = "campaign-service")
    public void handleContactEvent(ContactCreatedEvent event) {
        log.info("Processing contact created event: {}", event.getContactId());

        try {
            // Set tenant context
            TenantContext.setTenantId(event.getTenantId());

            // Update analytics
            analyticsService.recordContactCreated(event);

            // Trigger welcome campaign
            campaignService.triggerWelcomeCampaign(event.getContactId());

        } catch (Exception e) {
            log.error("Error processing contact event: {}", event.getContactId(), e);
            throw e; // Trigger retry
        } finally {
            TenantContext.clear();
        }
    }
}
```

## 🧪 Testing in Development

### Unit Testing

```java
@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private EventPublisher eventPublisher;

    @InjectMocks
    private ContactService contactService;

    @Test
    @DisplayName("Should create contact successfully")
    void shouldCreateContactSuccessfully() {
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

        verify(eventPublisher).publishContactCreated(any(ContactCreatedEvent.class));
    }
}
```

### Integration Testing

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class ContactControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.4.0"));

    @Autowired
    private TestRestTemplate restTemplate;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Test
    void shouldCreateContactViaAPI() {
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

# View coverage report
open services/contact-service/target/site/jacoco/index.html
```

## 🔍 Debugging and Troubleshooting

### Common Development Issues

#### Service Startup Issues

```bash
# Check service logs
docker-compose logs contact-service

# Check database connectivity
docker-compose exec postgres-contacts pg_isready -U gripday_user

# Check Kafka connectivity
docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Restart problematic service
docker-compose restart contact-service
```

#### Database Issues

```bash
# Connect to database
docker-compose exec postgres-contacts psql -U gripday_user -d gripday_contacts

# Check database size
SELECT pg_size_pretty(pg_database_size('gripday_contacts'));

# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

# Reset database (development only!)
docker-compose exec postgres-contacts psql -U gripday_user -d gripday_contacts -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

#### Kafka Issues

```bash
# List topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check consumer groups
docker-compose exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Check consumer lag
docker-compose exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group gripday-consumer-group

# Reset consumer group (development only!)
docker-compose exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --reset-offsets --to-earliest --group gripday-consumer-group --all-topics --execute
```

### Performance Debugging

#### Application Performance

```bash
# Check JVM metrics
curl http://localhost:8082/actuator/metrics/jvm.memory.used

# Check HTTP metrics
curl http://localhost:8082/actuator/metrics/http.server.requests

# Generate heap dump
curl -X POST http://localhost:8082/actuator/heapdump

# Check thread dump
curl http://localhost:8082/actuator/threaddump
```

#### Database Performance

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'contacts';

-- Check table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 📚 Development Best Practices

### Code Quality

- **Follow Google Java Style Guide** for consistent formatting
- **Write comprehensive tests** with >80% coverage
- **Use meaningful commit messages** following conventional commits
- **Document public APIs** with OpenAPI annotations
- **Implement proper error handling** with custom exceptions

### Performance

- **Use connection pooling** for database connections
- **Implement caching** for frequently accessed data
- **Optimize database queries** with proper indexing
- **Use async processing** for non-blocking operations
- **Monitor resource usage** during development

### Security

- **Never commit secrets** to version control
- **Use environment variables** for configuration
- **Implement input validation** for all endpoints
- **Follow security best practices** for authentication and authorization
- **Regular dependency updates** for security patches

---

_This local development setup guide provides everything you need to start developing GripDay microservices. For production deployment, see the [Deployment Architecture](/architecture/deployment) guide._
