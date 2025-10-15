# Database Design

GripDay implements a **database-per-service** pattern with PostgreSQL as the primary database system. Each microservice maintains its own dedicated database to ensure complete data isolation and independent scaling.

## 🎯 Database Architecture Principles

### Core Principles

- **Database per Service**: Each microservice owns its data completely
- **Data Isolation**: Complete tenant separation at the database level
- **Schema Evolution**: Independent schema changes per service
- **Performance Optimization**: Service-specific indexing and optimization
- **Backup Strategy**: Per-service backup and recovery procedures

### Technology Stack

- **Primary Database**: PostgreSQL 16+ with advanced features
- **Operator**: CloudNativePG for Kubernetes-native management
- **Connection Pooling**: PgBouncer for connection management
- **Migrations**: Flyway for version-controlled schema changes
- **Monitoring**: Prometheus metrics and performance monitoring

## 🗄️ Service Database Schemas

### Authentication Service Database

**Purpose**: User management, authentication, and authorization

```sql
-- Users table with tenant isolation
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles and permissions
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE user_roles (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Audit trail
CREATE TABLE user_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_user_audit_log_user_id ON user_audit_log(user_id);
CREATE INDEX idx_user_audit_log_created_at ON user_audit_log(created_at);
```

### Contact Management Service Database

**Purpose**: Contact and company data management

```sql
-- Companies table
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    website VARCHAR(255),
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    job_title VARCHAR(100),
    department VARCHAR(100),
    company_id BIGINT REFERENCES companies(id),
    is_primary_contact BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    lead_source VARCHAR(100),
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_contact_status CHECK (status IN ('active', 'inactive', 'bounced', 'unsubscribed'))
);

-- Contact activities
CREATE TABLE contact_activities (
    id BIGSERIAL PRIMARY KEY,
    contact_id BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    source_service VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact segments
CREATE TABLE segments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    segment_type VARCHAR(20) DEFAULT 'dynamic',
    filter_criteria JSONB,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_segment_type CHECK (segment_type IN ('dynamic', 'static'))
);

CREATE TABLE contact_segments (
    contact_id BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
    segment_id BIGINT REFERENCES segments(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contact_id, segment_id)
);

-- Custom fields
CREATE TABLE custom_fields (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(20) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_options JSONB,
    is_required BOOLEAN DEFAULT false,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_field_type CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'multi_select'))
);

CREATE TABLE contact_custom_field_values (
    contact_id BIGINT REFERENCES contacts(id) ON DELETE CASCADE,
    custom_field_id BIGINT REFERENCES custom_fields(id) ON DELETE CASCADE,
    field_value TEXT,
    PRIMARY KEY (contact_id, custom_field_id)
);

-- Indexes
CREATE INDEX idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contact_activities_contact_id ON contact_activities(contact_id);
CREATE INDEX idx_contact_activities_type ON contact_activities(activity_type);
CREATE INDEX idx_segments_tenant_id ON segments(tenant_id);
CREATE INDEX idx_custom_fields_tenant_id ON custom_fields(tenant_id);
```

### Email Marketing Service Database

**Purpose**: Email templates, campaigns, and tracking

