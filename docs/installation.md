# Installation Guide

This comprehensive guide covers all installation methods for GripDay, from local development to production deployment. Choose the method that best fits your needs.

## 📋 System Requirements

### Minimum Requirements

- **CPU**: 4 cores
- **Memory**: 8GB RAM
- **Storage**: 50GB free space
- **Network**: Broadband internet connection

### Recommended Requirements

- **CPU**: 8+ cores
- **Memory**: 16GB+ RAM
- **Storage**: 100GB+ SSD
- **Network**: High-speed internet connection

### Supported Operating Systems

- **Linux**: Ubuntu 20.04+, CentOS 8+, RHEL 8+
- **macOS**: 10.15+ (Catalina or later)
- **Windows**: Windows 10/11 with WSL2

## 🐳 Docker Compose Installation

Best for: Development, testing, and small-scale deployments.

### Prerequisites

```bash
# Install Docker Desktop
# Windows/Mac: Download from https://docker.com/products/docker-desktop
# Linux: Use package manager

# Verify installation
docker --version          # Should be 20.10+
docker-compose --version  # Should be 2.0+

# Install Git
git --version             # Should be 2.30+
```

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/GripDay/gripday.git gripday-platform
cd gripday-platform
```

#### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration (required)
nano .env
```

**Required Environment Variables:**

```bash
# Database Configuration
POSTGRES_PASSWORD=your-secure-password-here

# JWT Security (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Redis Configuration
REDIS_PASSWORD=your-redis-password-here

# Email Configuration (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application Configuration
ENVIRONMENT=development
LOG_LEVEL=INFO
ENABLE_REGISTRATION=true
```

#### 3. Start Services

```bash
# Start all services
./scripts/docker-start.sh

# Or start step by step
./scripts/docker-start.sh infrastructure  # Start databases first
./scripts/docker-start.sh services       # Start application services
./scripts/docker-start.sh frontend       # Start web application
```

#### 4. Verify Installation

```bash
# Check service health
./scripts/health-check.sh

# Expected output:
# ✅ PostgreSQL: Healthy
# ✅ Redis: Healthy
# ✅ Kafka: Healthy
# ✅ API Gateway: Healthy
# ✅ User Service: Healthy
# ✅ Contact Service: Healthy
# ✅ Email Service: Healthy
# ✅ Campaign Service: Healthy
# ✅ Form Service: Healthy
# ✅ Scoring Service: Healthy
# ✅ Analytics Service: Healthy
# ✅ Web Application: Healthy
```

#### 5. Access Application

- **Web Application**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html
- **Grafana Dashboard**: http://localhost:3001 (admin/admin)

### Docker Compose Management

#### Service Management

```bash
# View running services
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart specific service
docker-compose restart [service-name]

# Stop all services
docker compose down

# Stop and remove volumes (data loss!)
docker compose down -v
```

#### Updates and Maintenance

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker compose up --build -d

# Clean up unused resources
docker system prune -f
```

## ☸️ Kubernetes Installation

Best for: Production deployments, scalable environments, and cloud-native development.

### Prerequisites

#### Install Kubernetes Tools

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify installations
kubectl version --client
helm version
```

#### Choose Kubernetes Environment

**Local Development (Minikube):**

```bash
# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start cluster
minikube start --cpus=4 --memory=8192 --disk-size=50g
```

**Production Cloud (EKS/GKE/AKS):**

```bash
# AWS EKS
eksctl create cluster --name gripday --region us-west-2 --nodes 3

# Google GKE
gcloud container clusters create gripday --num-nodes=3 --zone=us-central1-a

# Azure AKS
az aks create --resource-group myResourceGroup --name gripday --node-count 3
```

### Installation Steps

#### 1. Clone Repository

```bash
git clone https://github.com/GripDay/gripday.git
cd gripday-platform
```

#### 2. Install Operators

```bash
# Install required Kubernetes operators
./scripts/k8s-install-operators.sh

# This installs:
# - CloudNativePG (PostgreSQL operator)
# - Strimzi (Kafka operator)
# - Prometheus Operator (monitoring)
# - Istio (service mesh)
```

#### 3. Configure Values

```bash
# Copy Helm values template
cp k8s/helm/values.example.yaml k8s/helm/values.yaml

# Edit configuration
nano k8s/helm/values.yaml
```

**Key Configuration Options:**

```yaml
# Global settings
global:
  environment: production
  domain: gripday.yourdomain.com

# Database configuration
postgresql:
  auth:
    postgresPassword: "your-secure-password"

# Redis configuration
redis:
  auth:
    password: "your-redis-password"

# Application configuration
app:
  jwt:
    secret: "your-super-secret-jwt-key-minimum-32-characters"
  email:
    smtp:
      host: "smtp.gmail.com"
      port: 587
      username: "your-email@gmail.com"
      password: "your-app-password"

# Ingress configuration
ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  tls:
    enabled: true
```

