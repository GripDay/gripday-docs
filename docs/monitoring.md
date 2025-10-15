# Monitoring Guide

This comprehensive monitoring guide covers observability, metrics collection, alerting, and troubleshooting for GripDay's microservices architecture. Learn how to monitor system health, performance, and business metrics effectively.

## 🎯 Monitoring Overview

GripDay implements a comprehensive observability stack designed for microservices monitoring:

- **Metrics Collection**: Prometheus for time-series metrics
- **Visualization**: Grafana dashboards for metrics visualization
- **Distributed Tracing**: Jaeger for request tracing across services
- **Log Aggregation**: ELK Stack for centralized logging
- **Alerting**: Alertmanager with intelligent notification routing
- **Health Monitoring**: Spring Boot Actuator for application health

## 📊 Metrics Collection

### Prometheus Configuration

#### Prometheus Server Setup

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "gripday-rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

scrape_configs:
  - job_name: "gripday-services"
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - gripday
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels:
          [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
```

#### Service Discovery Configuration

```yaml
# Kubernetes service discovery for GripDay services
- job_name: "gripday-api-gateway"
  static_configs:
    - targets: ["api-gateway:8080"]
  metrics_path: "/actuator/prometheus"
  scrape_interval: 30s

- job_name: "gripday-auth-service"
  static_configs:
    - targets: ["auth-service:8081"]
  metrics_path: "/actuator/prometheus"
  scrape_interval: 30s

- job_name: "gripday-contact-service"
  static_configs:
    - targets: ["contact-service:8082"]
  metrics_path: "/actuator/prometheus"
  scrape_interval: 30s
```

### Application Metrics

#### Spring Boot Actuator Configuration

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
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
        step: 30s

    tags:
      application: ${spring.application.name}
      environment: ${ENVIRONMENT:development}
      version: ${APPLICATION_VERSION:unknown}

    distribution:
      percentiles-histogram:
        http.server.requests: true
      percentiles:
        http.server.requests: 0.5, 0.95, 0.99
      sla:
        http.server.requests: 100ms, 200ms, 500ms
```

#### Custom Business Metrics

```java
@Component
public class BusinessMetrics {

    private final MeterRegistry meterRegistry;
    private final Counter contactsCreated;
    private final Counter emailsSent;
    private final Counter campaignsExecuted;
    private final Timer emailDeliveryTime;
    private final Gauge activeUsers;

    public BusinessMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        this.contactsCreated = Counter.builder("contacts.created")
            .description("Number of contacts created")
            .register(meterRegistry);

        this.emailsSent = Counter.builder("emails.sent")
            .description("Number of emails sent")
            .tag("provider", "unknown")
            .register(meterRegistry);

        this.campaignsExecuted = Counter.builder("campaigns.executed")
            .description("Number of campaigns executed")
            .register(meterRegistry);

        this.emailDeliveryTime = Timer.builder("email.delivery.time")
            .description("Email delivery time")
            .register(meterRegistry);

        this.activeUsers = Gauge.builder("users.active")
            .description("Number of active users")
            .register(meterRegistry, this, BusinessMetrics::getActiveUserCount);
    }

    public void recordContactCreated(String tenantId) {
        contactsCreated.increment(Tags.of("tenant", tenantId));
    }

    public void recordEmailSent(String provider, String tenantId) {
        emailsSent.increment(Tags.of("provider", provider, "tenant", tenantId));
    }

    public Timer.Sample startEmailDeliveryTimer() {
        return Timer.start(meterRegistry);
    }

    public void recordEmailDeliveryTime(Timer.Sample sample, String status) {
        sample.stop(Timer.builder("email.delivery.time")
            .tag("status", status)
            .register(meterRegistry));
    }

    private double getActiveUserCount() {
        // Implementation to count active users
        return userService.getActiveUserCount();
    }
}
```

### Infrastructure Metrics

#### Kubernetes Metrics

```yaml
# ServiceMonitor for Kubernetes metrics
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: gripday-services
  namespace: gripday
  labels:
    app: gripday
spec:
  selector:
    matchLabels:
      app: gripday
  endpoints:
    - port: management
      path: /actuator/prometheus
      interval: 30s
      scrapeTimeout: 10s
  namespaceSelector:
    matchNames:
      - gripday
```

#### Database Metrics

```yaml
# PostgreSQL Exporter
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-exporter
spec:
  template:
    spec:
      containers:
        - name: postgres-exporter
          image: prometheuscommunity/postgres-exporter:latest
          env:
            - name: DATA_SOURCE_NAME
              value: "postgresql://username:password@postgres:5432/gripday?sslmode=disable"
          ports:
            - containerPort: 9187
              name: metrics
```

## 📈 Grafana Dashboards

### GripDay Overview Dashboard

```json
{
  "dashboard": {
    "title": "GripDay Platform Overview",
    "tags": ["gripday", "overview"],
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=~\"gripday-.*\"}[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec"
          }
        ]
      },
      {
        "title": "Response Time (95th percentile)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job=~\"gripday-.*\"}[5m])) by (le, service))",
            "legendFormat": "{{service}}"
          }
        ],
        "yAxes": [
          {
            "label": "Seconds"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=~\"gripday-.*\",status=~\"5..\"}[5m])) by (service) / sum(rate(http_requests_total{job=~\"gripday-.*\"}[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ],
        "yAxes": [
          {
            "label": "Error Rate",
            "max": 1,
            "min": 0
          }
        ]
      }
    ]
  }
}
```

### Business Metrics Dashboard

```json
{
  "dashboard": {
    "title": "GripDay Business Metrics",
    "panels": [
      {
        "title": "Contacts Created",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(increase(contacts_created_total[24h]))",
            "legendFormat": "Last 24h"
          }
        ]
      },
      {
        "title": "Emails Sent",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(emails_sent_total[5m])) by (provider)",
            "legendFormat": "{{provider}}"
          }
        ]
      },
      {
        "title": "Campaign Execution Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(campaigns_executed_total[5m]))",
            "legendFormat": "Campaigns/sec"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "users_active",
            "legendFormat": "Active Users"
          }
        ]
      }
    ]
  }
}
```

### Infrastructure Dashboard

```json
{
  "dashboard": {
    "title": "GripDay Infrastructure",
    "panels": [
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(container_cpu_usage_seconds_total{namespace=\"gripday\"}[5m])) by (pod)",
            "legendFormat": "{{pod}}"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(container_memory_usage_bytes{namespace=\"gripday\"}) by (pod) / 1024 / 1024",
            "legendFormat": "{{pod}}"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends{datname=\"gripday\"}",
            "legendFormat": "Active Connections"
          }
        ]
      }
    ]
  }
}
```

## 🔍 Distributed Tracing

### Jaeger Configuration

#### Jaeger Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
spec:
  template:
    spec:
      containers:
        - name: jaeger
          image: jaegertracing/all-in-one:latest
          ports:
            - containerPort: 16686
              name: ui
            - containerPort: 14268
              name: collector
          env:
            - name: COLLECTOR_OTLP_ENABLED
              value: "true"
            - name: SPAN_STORAGE_TYPE
              value: "elasticsearch"
            - name: ES_SERVER_URLS
              value: "http://elasticsearch:9200"
```

#### Application Tracing Configuration

```yaml
# application.yml
management:
  tracing:
    sampling:
      probability: 1.0

  zipkin:
    tracing:
      endpoint: http://jaeger:9411/api/v2/spans

spring:
  application:
    name: ${SERVICE_NAME:gripday-service}

  sleuth:
    sampler:
      probability: 1.0
    zipkin:
      base-url: http://jaeger:9411
```

#### Custom Tracing

```java
@Component
public class TracingService {

    private final Tracer tracer;

    public TracingService(Tracer tracer) {
        this.tracer = tracer;
    }

    @NewSpan("contact-creation")
    public ContactDto createContact(@SpanTag("tenant") String tenantId,
                                   CreateContactRequest request) {

        Span span = tracer.nextSpan()
            .name("contact-validation")
            .tag("contact.email", request.getEmail())
            .start();

        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span)) {
            // Validation logic
            validateContact(request);

            // Create contact
            Contact contact = contactRepository.save(buildContact(request));

            span.tag("contact.id", contact.getId().toString());
            span.event("contact-created");

            return ContactDto.from(contact);
        } finally {
            span.end();
        }
    }
}
```

## 📋 Centralized Logging

### ELK Stack Configuration

#### Elasticsearch Configuration

```yaml
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
  name: gripday-elasticsearch
