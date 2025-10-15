# Security Architecture

GripDay implements a comprehensive, multi-layered security architecture designed for enterprise-grade B2B marketing automation. The security model follows zero-trust principles with defense-in-depth strategies across all system components.

## 🎯 Security Principles

### Core Security Principles

- **Zero Trust Architecture**: Never trust, always verify
- **Defense in Depth**: Multiple layers of security controls
- **Principle of Least Privilege**: Minimal access rights for users and services
- **Data Protection**: Encryption at rest and in transit
- **Audit Everything**: Comprehensive logging and monitoring
- **Secure by Default**: Security built into every component

### Compliance Standards

- **GDPR**: European data protection regulation compliance
- **CCPA**: California Consumer Privacy Act compliance
- **SOC 2 Type II**: Security and availability controls
- **ISO 27001**: Information security management standards
- **OWASP**: Web application security best practices

## 🔐 Authentication & Authorization

### JWT-Based Authentication

**Token Structure:**

```json
{
  "header": {
    "alg": "HS512",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user123",
    "username": "john.doe",
    "email": "john.doe@example.com",
    "tenantId": "tenant123",
    "roles": ["USER", "CONTACT_MANAGER"],
    "permissions": ["CONTACT:READ", "CONTACT:WRITE", "EMAIL:READ"],
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

**JWT Implementation:**

```java
@Component
public class JwtTokenProvider {

    private final String jwtSecret;
    private final int jwtExpirationMs;
    private final int refreshTokenExpirationMs;

    public String generateAccessToken(UserPrincipal userPrincipal) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtExpirationMs);

        return Jwts.builder()
            .setSubject(userPrincipal.getId().toString())
            .claim("username", userPrincipal.getUsername())
            .claim("email", userPrincipal.getEmail())
            .claim("tenantId", userPrincipal.getTenantId())
            .claim("roles", userPrincipal.getRoles())
            .claim("permissions", userPrincipal.getPermissions())
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public String generateRefreshToken(UserPrincipal userPrincipal) {
        Date expiryDate = new Date(System.currentTimeMillis() + refreshTokenExpirationMs);

        return Jwts.builder()
            .setSubject(userPrincipal.getId().toString())
            .claim("type", "refresh")
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return !isTokenBlacklisted(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}
```

### Role-Based Access Control (RBAC)

**Permission Model:**

```java
@Entity
@Table(name = "permissions")
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "CONTACT:READ"

    @Column(nullable = false)
    private String resource; // e.g., "CONTACT"

    @Column(nullable = false)
    private String action; // e.g., "READ", "WRITE", "DELETE"

    private String description;
}

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "CONTACT_MANAGER"

    private String description;

    @Column(name = "tenant_id")
    private String tenantId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();
}
```

**Authorization Implementation:**

```java
@Component
public class AuthorizationService {

    @PreAuthorize("hasPermission(#resource, #action)")
    public boolean hasPermission(String resource, String action) {
        UserPrincipal user = getCurrentUser();
        String permission = resource + ":" + action;

        return user.getPermissions().contains(permission);
    }

    @PreAuthorize("hasRole(#role)")
    public boolean hasRole(String role) {
        UserPrincipal user = getCurrentUser();
        return user.getRoles().contains(role);
    }

    @PreAuthorize("@authorizationService.canAccessTenant(#tenantId)")
    public boolean canAccessTenant(String tenantId) {
        UserPrincipal user = getCurrentUser();
        return user.getTenantId().equals(tenantId);
    }
}
```

### Multi-Factor Authentication (MFA)

**TOTP Implementation:**

```java
@Service
public class MfaService {

    public String generateSecretKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return Base32.encode(bytes);
    }

    public String generateQrCodeUrl(String username, String secretKey) {
        return String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s",
            "GripDay", username, secretKey, "GripDay"
        );
    }

    public boolean validateTotp(String secretKey, String code) {
        long timeWindow = System.currentTimeMillis() / 30000;

        // Check current window and adjacent windows for clock skew
        for (int i = -1; i <= 1; i++) {
            String expectedCode = generateTotp(secretKey, timeWindow + i);
            if (code.equals(expectedCode)) {
                return true;
            }
        }
        return false;
    }
}
```

## 🛡️ Network Security

### Istio Service Mesh Security

**mTLS Configuration:**

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: gripday
spec:
  mtls:
    mode: STRICT

---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: gripday-authz
  namespace: gripday
spec:
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/gripday/sa/api-gateway"]
      to:
        - operation:
            methods: ["GET", "POST", "PUT", "DELETE"]
    - from:
        - source:
            principals: ["cluster.local/ns/gripday/sa/contact-service"]
      to:
        - operation:
            methods: ["GET", "POST"]
      when:
        - key: request.headers[x-tenant-id]
          values: ["*"]
```

