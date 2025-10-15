# Quick Start

Get GripDay up and running in minutes with our streamlined setup process. Choose the approach that best fits your needs.

## 🎯 Choose Your Path

| Approach                     | Best For                    | Time       | Complexity |
| ---------------------------- | --------------------------- | ---------- | ---------- |
| **🐳 Docker Compose**        | Quick testing, development  | 5 minutes  | Low        |
| **☸️ Kubernetes (Minikube)** | Production-like development | 15 minutes | Medium     |
| **☁️ Cloud Deployment**      | Production deployment       | 30 minutes | High       |

## 🐳 Option 1: Docker Compose (Fastest)

Perfect for getting started quickly and testing the platform.

### Prerequisites

- Docker Desktop 4.20+
- Git
- 8GB RAM, 4 CPU cores

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/gripday/gripday-platform.git
cd gripday-platform

# 2. Start the platform
./scripts/quick-start.sh

# 3. Wait for services to be ready (2-3 minutes)
# The script will show progress and health checks
```

### Access Points

Once started, access these services:

- **🌐 Web Application**: http://localhost:3000
- **🔌 API Gateway**: http://localhost:8080
- **📊 Grafana Dashboard**: http://localhost:3001 (admin/admin)
- **🔍 Jaeger Tracing**: http://localhost:16686
- **📈 Prometheus**: http://localhost:9090

### Quick Test

```bash
# Test the API
curl -X GET http://localhost:8080/api/v1/health

# Create a test contact
curl -X POST http://localhost:8080/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "company": "Acme Corp"
  }'
```

## ☸️ Option 2: Kubernetes with Minikube

Recommended for development that mirrors production deployment.

### Prerequisites

- Minikube 1.31+
- kubectl 1.28+
- Helm 3.12+
- Docker Desktop
- 16GB RAM, 4+ CPU cores

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/gripday/gripday-platform.git
cd gripday-platform

# 2. Start Minikube cluster
minikube start --cpus=4 --memory=8192 --disk-size=50g

# 3. Deploy GripDay
./scripts/k8s-quick-start.sh

# 4. Wait for deployment (5-10 minutes)
kubectl wait --for=condition=available --timeout=600s deployment --all
```

### Access Services

```bash
# Get cluster IP
minikube ip

# Port forward for local access
kubectl port-forward svc/api-gateway 8080:8080 &
kubectl port-forward svc/web-app 3000:3000 &
kubectl port-forward svc/grafana 3001:3000 &

# Or use Minikube tunnel for LoadBalancer access
minikube tunnel
```

## ☁️ Option 3: Cloud Deployment

Deploy to your cloud provider for production use.

### AWS EKS

```bash
# 1. Create EKS cluster
eksctl create cluster --name gripday --region us-west-2 --nodes 3

# 2. Deploy GripDay
helm repo add gripday https://charts.gripday.com
helm install gripday gripday/gripday-platform

# 3. Get LoadBalancer URL
kubectl get svc api-gateway -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Google GKE

```bash
# 1. Create GKE cluster
gcloud container clusters create gripday --num-nodes=3 --zone=us-central1-a

# 2. Deploy GripDay
helm repo add gripday https://charts.gripday.com
helm install gripday gripday/gripday-platform

# 3. Get LoadBalancer IP
kubectl get svc api-gateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## 🚀 First Steps After Installation

### 1. Create Your First User

```bash
# Using the web interface
open http://localhost:3000/register

# Or via API
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@yourcompany.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### 2. Import Sample Data

```bash
# Import sample contacts
curl -X POST http://localhost:8080/api/v1/contacts/import \
  -H "Content-Type: multipart/form-data" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@examples/sample-contacts.csv"
```

### 3. Create Your First Email Campaign

```bash
# Create email template
curl -X POST http://localhost:8080/api/v1/emails/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Welcome Email",
    "subject": "Welcome to {{company}}!",
    "content": "<h1>Welcome {{firstName}}!</h1><p>Thanks for joining us.</p>"
  }'

# Send campaign
curl -X POST http://localhost:8080/api/v1/emails/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Welcome Campaign",
    "templateId": 1,
    "segmentId": 1,
    "scheduleType": "immediate"
  }'