spec:
  version: 8.8.0
  nodeSets:
    - name: default
      count: 3
      config:
        node.store.allow_mmap: false
        xpack.security.enabled: true
        xpack.security.transport.ssl.enabled: true
      podTemplate:
        spec:
          containers:
            - name: elasticsearch
              resources:
                requests:
                  memory: 2Gi
                  cpu: 1000m
                limits:
                  memory: 4Gi
                  cpu: 2000m
      volumeClaimTemplates:
        - metadata:
            name: elasticsearch-data
          spec:
            accessModes:
              - ReadWriteOnce
            resources:
              requests:
                storage: 100Gi
```

#### Logstash Configuration

```yaml
# logstash.conf
input {
beats {
port => 5044
}
}

filter {
if [fields][service] == "gripday" {
grok {
match => {
"message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{DATA:thread}\] %{LOGLEVEL:level} \[%{DATA:trace_id},%{DATA:span_id}\] %{DATA:logger} - %{GREEDYDATA:log_message}"
}
}

date {
match => [ "timestamp", "yyyy-MM-dd HH:mm:ss.SSS" ]
}

if [trace_id] and [trace_id] != "-" {
mutate {
add_field => { "tracing_enabled" => "true" }
}
}
}
}

output {
elasticsearch {
hosts => ["elasticsearch:9200"]
index => "gripday-logs-%{+YYYY.MM.dd}"
}
}
```

#### Filebeat Configuration

```yaml
# filebeat.yml
filebeat.inputs:
  - type: container
    paths:
      - /var/log/containers/*gripday*.log
    processors:
      - add_kubernetes_metadata:
          host: ${NODE_NAME}
          matchers:
            - logs_path:
                logs_path: "/var/log/containers/"

output.logstash:
  hosts: ["logstash:5044"]

fields:
  service: gripday
fields_under_root: true
```

### Application Logging Configuration

```yaml
# logback-spring.xml
<configuration>
<springProfile name="!local">
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
<encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
<providers>
<timestamp/>
<logLevel/>
<loggerName/>
<mdc/>
<arguments/>
<message/>
<stackTrace/>
</providers>
</encoder>
</appender>
</springProfile>

<springProfile name="local">
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
<encoder>
<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId:-},%X{spanId:-}] %logger{36} - %msg%n</pattern>
</encoder>
</appender>
</springProfile>

<root level="INFO">
<appender-ref ref="STDOUT"/>
</root>

<logger name="com.gripday" level="DEBUG"/>
<logger name="org.springframework.security" level="WARN"/>
</configuration>
```

## 🚨 Alerting Configuration

### Alertmanager Setup

```yaml
# alertmanager.yml
global:
  smtp_smarthost: "smtp.gmail.com:587"
  smtp_from: "alerts@gripday.com"
  smtp_auth_username: "alerts@gripday.com"
  smtp_auth_password: "your-app-password"

route:
  group_by: ["alertname", "cluster", "service"]
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: "web.hook"
  routes:
    - match:
        severity: critical
      receiver: "critical-alerts"
    - match:
        severity: warning
      receiver: "warning-alerts"

receivers:
  - name: "web.hook"
    webhook_configs:
      - url: "http://slack-webhook-url"

  - name: "critical-alerts"
    email_configs:
      - to: "oncall@gripday.com"
        subject: "CRITICAL: {{ .GroupLabels.alertname }}"
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          {{ end }}

    slack_configs:
      - api_url: "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
        channel: "#alerts-critical"
        title: "Critical Alert: {{ .GroupLabels.alertname }}"

  - name: "warning-alerts"
    slack_configs:
      - api_url: "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
        channel: "#alerts-warning"
        title: "Warning: {{ .GroupLabels.alertname }}"
```

### Alert Rules

```yaml
# gripday-rules.yml
groups:
  - name: gripday.rules
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{job=~"gripday-.*",status=~"5.."}[5m])) by (service) / sum(rate(http_requests_total{job=~"gripday-.*"}[5m])) by (service) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected for {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }} for service {{ $labels.service }}"

      # High Response Time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job=~"gripday-.*"}[5m])) by (le, service)) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time for {{ $labels.service }}"
          description: "95th percentile response time is {{ $value }}s for service {{ $labels.service }}"

      # Service Down
      - alert: ServiceDown
        expr: up{job=~"gripday-.*"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Service {{ $labels.job }} has been down for more than 1 minute"

      # High Memory Usage
      - alert: HighMemoryUsage
        expr: (container_memory_usage_bytes{namespace="gripday"} / container_spec_memory_limit_bytes{namespace="gripday"}) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage for {{ $labels.pod }}"
          description: "Memory usage is {{ $value | humanizePercentage }} for pod {{ $labels.pod }}"

      # Database Connection Issues
      - alert: DatabaseConnectionHigh
        expr: pg_stat_database_numbackends{datname="gripday"} > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connection count"
          description: "Database has {{ $value }} active connections"

      # Kafka Consumer Lag
      - alert: KafkaConsumerLag
        expr: kafka_consumer_lag_sum > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High Kafka consumer lag"
          description: "Consumer lag is {{ $value }} messages for group {{ $labels.consumer_group }}"
```

## 🔧 Health Monitoring

### Application Health Checks

```java
@Component
public class GripDayHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;
    private final RedisTemplate<String, String> redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public Health health() {
        Health.Builder builder = Health.up();

        // Check database connectivity
        try {
            dataSource.getConnection().close();
            builder.withDetail("database", "UP");
        } catch (Exception e) {
            builder.down().withDetail("database", "DOWN: " + e.getMessage());
        }

        // Check Redis connectivity
        try {
            redisTemplate.opsForValue().get("health-check");
            builder.withDetail("redis", "UP");
        } catch (Exception e) {
            builder.withDetail("redis", "DOWN: " + e.getMessage());
        }

        // Check Kafka connectivity
        try {
            kafkaTemplate.send("health-check", "ping").get(5, TimeUnit.SECONDS);
            builder.withDetail("kafka", "UP");
        } catch (Exception e) {
            builder.withDetail("kafka", "DOWN: " + e.getMessage());
        }

        return builder.build();
    }
}
```

### Kubernetes Health Checks

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gripday-contact-service
spec:
  template:
    spec:
      containers:
        - name: contact-service
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8082
            initialDelaySeconds: 60
            periodSeconds: 30
            timeoutSeconds: 10
            failureThreshold: 3

          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8082
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3

          startupProbe:
            httpGet:
              path: /actuator/health
              port: 8082
            initialDelaySeconds: 10
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 30
```

## 📊 Performance Monitoring

### JVM Metrics

```java
@Configuration
public class MetricsConfiguration {

    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config().commonTags(
            "application", "gripday",
            "environment", System.getProperty("ENVIRONMENT", "development")
        );
    }

    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }

    @Bean
    public CountedAspect countedAspect(MeterRegistry registry) {
        return new CountedAspect(registry);
    }
}
```

### Database Performance Monitoring

```yaml
# PostgreSQL monitoring queries
- name: pg_database_size
  query: "SELECT pg_database.datname, pg_database_size(pg_database.datname) as size FROM pg_database"
  metrics:
    - datname:
        usage: "LABEL"
        description: "Name of the database"
    - size:
        usage: "GAUGE"
        description: "Disk space used by the database"

- name: pg_slow_queries
  query: "SELECT query, calls, total_time, mean_time FROM pg_stat_statements WHERE mean_time > 100 ORDER BY mean_time DESC LIMIT 10"
  metrics:
    - query:
        usage: "LABEL"
        description: "SQL query"
    - calls:
        usage: "COUNTER"
        description: "Number of times executed"
    - total_time:
        usage: "COUNTER"
        description: "Total time spent in the statement"
    - mean_time:
        usage: "GAUGE"
        description: "Mean time spent in the statement"
```

## 🔍 Troubleshooting Guide

### Common Issues and Solutions

#### High Response Times

```bash
# Check service metrics
curl http://localhost:8080/actuator/metrics/http.server.requests

# Check database connections
curl http://localhost:8080/actuator/metrics/hikaricp.connections.active

# Check JVM memory
curl http://localhost:8080/actuator/metrics/jvm.memory.used
```

#### Memory Leaks

```bash
# Generate heap dump
curl -X POST http://localhost:8080/actuator/heapdump

# Check garbage collection
curl http://localhost:8080/actuator/metrics/jvm.gc.pause
```

#### Database Issues

```sql
-- Check active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Check database size
SELECT pg_database.datname,
       pg_size_pretty(pg_database_size(pg_database.datname)) as size
FROM pg_database;
```

### Monitoring Checklist

#### Daily Monitoring

- [ ] Check system uptime and availability
- [ ] Review error rates and response times
- [ ] Monitor resource utilization (CPU, memory, disk)
- [ ] Verify backup completion
- [ ] Check alert status and resolution

#### Weekly Monitoring

- [ ] Review performance trends
- [ ] Analyze capacity planning metrics
- [ ] Check security alerts and incidents
- [ ] Review log patterns and anomalies
- [ ] Update monitoring configurations

#### Monthly Monitoring

- [ ] Capacity planning review
- [ ] Performance baseline updates
- [ ] Monitoring tool updates
- [ ] Alert rule optimization
- [ ] Documentation updates

---

_This monitoring guide provides comprehensive coverage of observability for GripDay's microservices architecture. For specific deployment monitoring, refer to the [Deployment Architecture](/architecture/deployment) documentation._