### Network Policies

**Kubernetes Network Policies:**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: gripday-network-policy
  namespace: gripday
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: istio-system
        - namespaceSelector:
            matchLabels:
              name: gripday
      ports:
        - protocol: TCP
          port: 8080

  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: gripday
      ports:
        - protocol: TCP
          port: 5432 # PostgreSQL
        - protocol: TCP
          port: 6379 # Redis
        - protocol: TCP
          port: 9092 # Kafka
    - to: []
      ports:
        - protocol: TCP
          port: 443 # HTTPS outbound
        - protocol: TCP
          port: 53 # DNS
        - protocol: UDP
          port: 53 # DNS
```

### API Gateway Security

**Rate Limiting:**

```java
@Configuration
public class RateLimitingConfig {

    @Bean
    public RedisRateLimiter redisRateLimiter() {
        return new RedisRateLimiter(
            100,  // replenishRate: tokens per second
            200,  // burstCapacity: maximum tokens
            1     // requestedTokens: tokens per request
        );
    }

    @Bean
    public KeyResolver tenantKeyResolver() {
        return exchange -> {
            String tenantId = extractTenantId(exchange.getRequest());
            String clientIp = getClientIp(exchange.getRequest());
            return Mono.just(tenantId + ":" + clientIp);
        };
    }
}
```

**CORS Configuration:**

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(getAllowedOrigins());
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
```

## 🔒 Data Security

### Encryption at Rest

**Database Encryption:**

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-auth
spec:
  postgresql:
    parameters:
      ssl: "on"
      ssl_cert_file: "/etc/ssl/certs/server.crt"
      ssl_key_file: "/etc/ssl/private/server.key"
      ssl_ca_file: "/etc/ssl/certs/ca.crt"
      # Enable transparent data encryption
      shared_preload_libraries: "pg_tde"
      pg_tde.keyring_configuration: "/etc/postgresql/keyring.conf"
```

**Application-Level Encryption:**

```java
@Component
public class EncryptionService {

    private final AESUtil aesUtil;
    private final String encryptionKey;

    @Value("${app.encryption.key}")
    public void setEncryptionKey(String key) {
        this.encryptionKey = key;
        this.aesUtil = new AESUtil(key);
    }

    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        try {
            return aesUtil.encrypt(plainText);
        } catch (Exception e) {
            log.error("Encryption failed", e);
            throw new SecurityException("Encryption failed");
        }
    }

    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }
        try {
            return aesUtil.decrypt(encryptedText);
        } catch (Exception e) {
            log.error("Decryption failed", e);
            throw new SecurityException("Decryption failed");
        }
    }
}

@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    @Autowired
    private EncryptionService encryptionService;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return encryptionService.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return encryptionService.decrypt(dbData);
    }
}
```

### Encryption in Transit

**TLS Configuration:**

```yaml
# Istio Gateway TLS
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: gripday-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: gripday-tls-secret
      hosts:
        - "*.gripday.com"
    - port:
        number: 80
        name: http
        protocol: HTTP
      hosts:
        - "*.gripday.com"
      tls:
        httpsRedirect: true
```

### Data Masking and Anonymization

**PII Protection:**

```java
@Component
public class DataMaskingService {

    public String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }

        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];

        if (username.length() <= 2) {
            return "**@" + domain;
        }

        return username.substring(0, 2) + "***@" + domain;
    }

    public String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) {
            return phone;
        }

        return "***-***-" + phone.substring(phone.length() - 4);
    }

    public String anonymizeData(String data, String dataType) {
        switch (dataType.toLowerCase()) {
            case "email":
                return maskEmail(data);
            case "phone":
                return maskPhone(data);
            case "name":
                return "Anonymous User";
            default:
                return "***";
        }
    }
}
```

## 🔍 Input Validation & Sanitization

### Request Validation

**Input Validation:**

```java
@RestController
@RequestMapping("/api/v1/contacts")
@Validated
public class ContactController {