#### 4. Deploy Infrastructure

```bash
# Deploy infrastructure components
helm install gripday-infrastructure ./k8s/helm/infrastructure \
  --namespace gripday-system \
  --create-namespace \
  --values k8s/helm/values.yaml

# Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgresql --timeout=300s
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=kafka --timeout=300s
```

#### 5. Deploy Application

```bash
# Deploy GripDay application
helm install gripday ./k8s/helm/gripday \
  --namespace gripday \
  --create-namespace \
  --values k8s/helm/values.yaml

# Wait for deployment
kubectl wait --for=condition=available deployment --all -n gripday --timeout=600s
```

#### 6. Configure Ingress

```bash
# Install NGINX Ingress Controller (if not already installed)
helm upgrade --install ingress-nginx ingress-nginx \
  --repo https://kubernetes.github.io/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Install cert-manager for SSL certificates
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Apply GripDay ingress
kubectl apply -f k8s/manifests/ingress.yaml
```

#### 7. Verify Installation

```bash
# Check all pods are running
kubectl get pods -n gripday

# Check services
kubectl get svc -n gripday

# Check ingress
kubectl get ingress -n gripday

# Test application
curl -k https://gripday.yourdomain.com/api/v1/health
```

### Kubernetes Management

#### Scaling Services

```bash
# Scale specific service
kubectl scale deployment contact-service --replicas=3 -n gripday

# Auto-scaling
kubectl autoscale deployment contact-service --cpu-percent=70 --min=2 --max=10 -n gripday
```

#### Monitoring and Logs

```bash
# View logs
kubectl logs -f deployment/contact-service -n gripday

# Port forward for local access
kubectl port-forward svc/api-gateway 8080:8080 -n gripday

# Access monitoring
kubectl port-forward svc/grafana 3000:3000 -n gripday-system
```

#### Updates and Maintenance

```bash
# Update application
helm upgrade gripday ./k8s/helm/gripday \
  --namespace gripday \
  --values k8s/helm/values.yaml

# Rollback if needed
helm rollback gripday 1 -n gripday

# Backup
./scripts/k8s-backup.sh
```

## 🌐 Cloud Provider Specific Installation

### Amazon Web Services (AWS)

#### Prerequisites

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Configure AWS credentials
aws configure
```

#### EKS Deployment

```bash
# Create EKS cluster
eksctl create cluster \
  --name gripday-production \
  --region us-west-2 \
  --nodes 3 \
  --node-type m5.large \
  --managed

# Install AWS Load Balancer Controller
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"

# Deploy GripDay with AWS-specific configuration
helm install gripday ./k8s/helm/gripday \
  --namespace gripday \
  --create-namespace \
  --values k8s/helm/values-aws.yaml
```

#### AWS-Specific Configuration

```yaml
# k8s/helm/values-aws.yaml
ingress:
  className: "alb"
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-west-2:123456789:certificate/your-cert-arn

storage:
  storageClass: gp3

monitoring:
  prometheus:
    storageClass: gp3
```

### Google Cloud Platform (GCP)

#### Prerequisites

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Install GKE auth plugin
gcloud components install gke-gcloud-auth-plugin
```

#### GKE Deployment

```bash
# Create GKE cluster
gcloud container clusters create gripday-production \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-2 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10

# Get credentials
gcloud container clusters get-credentials gripday-production --zone us-central1-a

# Deploy GripDay
helm install gripday ./k8s/helm/gripday \
  --namespace gripday \
  --create-namespace \
  --values k8s/helm/values-gcp.yaml
```

### Microsoft Azure (AKS)

#### Prerequisites

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login
```

#### AKS Deployment

```bash
# Create resource group
az group create --name gripday-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group gripday-rg \
  --name gripday-production \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group gripday-rg --name gripday-production

# Deploy GripDay
helm install gripday ./k8s/helm/gripday \
  --namespace gripday \
  --create-namespace \
  --values k8s/helm/values-azure.yaml
```

## 🔧 Configuration Options

### Environment Variables

#### Core Configuration

```bash
# Application
ENVIRONMENT=production|development|staging
LOG_LEVEL=DEBUG|INFO|WARN|ERROR
ENABLE_REGISTRATION=true|false
ENABLE_EMAIL_VERIFICATION=true|false
ENABLE_MULTI_TENANT=true|false

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gripday
POSTGRES_USER=gripday_user
POSTGRES_PASSWORD=your-secure-password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_SECURITY_PROTOCOL=PLAINTEXT
KAFKA_SASL_MECHANISM=PLAIN
```

#### Email Configuration

```bash
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_TLS_ENABLED=true
SMTP_SSL_ENABLED=false

