# Configuration Guide

This comprehensive guide covers all configuration options for GripDay, from basic setup to advanced enterprise configurations. Learn how to customize the platform for your specific needs.

## 🎯 Configuration Overview

GripDay uses a hierarchical configuration system that supports multiple environments and deployment scenarios:

- **Environment Variables**: Runtime configuration for deployment-specific settings
- **Configuration Files**: YAML/Properties files for complex configurations
- **Kubernetes ConfigMaps**: Cloud-native configuration management
- **Database Settings**: Persistent configuration stored in the database
- **Feature Flags**: Runtime feature toggles and A/B testing

## 🔧 Basic Configuration

### Environment Variables

#### Core Application Settings

```bash
# Application Environment
ENVIRONMENT=development|staging|production
LOG_LEVEL=DEBUG|INFO|WARN|ERROR
SERVER_PORT=8080

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gripday
POSTGRES_USER=gripday_user
POSTGRES_PASSWORD=your-secure-password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_SECURITY_PROTOCOL=PLAINTEXT
```

#### Security Configuration

```bash
# JWT Settings
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRATION_MS=86400000  # 24 hours
JWT_REFRESH_EXPIRATION_MS=604800000  # 7 days

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=*
CORS_ALLOW_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_CAPACITY=100
```

### Configuration Files

#### Application Configuration (application.yml)

```yaml
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /api/v1

spring:
  application:
    name: gripday-platform

  profiles:
    active: ${ENVIRONMENT:development}

  datasource:
    url: jdbc:postgresql://${POSTGRES_HOST:localhost}:${POSTGRES_PORT:5432}/${POSTGRES_DB:gripday}
    username: ${POSTGRES_USER:gripday_user}
    password: ${POSTGRES_PASSWORD:password}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    database: ${REDIS_DB:0}
    timeout: 2000ms

  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: gripday-consumer-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer

logging:
  level:
    com.gripday: ${LOG_LEVEL:INFO}
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

## 📧 Email Configuration

### SMTP Configuration

```bash
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_TLS_ENABLED=true
SMTP_SSL_ENABLED=false
SMTP_AUTH_ENABLED=true
SMTP_STARTTLS_ENABLED=true

# Email Provider Selection
EMAIL_PROVIDER=smtp|sendgrid|mailjet|ses
```

### Email Provider Configurations

#### SendGrid Configuration

```bash
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Company Name
```

#### Mailjet Configuration

```bash
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key
MAILJET_FROM_EMAIL=noreply@yourdomain.com
MAILJET_FROM_NAME=Your Company Name
```

#### Amazon SES Configuration

```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-west-2
SES_FROM_EMAIL=noreply@yourdomain.com
SES_FROM_NAME=Your Company Name
```

### Email Configuration in YAML

```yaml
email:
  provider: ${EMAIL_PROVIDER:smtp}
  from:
    email: ${FROM_EMAIL:noreply@yourdomain.com}
    name: ${FROM_NAME:GripDay Platform}

  smtp:
    host: ${SMTP_HOST:localhost}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USERNAME:}
    password: ${SMTP_PASSWORD:}
    tls: ${SMTP_TLS_ENABLED:true}
    ssl: ${SMTP_SSL_ENABLED:false}

  sendgrid:
    api-key: ${SENDGRID_API_KEY:}

  mailjet:
    api-key: ${MAILJET_API_KEY:}
    secret-key: ${MAILJET_SECRET_KEY:}

  ses:
    access-key: ${AWS_ACCESS_KEY_ID:}
    secret-key: ${AWS_SECRET_ACCESS_KEY:}
    region: ${AWS_REGION:us-west-2}
```

## 💾 Storage Configuration

### File Storage Options

```bash
# Storage Type Selection
STORAGE_TYPE=local|s3|gcs|azure

# Local Storage
STORAGE_LOCAL_PATH=/var/lib/gripday/uploads
STORAGE_LOCAL_MAX_FILE_SIZE=10MB

# Amazon S3
AWS_S3_BUCKET=your-gripday-bucket
AWS_S3_REGION=us-west-2
AWS_S3_ACCESS_KEY=your-s3-access-key
AWS_S3_SECRET_KEY=your-s3-secret-key

# Google Cloud Storage
GCS_BUCKET=your-gripday-bucket
GCS_PROJECT_ID=your-project-id
GCS_CREDENTIALS_PATH=/path/to/service-account.json

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=yourstorageaccount
AZURE_STORAGE_KEY=your-storage-key
AZURE_CONTAINER=gripday-files
```

### Storage Configuration in YAML

```yaml
storage:
  type: ${STORAGE_TYPE:local}
  max-file-size: ${STORAGE_MAX_FILE_SIZE:10MB}

  local:
    path: ${STORAGE_LOCAL_PATH:/var/lib/gripday/uploads}

  s3:
    bucket: ${AWS_S3_BUCKET:}
    region: ${AWS_S3_REGION:us-west-2}
    access-key: ${AWS_S3_ACCESS_KEY:}
    secret-key: ${AWS_S3_SECRET_KEY:}

  gcs:
    bucket: ${GCS_BUCKET:}
    project-id: ${GCS_PROJECT_ID:}
    credentials-path: ${GCS_CREDENTIALS_PATH:}

  azure:
    account: ${AZURE_STORAGE_ACCOUNT:}
    key: ${AZURE_STORAGE_KEY:}
    container: ${AZURE_CONTAINER:gripday-files}