    @PostMapping
    public ResponseEntity<ContactDto> createContact(
            @Valid @RequestBody CreateContactRequest request) {

        // Additional custom validation
        validateContactRequest(request);

        ContactDto contact = contactService.createContact(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(contact);
    }

    private void validateContactRequest(CreateContactRequest request) {
        // Email validation
        if (!EmailValidator.getInstance().isValid(request.getEmail())) {
            throw new ValidationException("Invalid email format");
        }

        // Phone validation
        if (request.getPhone() != null && !isValidPhoneNumber(request.getPhone())) {
            throw new ValidationException("Invalid phone number format");
        }

        // XSS prevention
        if (containsHtmlTags(request.getFirstName()) ||
            containsHtmlTags(request.getLastName())) {
            throw new ValidationException("HTML tags not allowed in name fields");
        }
    }
}

@Component
public class InputSanitizer {

    private final Policy policy;

    public InputSanitizer() {
        this.policy = new PolicyFactory().sanitize();
    }

    public String sanitizeHtml(String input) {
        if (input == null) {
            return null;
        }
        return policy.sanitize(input);
    }

    public String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }

        // Remove potential SQL injection patterns
        String sanitized = input.replaceAll("(?i)(union|select|insert|update|delete|drop|create|alter)", "");

        // Remove script tags and javascript
        sanitized = sanitized.replaceAll("(?i)<script[^>]*>.*?</script>", "");
        sanitized = sanitized.replaceAll("(?i)javascript:", "");

        return sanitized.trim();
    }
}
```

### SQL Injection Prevention

**Parameterized Queries:**

```java
@Repository
public class ContactRepository {

    @Query("SELECT c FROM Contact c WHERE c.tenantId = :tenantId AND " +
           "(:search IS NULL OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Contact> findByTenantIdAndSearch(
            @Param("tenantId") String tenantId,
            @Param("search") String search,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Contact c SET c.status = :status WHERE c.id = :id AND c.tenantId = :tenantId")
    int updateContactStatus(
            @Param("id") Long id,
            @Param("status") ContactStatus status,
            @Param("tenantId") String tenantId);
}
```

## 🏢 Multi-Tenant Security

### Tenant Isolation

**Tenant Context Management:**

```java
@Component
public class TenantContext {

    private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();

    public static void setTenantId(String tenantId) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new SecurityException("Tenant ID cannot be null or empty");
        }
        TENANT_ID.set(tenantId);
    }

    public static String getTenantId() {
        String tenantId = TENANT_ID.get();
        if (tenantId == null) {
            throw new SecurityException("No tenant context available");
        }
        return tenantId;
    }

    public static void clear() {
        TENANT_ID.remove();
    }
}

@Component
public class TenantInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                           HttpServletResponse response,
                           Object handler) {

        String tenantId = extractTenantId(request);
        if (tenantId == null) {
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return false;
        }

        // Validate tenant access
        if (!isValidTenant(tenantId)) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            return false;
        }

        TenantContext.setTenantId(tenantId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                              HttpServletResponse response,
                              Object handler, Exception ex) {
        TenantContext.clear();
    }
}
```

### Row-Level Security

**Database RLS Implementation:**

```sql
-- Enable row-level security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
CREATE POLICY tenant_isolation_contacts ON contacts
    FOR ALL
    TO application_role
    USING (tenant_id = current_setting('app.current_tenant'));

CREATE POLICY tenant_isolation_companies ON companies
    FOR ALL
    TO application_role
    USING (tenant_id = current_setting('app.current_tenant'));

-- Set tenant context in application
SET app.current_tenant = 'tenant123';
```

## 📊 Security Monitoring & Auditing

### Audit Logging

**Comprehensive Audit Trail:**

```java
@Component
@Slf4j
public class AuditLogger {

    private final AuditLogRepository auditLogRepository;

    @EventListener
    @Async
    public void handleSecurityEvent(SecurityEvent event) {
        AuditLog auditLog = AuditLog.builder()
            .eventType(event.getEventType())
            .userId(event.getUserId())
            .tenantId(event.getTenantId())
            .resourceType(event.getResourceType())
            .resourceId(event.getResourceId())
            .action(event.getAction())
            .result(event.getResult())
            .ipAddress(event.getIpAddress())
            .userAgent(event.getUserAgent())
            .additionalData(event.getAdditionalData())
            .timestamp(Instant.now())
            .build();

        auditLogRepository.save(auditLog);

        // Send to SIEM if critical event
        if (event.isCritical()) {
            siemService.sendAlert(auditLog);
        }
    }
}

@Aspect
@Component
public class AuditAspect {