```sql
-- Email templates
CREATE TABLE email_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    template_type VARCHAR(20) DEFAULT 'marketing',
    is_active BOOLEAN DEFAULT true,
    tenant_id VARCHAR(50) NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_template_type CHECK (template_type IN ('marketing', 'transactional', 'system'))
);

-- Email campaigns
CREATE TABLE email_campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template_id BIGINT REFERENCES email_templates(id),
    segment_id BIGINT,
    status VARCHAR(20) DEFAULT 'draft',
    schedule_type VARCHAR(20) DEFAULT 'immediate',
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    tenant_id VARCHAR(50) NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_campaign_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    CONSTRAINT chk_schedule_type CHECK (schedule_type IN ('immediate', 'scheduled', 'recurring'))
);

-- Email deliveries
CREATE TABLE email_deliveries (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT REFERENCES email_campaigns(id),
    contact_id BIGINT,
    email_address VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'queued',
    smtp_provider VARCHAR(50),
    smtp_message_id VARCHAR(255),
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    tenant_id VARCHAR(50) NOT NULL,

    CONSTRAINT chk_delivery_status CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'bounced', 'failed'))
);

-- Email tracking
CREATE TABLE email_tracking (
    id BIGSERIAL PRIMARY KEY,
    delivery_id BIGINT REFERENCES email_deliveries(id),
    tracking_type VARCHAR(20) NOT NULL,
    tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    additional_data JSONB,

    CONSTRAINT chk_tracking_type CHECK (tracking_type IN ('open', 'click', 'unsubscribe', 'spam_report'))
);

-- Link tracking
CREATE TABLE email_links (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT REFERENCES email_campaigns(id),
    original_url TEXT NOT NULL,
    tracking_url TEXT NOT NULL,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_email_templates_tenant_id ON email_templates(tenant_id);
CREATE INDEX idx_email_campaigns_tenant_id ON email_campaigns(tenant_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_deliveries_campaign_id ON email_deliveries(campaign_id);
CREATE INDEX idx_email_deliveries_contact_id ON email_deliveries(contact_id);
CREATE INDEX idx_email_deliveries_status ON email_deliveries(status);
CREATE INDEX idx_email_tracking_delivery_id ON email_tracking(delivery_id);
CREATE INDEX idx_email_tracking_type ON email_tracking(tracking_type);
```

### Campaign Automation Service Database

**Purpose**: Workflow definitions and execution tracking

```sql
-- Campaigns
CREATE TABLE campaigns (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(20) DEFAULT 'drip',
    status VARCHAR(20) DEFAULT 'draft',
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config JSONB,
    workflow_definition JSONB NOT NULL,
    is_active BOOLEAN DEFAULT false,
    tenant_id VARCHAR(50) NOT NULL,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_campaign_type CHECK (campaign_type IN ('drip', 'nurture', 'onboarding', 'reengagement')),
    CONSTRAINT chk_campaign_status CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived'))
);

-- Campaign executions
CREATE TABLE campaign_executions (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT REFERENCES campaigns(id),
    contact_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'running',
    current_step INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    paused_at TIMESTAMP,
    error_message TEXT,
    execution_data JSONB,

    CONSTRAINT chk_execution_status CHECK (status IN ('running', 'completed', 'paused', 'failed', 'cancelled'))
);

-- Step executions
CREATE TABLE step_executions (
    id BIGSERIAL PRIMARY KEY,
    execution_id BIGINT REFERENCES campaign_executions(id),
    step_id VARCHAR(50) NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    step_data JSONB,

    CONSTRAINT chk_step_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped'))
);

-- Campaign analytics
CREATE TABLE campaign_analytics (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT REFERENCES campaigns(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tenant_id VARCHAR(50) NOT NULL
);

-- Indexes
CREATE INDEX idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_executions_campaign_id ON campaign_executions(campaign_id);
CREATE INDEX idx_campaign_executions_contact_id ON campaign_executions(contact_id);
CREATE INDEX idx_campaign_executions_status ON campaign_executions(status);
CREATE INDEX idx_step_executions_execution_id ON step_executions(execution_id);
CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
```

## 🔧 Database Management

### Connection Pooling

**PgBouncer Configuration:**

```ini
[databases]
auth_db = host=postgres-auth port=5432 dbname=gripday_auth
contact_db = host=postgres-contacts port=5432 dbname=gripday_contacts
email_db = host=postgres-email port=5432 dbname=gripday_email
campaign_db = host=postgres-campaigns port=5432 dbname=gripday_campaigns

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
max_db_connections = 30
```

### Migration Strategy

**Flyway Configuration:**

```yaml
# application.yml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    validate-on-migrate: true
    clean-disabled: true
```

**Migration Naming Convention:**

```
V1.0.0__Initial_schema.sql
V1.1.0__Add_contact_scoring.sql
V1.2.0__Add_email_tracking.sql
V2.0.0__Major_schema_refactor.sql
```

### Backup and Recovery

**Automated Backup Strategy:**