```

## 🔒 Security Configuration

### Authentication Settings

```yaml
security:
  jwt:
    secret: ${JWT_SECRET:your-super-secret-jwt-key}
    expiration: ${JWT_EXPIRATION_MS:86400000}
    refresh-expiration: ${JWT_REFRESH_EXPIRATION_MS:604800000}
    issuer: ${JWT_ISSUER:gripday.com}

  password:
    min-length: 8
    require-uppercase: true
    require-lowercase: true
    require-numbers: true
    require-special-chars: true
    max-attempts: 5
    lockout-duration: 300000 # 5 minutes

  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:*}
    allowed-methods: ${CORS_ALLOWED_METHODS:GET,POST,PUT,DELETE,OPTIONS}
    allowed-headers: ${CORS_ALLOWED_HEADERS:*}
    allow-credentials: ${CORS_ALLOW_CREDENTIALS:true}
    max-age: 3600

  rate-limiting:
    enabled: ${RATE_LIMIT_ENABLED:true}
    requests-per-minute: ${RATE_LIMIT_REQUESTS_PER_MINUTE:60}
    burst-capacity: ${RATE_LIMIT_BURST_CAPACITY:100}
```

### SSL/TLS Configuration

```yaml
server:
  ssl:
    enabled: ${SSL_ENABLED:false}
    key-store: ${SSL_KEYSTORE_PATH:}
    key-store-password: ${SSL_KEYSTORE_PASSWORD:}
    key-store-type: ${SSL_KEYSTORE_TYPE:PKCS12}
    key-alias: ${SSL_KEY_ALIAS:gripday}
```

## ☸️ Kubernetes Configuration

### ConfigMap Example

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gripday-config
  namespace: gripday
data:
  application.yml: |
    server:
      port: 8080

    spring:
      profiles:
        active: production
      
      datasource:
        url: jdbc:postgresql://postgres-service:5432/gripday
        username: gripday_user
      
      redis:
        host: redis-service
        port: 6379
      
      kafka:
        bootstrap-servers: kafka-service:9092

    logging:
      level:
        com.gripday: INFO
        root: WARN
```

### Secret Management

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: gripday-secrets
  namespace: gripday
type: Opaque
stringData:
  postgres-password: your-secure-password
  redis-password: your-redis-password
  jwt-secret: your-super-secret-jwt-key-minimum-32-characters
  smtp-password: your-smtp-password
  sendgrid-api-key: your-sendgrid-api-key
```

### Deployment Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gripday-api-gateway
spec:
  template:
    spec:
      containers:
        - name: api-gateway
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "production"
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: gripday-secrets
                  key: postgres-password
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: gripday-secrets
                  key: jwt-secret
          volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: gripday-config
```

## 🎛️ Feature Flags

### Feature Flag Configuration

```yaml
features:
  registration:
    enabled: ${ENABLE_REGISTRATION:true}
    description: "Allow new user registration"

  email-verification:
    enabled: ${ENABLE_EMAIL_VERIFICATION:false}
    description: "Require email verification for new accounts"

  multi-tenant:
    enabled: ${ENABLE_MULTI_TENANT:false}
    description: "Enable multi-tenant functionality"

  advanced-analytics:
    enabled: ${ENABLE_ADVANCED_ANALYTICS:false}
    description: "Enable advanced analytics features"

  ai-features:
    enabled: ${ENABLE_AI_FEATURES:false}
    description: "Enable AI-powered features"
```

### Runtime Feature Toggles

```java
@Component
public class FeatureFlags {

    @Value("${features.registration.enabled:true}")
    private boolean registrationEnabled;

    @Value("${features.email-verification.enabled:false}")
    private boolean emailVerificationEnabled;

    public boolean isRegistrationEnabled() {
        return registrationEnabled;
    }

    public boolean isEmailVerificationEnabled() {
        return emailVerificationEnabled;
    }
}
```

## 📊 Monitoring Configuration

### Actuator Configuration

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,env
      base-path: /actuator

  endpoint:
    health:
      show-details: when-authorized
      show-components: always

    metrics:
      enabled: true

    prometheus:
      enabled: true

  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: ${spring.application.name}
      environment: ${ENVIRONMENT:development}