# Email Providers (choose one)
EMAIL_PROVIDER=smtp|sendgrid|mailjet|ses

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Mailjet
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key

# Amazon SES
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-west-2
```

#### Storage Configuration

```bash
# File Storage
STORAGE_TYPE=local|s3|gcs|azure

# Local Storage
STORAGE_LOCAL_PATH=/var/lib/gripday/uploads

# Amazon S3
AWS_S3_BUCKET=your-gripday-bucket
AWS_S3_REGION=us-west-2

# Google Cloud Storage
GCS_BUCKET=your-gripday-bucket
GCS_PROJECT_ID=your-project-id

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=yourstorageaccount
AZURE_STORAGE_KEY=your-storage-key
AZURE_CONTAINER=gripday-files
```

### Advanced Configuration

#### Performance Tuning

```yaml
# application.yml
server:
  tomcat:
    max-threads: 200
    min-spare-threads: 10
    max-connections: 8192

spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000

  kafka:
    producer:
      batch-size: 16384
      linger-ms: 5
      buffer-memory: 33554432
    consumer:
      max-poll-records: 500
      fetch-min-size: 1024
```

#### Security Hardening

```yaml
# Security configuration
security:
  jwt:
    expiration: 86400000 # 24 hours
    refresh-expiration: 604800000 # 7 days
  password:
    min-length: 8
    require-uppercase: true
    require-lowercase: true
    require-numbers: true
    require-special-chars: true
  rate-limiting:
    enabled: true
    requests-per-minute: 60
    burst-capacity: 100
```

## 🔍 Troubleshooting

### Common Issues

#### Docker Issues

```bash
# Docker daemon not running
sudo systemctl start docker

# Permission denied
sudo usermod -aG docker $USER
newgrp docker

# Out of disk space
docker system prune -a -f

# Port already in use
sudo lsof -i :8080
sudo kill -9 <PID>
```

#### Kubernetes Issues

```bash
# Pods not starting
kubectl describe pod <pod-name> -n gripday
kubectl logs <pod-name> -n gripday

# Service not accessible
kubectl get svc -n gripday
kubectl describe svc <service-name> -n gripday

# Ingress not working
kubectl get ingress -n gripday
kubectl describe ingress <ingress-name> -n gripday
```

#### Database Issues

```bash
# Connection refused
# Check if PostgreSQL is running
kubectl get pods -l app=postgresql -n gripday

# Authentication failed
# Verify credentials in secrets
kubectl get secret postgresql-secret -n gripday -o yaml

# Database not found
# Check if database was created
kubectl exec -it postgresql-0 -n gripday -- psql -U postgres -l
```

### Performance Issues

#### High Memory Usage

```bash
# Check memory usage
kubectl top pods -n gripday

# Increase memory limits
kubectl patch deployment contact-service -n gripday -p '{"spec":{"template":{"spec":{"containers":[{"name":"contact-service","resources":{"limits":{"memory":"2Gi"}}}]}}}}'
```

#### Slow Response Times

```bash
# Check application metrics
kubectl port-forward svc/grafana 3000:3000 -n gripday-system

# Enable debug logging
kubectl set env deployment/contact-service LOG_LEVEL=DEBUG -n gripday

# Check database performance
kubectl exec -it postgresql-0 -n gripday -- psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Getting Help

#### Log Collection

```bash
# Collect all logs
./scripts/collect-logs.sh

# This creates gripday-logs-$(date).tar.gz with:
# - Application logs
# - System logs
# - Configuration files
# - Health check results
```

#### Support Channels

- **📖 Documentation**: [docs.gripday.com](https://docs.gripday.com)
- **🐛 GitHub Issues**: [github.com/GripDay/gripday/issues](https://github.com/GripDay/gripday/issues)
- **💬 Community Discord**: [discord.gg/gripday](https://discord.gg/gripday)
- **📧 Email Support**: support@gripday.com
- **📞 Enterprise Support**: Available with commercial licenses

## 📚 Next Steps

After successful installation:

1. **[Quick Start Guide](/quick-start)** - Get up and running quickly
2. **[Configuration Guide](/configuration)** - Detailed configuration options
3. **[Development Setup](/development/getting-started)** - Start developing with GripDay
4. **[Monitoring Guide](/monitoring)** - Set up monitoring and alerting
5. **[Contributing Guide](/contributing)** - How to contribute to the project

---

_Installation complete! Welcome to GripDay - the open-core B2B marketing automation platform. Start building your marketing workflows today._