```yaml
# CloudNativePG Backup Configuration
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: postgres-contacts
spec:
  instances: 3

  backup:
    retentionPolicy: "30d"
    barmanObjectStore:
      destinationPath: "s3://gripday-backups/contacts"
      s3Credentials:
        accessKeyId:
          name: backup-credentials
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: backup-credentials
          key: SECRET_ACCESS_KEY
      wal:
        retention: "7d"
      data:
        retention: "30d"
```

## 📊 Performance Optimization

### Indexing Strategy

**Primary Indexes:**

- All primary keys (automatic)
- Foreign key relationships
- Tenant ID columns (for multi-tenancy)
- Frequently queried columns (email, status, etc.)

**Composite Indexes:**

```sql
-- Multi-column indexes for common queries
CREATE INDEX idx_contacts_tenant_status ON contacts(tenant_id, status);
CREATE INDEX idx_email_deliveries_campaign_status ON email_deliveries(campaign_id, status);
CREATE INDEX idx_campaign_executions_contact_status ON campaign_executions(contact_id, status);
```

**Partial Indexes:**

```sql
-- Indexes on filtered data
CREATE INDEX idx_active_contacts ON contacts(tenant_id) WHERE status = 'active';
CREATE INDEX idx_failed_deliveries ON email_deliveries(campaign_id) WHERE status = 'failed';
```

### Query Optimization

**Connection Pool Sizing:**

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

**Query Performance Monitoring:**

```sql
-- Enable query statistics
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Monitor slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🔒 Security and Compliance

### Data Encryption

**Encryption at Rest:**

```yaml
# PostgreSQL encryption configuration
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
```

**Application-Level Encryption:**

```java
@Entity
public class Contact {
    @Column(name = "email")
    @Convert(converter = EncryptedStringConverter.class)
    private String email;

    @Column(name = "phone")
    @Convert(converter = EncryptedStringConverter.class)
    private String phone;
}

@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

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

### Access Control

**Row-Level Security:**

```sql
-- Enable RLS for tenant isolation
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_isolation_policy ON contacts
    FOR ALL
    TO application_role
    USING (tenant_id = current_setting('app.current_tenant'));
```

### Audit Logging

**Database Audit Trail:**

```sql
-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_values, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_setting('app.current_user_id'), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id'), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_values, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_setting('app.current_user_id'), NOW());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER contacts_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON contacts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## 📈 Monitoring and Maintenance

### Database Monitoring

**Prometheus Metrics:**

```yaml
# PostgreSQL Exporter configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: postgres-exporter-config
data:
  queries.yaml: |
    pg_database:
      query: "SELECT pg_database.datname, pg_database_size(pg_database.datname) as size FROM pg_database"
      metrics:
        - datname:
            usage: "LABEL"
            description: "Name of the database"
        - size:
            usage: "GAUGE"
            description: "Disk space used by the database"
```

### Maintenance Tasks

**Automated Maintenance:**

```sql
-- Vacuum and analyze schedule
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily vacuum analyze
SELECT cron.schedule('vacuum-analyze', '0 2 * * *', 'VACUUM ANALYZE;');

-- Weekly full vacuum on large tables
SELECT cron.schedule('weekly-vacuum', '0 3 * * 0', 'VACUUM FULL contacts;');

-- Monthly statistics update
SELECT cron.schedule('update-stats', '0 4 1 * *', 'ANALYZE;');
```

## 📚 Best Practices

### Schema Design

- Use appropriate data types for storage efficiency
- Implement proper constraints and validations
- Design for query patterns and access patterns
- Plan for data growth and archival strategies

### Performance

- Monitor query performance regularly
- Use connection pooling appropriately
- Implement proper indexing strategies
- Consider partitioning for large tables

### Security

- Implement row-level security for multi-tenancy
- Encrypt sensitive data at application level
- Use strong authentication and authorization
- Maintain comprehensive audit trails

### Maintenance

- Regular backup testing and recovery procedures
- Monitor database health and performance metrics
- Plan for schema migrations and version upgrades
- Implement proper monitoring and alerting

---

_This database design provides a solid foundation for GripDay's microservices architecture while ensuring scalability, security, and maintainability._