    @Around("@annotation(Auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        Auditable auditable = getAuditableAnnotation(joinPoint);

        SecurityEvent.SecurityEventBuilder eventBuilder = SecurityEvent.builder()
            .eventType(auditable.eventType())
            .action(auditable.action())
            .resourceType(auditable.resourceType())
            .userId(getCurrentUserId())
            .tenantId(getCurrentTenantId())
            .ipAddress(getCurrentIpAddress())
            .userAgent(getCurrentUserAgent());

        try {
            Object result = joinPoint.proceed();

            eventBuilder.result("SUCCESS");
            applicationEventPublisher.publishEvent(eventBuilder.build());

            return result;
        } catch (Exception e) {
            eventBuilder
                .result("FAILURE")
                .additionalData(Map.of("error", e.getMessage()));
            applicationEventPublisher.publishEvent(eventBuilder.build());

            throw e;
        }
    }
}
```

### Security Monitoring

**Real-time Security Monitoring:**

```java
@Component
public class SecurityMonitor {

    private final MeterRegistry meterRegistry;
    private final Counter failedLoginAttempts;
    private final Counter suspiciousActivities;

    public SecurityMonitor(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.failedLoginAttempts = Counter.builder("security.failed_logins")
            .description("Number of failed login attempts")
            .register(meterRegistry);
        this.suspiciousActivities = Counter.builder("security.suspicious_activities")
            .description("Number of suspicious activities detected")
            .register(meterRegistry);
    }

    @EventListener
    public void handleFailedLogin(FailedLoginEvent event) {
        failedLoginAttempts.increment(
            Tags.of(
                "tenant", event.getTenantId(),
                "ip", event.getIpAddress()
            )
        );

        // Check for brute force attacks
        if (isExcessiveFailedAttempts(event.getIpAddress())) {
            blockIpAddress(event.getIpAddress());
            alertSecurityTeam(event);
        }
    }

    @EventListener
    public void handleSuspiciousActivity(SuspiciousActivityEvent event) {
        suspiciousActivities.increment(
            Tags.of(
                "type", event.getActivityType(),
                "severity", event.getSeverity()
            )
        );

        if (event.getSeverity().equals("HIGH")) {
            alertSecurityTeam(event);
        }
    }
}
```

## 🚨 Incident Response

### Security Incident Handling

**Automated Response System:**

```java
@Component
public class IncidentResponseService {

    @EventListener
    public void handleSecurityIncident(SecurityIncidentEvent event) {
        IncidentSeverity severity = assessSeverity(event);

        switch (severity) {
            case CRITICAL:
                handleCriticalIncident(event);
                break;
            case HIGH:
                handleHighSeverityIncident(event);
                break;
            case MEDIUM:
                handleMediumSeverityIncident(event);
                break;
            case LOW:
                logIncident(event);
                break;
        }
    }

    private void handleCriticalIncident(SecurityIncidentEvent event) {
        // Immediate actions
        blockSuspiciousIps(event.getRelatedIps());
        disableCompromisedAccounts(event.getAffectedUsers());

        // Notifications
        alertSecurityTeam(event, true);
        notifyManagement(event);

        // Documentation
        createIncidentTicket(event);
        logIncident(event);
    }
}
```

### Backup and Recovery

**Security-Focused Backup Strategy:**

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-auth
spec:
  backup:
    retentionPolicy: "30d"
    barmanObjectStore:
      destinationPath: "s3://gripday-secure-backups/auth"
      encryption: "AES256"
      s3Credentials:
        accessKeyId:
          name: backup-credentials
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: backup-credentials
          key: SECRET_ACCESS_KEY
      wal:
        retention: "7d"
        encryption: "AES256"
      data:
        retention: "30d"
        encryption: "AES256"
        immediateCheckpoint: true
```

## 📋 Security Checklist

### Development Security

- [ ] Input validation on all user inputs
- [ ] SQL injection prevention with parameterized queries
- [ ] XSS prevention with output encoding
- [ ] CSRF protection with tokens
- [ ] Secure session management
- [ ] Proper error handling without information disclosure

### Infrastructure Security

- [ ] Network segmentation with firewalls
- [ ] TLS encryption for all communications
- [ ] Regular security updates and patches
- [ ] Intrusion detection and prevention systems
- [ ] Secure configuration management
- [ ] Regular security assessments

### Data Security

- [ ] Encryption at rest for sensitive data
- [ ] Encryption in transit for all communications
- [ ] Data classification and handling procedures
- [ ] Regular data backups with encryption
- [ ] Data retention and disposal policies
- [ ] Access controls and audit trails

### Compliance

- [ ] GDPR compliance for EU data subjects
- [ ] CCPA compliance for California residents
- [ ] SOC 2 controls implementation
- [ ] Regular compliance audits
- [ ] Privacy policy and terms of service
- [ ] Data processing agreements

---

_This security architecture provides comprehensive protection for GripDay's B2B marketing automation platform while maintaining usability and performance._