```

### Logging Configuration

```yaml
logging:
  level:
    com.gripday: ${LOG_LEVEL:INFO}
    org.springframework.security: WARN
    org.springframework.web: WARN
    org.hibernate.SQL: WARN
    org.hibernate.type.descriptor.sql.BasicBinder: WARN

  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId:-},%X{spanId:-}] %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId:-},%X{spanId:-}] %logger{36} - %msg%n"

  file:
    name: ${LOG_FILE_PATH:/var/log/gripday/application.log}
    max-size: 100MB
    max-history: 30
    total-size-cap: 1GB
```

## 🔧 Performance Tuning

### Database Connection Pool

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: ${DB_POOL_MAX_SIZE:20}
      minimum-idle: ${DB_POOL_MIN_IDLE:5}
      connection-timeout: ${DB_CONNECTION_TIMEOUT:30000}
      idle-timeout: ${DB_IDLE_TIMEOUT:600000}
      max-lifetime: ${DB_MAX_LIFETIME:1800000}
      leak-detection-threshold: ${DB_LEAK_DETECTION:60000}
```

### JVM Configuration

```bash
# JVM Memory Settings
JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# JVM Performance Settings
JAVA_OPTS="$JAVA_OPTS -XX:+UseStringDeduplication"
JAVA_OPTS="$JAVA_OPTS -XX:+OptimizeStringConcat"
JAVA_OPTS="$JAVA_OPTS -XX:+UseCompressedOops"

# JVM Monitoring
JAVA_OPTS="$JAVA_OPTS -XX:+FlightRecorder"
JAVA_OPTS="$JAVA_OPTS -XX:+UnlockDiagnosticVMOptions"
JAVA_OPTS="$JAVA_OPTS -XX:+DebugNonSafepoints"
```

### Kafka Configuration

```yaml
spring:
  kafka:
    producer:
      batch-size: ${KAFKA_BATCH_SIZE:16384}
      linger-ms: ${KAFKA_LINGER_MS:5}
      buffer-memory: ${KAFKA_BUFFER_MEMORY:33554432}
      compression-type: ${KAFKA_COMPRESSION:snappy}
      retries: ${KAFKA_RETRIES:3}
      acks: ${KAFKA_ACKS:all}

    consumer:
      max-poll-records: ${KAFKA_MAX_POLL_RECORDS:500}
      fetch-min-size: ${KAFKA_FETCH_MIN_SIZE:1024}
      fetch-max-wait: ${KAFKA_FETCH_MAX_WAIT:500}
      session-timeout: ${KAFKA_SESSION_TIMEOUT:30000}
      heartbeat-interval: ${KAFKA_HEARTBEAT_INTERVAL:3000}
```

## 🌍 Environment-Specific Configurations

### Development Environment

```yaml
# application-development.yml
spring:
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update

  h2:
    console:
      enabled: true

logging:
  level:
    com.gripday: DEBUG
    org.springframework.web: DEBUG

features:
  registration:
    enabled: true
  email-verification:
    enabled: false
```

### Staging Environment

```yaml
# application-staging.yml
spring:
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate

logging:
  level:
    com.gripday: INFO
    root: WARN

features:
  registration:
    enabled: true
  email-verification:
    enabled: true
```

### Production Environment

```yaml
# application-production.yml
spring:
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate

logging:
  level:
    com.gripday: WARN
    root: ERROR

features:
  registration:
    enabled: true
  email-verification:
    enabled: true
  multi-tenant:
    enabled: true
```

## 📋 Configuration Validation

### Configuration Validation

```java
@ConfigurationProperties(prefix = "gripday")
@Validated
public class GripDayProperties {

    @NotBlank
    @Size(min = 32)
    private String jwtSecret;

    @Min(1)
    @Max(86400)
    private int jwtExpirationHours = 24;

    @Email
    private String fromEmail;

    @Valid
    private EmailProperties email = new EmailProperties();

    @Valid
    private StorageProperties storage = new StorageProperties();

    // Getters and setters
}
```

### Health Checks

```java
@Component
public class GripDayHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        // Check database connectivity
        // Check Redis connectivity
        // Check Kafka connectivity
        // Check external service availability

        return Health.up()
            .withDetail("database", "UP")
            .withDetail("redis", "UP")
            .withDetail("kafka", "UP")
            .build();
    }
}
```

## 🔄 Configuration Management Best Practices

### Security Best Practices

- Never store secrets in configuration files
- Use environment variables or secret management systems
- Rotate secrets regularly
- Use strong encryption for sensitive data
- Implement proper access controls

### Environment Management

- Use separate configurations for each environment
- Validate configurations on startup
- Implement configuration drift detection
- Use infrastructure as code for consistency
- Document all configuration changes

### Monitoring & Alerting

- Monitor configuration changes
- Alert on configuration validation failures
- Track configuration drift
- Monitor application health after changes
- Implement rollback procedures

---

_This configuration guide provides comprehensive coverage of all GripDay configuration options. For specific deployment scenarios, refer to the [Installation Guide](/installation) and [Deployment Architecture](/architecture/deployment)._