```

### 4. Build Your First Form

```bash
# Create lead capture form
curl -X POST http://localhost:8080/api/v1/forms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Contact Form",
    "fields": [
      {"name": "firstName", "type": "text", "label": "First Name", "required": true},
      {"name": "lastName", "type": "text", "label": "Last Name", "required": true},
      {"name": "email", "type": "email", "label": "Email", "required": true},
      {"name": "company", "type": "text", "label": "Company", "required": false}
    ]
  }'
```

## 📊 Verify Installation

### Health Checks

```bash
# Check all services are healthy
curl http://localhost:8080/api/v1/health

# Check individual service health
curl http://localhost:8080/api/v1/auth/health
curl http://localhost:8080/api/v1/contacts/health
curl http://localhost:8080/api/v1/emails/health
curl http://localhost:8080/api/v1/campaigns/health
```

### Performance Test

```bash
# Run basic performance test
./scripts/performance-test.sh

# Expected results:
# - API response time: < 200ms
# - Contact creation: > 100 contacts/second
# - Email processing: > 1000 emails/minute
```

### Monitoring Dashboard

Visit Grafana at http://localhost:3001 to see:

- **System Metrics**: CPU, memory, disk usage
- **Application Metrics**: Request rates, response times, error rates
- **Business Metrics**: Contacts created, emails sent, campaigns active

## 🔧 Configuration

### Environment Variables

Create `.env` file for customization:

```bash
# Database
POSTGRES_PASSWORD=your-secure-password

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis
REDIS_PASSWORD=your-redis-password

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_MULTI_TENANT=false
```

### Custom Configuration

```bash
# Apply custom configuration
cp config/custom.yml config/local.yml
# Edit config/local.yml with your settings

# Restart with new configuration
./scripts/restart.sh
```

## 🛠️ Development Mode

### Enable Hot Reloading

```bash
# Start in development mode
./scripts/dev-mode.sh

# This enables:
# - Hot reloading for Java services
# - Live reload for React frontend
# - Debug ports for all services
# - Detailed logging
```

### Debug Ports

When running in development mode:

- **API Gateway**: 5000
- **Auth Service**: 5001
- **Contact Service**: 5002
- **Email Service**: 5003
- **Campaign Service**: 5004
- **Form Service**: 5005
- **Scoring Service**: 5006
- **Analytics Service**: 5007

## 🚨 Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check Docker resources
docker system df
docker system prune -f

# Check logs
./scripts/logs.sh

# Restart specific service
./scripts/restart-service.sh contact-service
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
docker exec -it gripday-postgres-auth pg_isready

# Reset database
./scripts/reset-database.sh

# Check database logs
docker logs gripday-postgres-auth
```

#### Memory Issues

```bash
# Check memory usage
docker stats

# Increase Docker memory limit to 8GB+
# Restart Docker Desktop
```

### Getting Help

- **📖 Documentation**: [Full documentation](/overview)
- **🐛 Issues**: [GitHub Issues](https://github.com/gripday/gripday-platform/issues)
- **💬 Community**: [Discord Server](https://discord.gg/gripday)
- **📧 Support**: support@gripday.com

## 📚 Next Steps

Now that GripDay is running, explore these areas:

1. **[Architecture Overview](/architecture/system-design)** - Understand the platform design
2. **[API Documentation](/development/api-reference)** - Explore the REST APIs
3. **[User Guide](/user-guide)** - Learn how to use the platform
4. **[Development Guide](/development/getting-started)** - Start contributing
5. **[Deployment Guide](/deployment)** - Deploy to production

## 🎉 Welcome to GripDay!

You now have a fully functional B2B marketing automation platform running locally. The platform includes:

- ✅ **Contact Management** - Manage contacts and companies
- ✅ **Email Marketing** - Create and send email campaigns
- ✅ **Campaign Automation** - Build automated workflows
- ✅ **Form Builder** - Create lead capture forms
- ✅ **Lead Scoring** - Score and qualify leads
- ✅ **Analytics** - Track performance and ROI
- ✅ **API Access** - Full REST API access
- ✅ **Monitoring** - Comprehensive observability

Start exploring the platform and building your marketing automation workflows!

---

_Need help? Check our [troubleshooting guide](/troubleshooting) or join our [community Discord](https://discord.gg/gripday)._
