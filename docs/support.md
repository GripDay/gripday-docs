# Support

Get help with GripDay through our comprehensive support channels. Whether you're a developer, user, or business, we're here to help you succeed with the open-core B2B marketing automation platform.

## 🚀 Quick Help

### Common Issues

- **[Installation Problems](#installation-support)** - Setup and deployment issues
- **[API Questions](#api-support)** - Integration and development help
- **[Performance Issues](#performance-support)** - Optimization and scaling
- **[Security Concerns](#security-support)** - Security best practices and issues

### Immediate Assistance

- **🔍 Search Documentation**: Use the search bar above to find answers quickly
- **📖 Check FAQ**: Review our [Frequently Asked Questions](#frequently-asked-questions)
- **🐛 Known Issues**: Check [GitHub Issues](https://github.com/gripday/gripday-platform/issues) for known problems

## 📚 Self-Service Resources

### Documentation

- **[Getting Started](/development/getting-started)** - Set up your development environment
- **[Installation Guide](/installation)** - Complete installation instructions
- **[Architecture Guide](/architecture/system-design)** - Understand the platform design
- **[Configuration Guide](/configuration)** - Detailed configuration options
- **[Monitoring Guide](/monitoring)** - Set up monitoring and alerting

### Video Tutorials

- **Platform Overview** - Introduction to GripDay features
- **Installation Walkthrough** - Step-by-step setup guide
- **API Integration** - How to integrate with GripDay APIs
- **Deployment Best Practices** - Production deployment guide

### Sample Code & Examples

- **[GitHub Examples](https://github.com/gripday/gripday-examples)** - Code samples and integrations
- **[Postman Collection](https://www.postman.com/gripday/workspace/gripday-api)** - API testing collection
- **[Docker Compose Examples](https://github.com/gripday/gripday-docker-examples)** - Deployment examples

## 💬 Community Support

### Discord Community

Join our active Discord community for real-time help and discussions.

**[Join Discord Server](https://discord.gg/gripday)**

**Channels:**

- `#general` - General discussions and announcements
- `#help` - Get help from community members
- `#development` - Development discussions and questions
- `#api-integration` - API integration help
- `#deployment` - Deployment and infrastructure questions
- `#feature-requests` - Suggest new features
- `#showcase` - Show off your GripDay implementations

**Community Guidelines:**

- Be respectful and helpful to all members
- Search previous messages before asking questions
- Use appropriate channels for different topics
- Provide context when asking for help
- Share solutions when you find them

### GitHub Discussions

Participate in longer-form discussions and community Q&A.

**[GitHub Discussions](https://github.com/gripday/gripday-platform/discussions)**

**Categories:**

- **General** - General platform discussions
- **Q&A** - Questions and answers
- **Ideas** - Feature ideas and suggestions
- **Show and Tell** - Share your projects and use cases
- **Development** - Development-related discussions

### Stack Overflow

Ask technical questions and get answers from the broader developer community.

**Tag your questions with:** `gripday` `marketing-automation` `spring-boot` `react`

**[Ask on Stack Overflow](https://stackoverflow.com/questions/tagged/gripday)**

## 🐛 Bug Reports & Feature Requests

### Reporting Bugs

Help us improve GripDay by reporting bugs and issues.

**[Create Bug Report](https://github.com/gripday/gripday-platform/issues/new?template=bug_report.md)**

**Include in your bug report:**

- **Environment**: OS, Docker version, Kubernetes version
- **GripDay Version**: Which version you're using
- **Steps to Reproduce**: Clear steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Logs**: Relevant log files and error messages
- **Screenshots**: Visual evidence if applicable

### Feature Requests

Suggest new features and improvements to make GripDay better.

**[Request Feature](https://github.com/gripday/gripday-platform/issues/new?template=feature_request.md)**

**Include in your feature request:**

- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: How should this feature work?
- **Use Case**: Real-world scenarios where this would be useful
- **Alternatives**: Other solutions you've considered
- **Additional Context**: Any other relevant information

## 🔧 Technical Support

### Installation Support

#### Docker Compose Issues

```bash
# Check Docker status
docker --version
docker-compose --version

# View service logs
docker-compose logs [service-name]

# Restart services
docker-compose restart [service-name]

# Clean restart
docker-compose down && docker-compose up -d
```

#### Kubernetes Issues

```bash
# Check cluster status
kubectl cluster-info
kubectl get nodes

# Check pod status
kubectl get pods -n gripday

# View pod logs
kubectl logs -f deployment/[service-name] -n gripday

# Describe problematic resources
kubectl describe pod [pod-name] -n gripday
```

#### Common Installation Problems

**Port Conflicts:**

```bash
# Check what's using a port
sudo lsof -i :8080

# Kill process using port
sudo kill -9 [PID]
```

**Memory Issues:**

```bash
# Check available memory
free -h

# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory
```

**Permission Issues:**

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER ./gripday-platform
```

### API Support

#### Authentication Issues

```bash
# Test authentication endpoint
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Verify JWT token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/v1/auth/profile
```

#### API Integration Help

- **OpenAPI Documentation**: Available at `/swagger-ui.html`
- **Postman Collection**: Import our collection for testing
- **Rate Limiting**: Check response headers for rate limit info
- **Error Codes**: Refer to API documentation for error meanings

### Performance Support

#### Monitoring and Diagnostics

```bash
# Check system resources
docker stats

# View application metrics
curl http://localhost:8080/actuator/metrics

# Check database performance
kubectl exec -it postgresql-0 -n gripday -- \
  psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

#### Performance Optimization

- **Database Indexing**: Ensure proper indexes on frequently queried fields
- **Connection Pooling**: Configure appropriate connection pool sizes
- **Caching**: Implement Redis caching for frequently accessed data
- **Load Balancing**: Use multiple replicas for high-traffic services

### Security Support

#### Security Best Practices

- **JWT Secrets**: Use strong, unique JWT secrets (32+ characters)
- **HTTPS**: Always use HTTPS in production
- **Database Security**: Use strong passwords and restrict access
- **Network Security**: Implement proper firewall rules
- **Regular Updates**: Keep all components updated

#### Reporting Security Issues

**🔒 Security issues should be reported privately to: security@gripday.com**

**Do not create public GitHub issues for security vulnerabilities.**

## 🏢 Commercial Support

### Professional Support Plans

#### Community Support (Free)

- **Community Discord** - Community-driven support
- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Comprehensive self-service resources
- **Response Time** - Best effort by community

#### Professional Support ($99/month)

- **Email Support** - Direct email support channel
- **Priority Response** - 24-hour response time
- **Installation Assistance** - Help with setup and deployment
- **Configuration Review** - Best practices review
- **Monthly Office Hours** - 1-hour monthly consultation

#### Enterprise Support ($499/month)

- **Dedicated Support** - Dedicated support engineer
- **Phone Support** - Direct phone support line
- **Priority Response** - 4-hour response time
- **Custom Integration** - Help with custom integrations
- **Performance Optimization** - Performance tuning assistance
- **Training Sessions** - Team training and onboarding

#### Enterprise Plus ($999/month)

- **24/7 Support** - Round-the-clock support coverage
- **1-hour Response** - Critical issue response time
- **On-site Support** - Available for critical deployments
- **Custom Development** - Limited custom development hours
- **Architecture Review** - Comprehensive architecture review
- **Dedicated Success Manager** - Dedicated customer success manager

### Contact Commercial Support

- **Email**: enterprise@gripday.com
- **Phone**: +1 (555) 123-4567
- **Sales**: sales@gripday.com
- **Partnerships**: partners@gripday.com

## 📞 Contact Information

### General Inquiries

- **Email**: hello@gripday.com
- **Website**: [gripday.com](https://gripday.com)
- **Documentation**: [docs.gripday.com](https://docs.gripday.com)

### Development Team

- **GitHub**: [github.com/gripday](https://github.com/gripday)
- **Technical Questions**: Create GitHub issue
- **Development Chat**: Discord #development channel

### Business Inquiries

- **Sales**: sales@gripday.com
- **Partnerships**: partners@gripday.com
- **Press**: press@gripday.com
- **Careers**: careers@gripday.com

### Security

- **Security Issues**: security@gripday.com
- **Bug Bounty**: security@gripday.com
- **Compliance**: compliance@gripday.com

## ❓ Frequently Asked Questions

### General Questions

**Q: Is GripDay really free?**
A: Yes! The core platform is completely free and open-source. We offer commercial plugins and support services for advanced features and enterprise needs.

**Q: What's the difference between open-core and open-source?**
A: Open-core means the core platform is open-source (free), while advanced features and enterprise services are commercial. This model ensures sustainable development while keeping the platform accessible.

**Q: Can I use GripDay for commercial purposes?**
A: Absolutely! The open-source core is licensed under MIT, allowing commercial use. Commercial plugins require separate licensing.

### Technical Questions

**Q: What are the minimum system requirements?**
A: 4 CPU cores, 8GB RAM, 50GB storage for basic deployment. See our [Installation Guide](/installation) for detailed requirements.

**Q: Does GripDay support multi-tenancy?**
A: Yes! GripDay is built with multi-tenancy from the ground up, with complete tenant isolation at the database and application levels.

**Q: Can I integrate GripDay with my existing CRM?**
A: Yes! GripDay provides REST APIs and pre-built integrations for popular CRMs like Salesforce, HubSpot, and Pipedrive.

**Q: Is GripDay GDPR compliant?**
A: Yes! GripDay includes built-in GDPR compliance features including data encryption, audit trails, and data deletion capabilities.

### Deployment Questions

**Q: Can I deploy GripDay on my own servers?**
A: Yes! GripDay supports self-hosted deployment using Docker Compose or Kubernetes on your own infrastructure.

**Q: Do you offer cloud hosting?**
A: We offer managed cloud hosting as part of our commercial services. Contact sales@gripday.com for details.

**Q: How do I backup my GripDay data?**
A: GripDay includes automated backup capabilities. See our [Architecture Guide](/architecture/deployment) for deployment and backup strategies.

### Business Questions

**Q: What support is available?**
A: We offer community support (free) through Discord and GitHub, plus professional and enterprise support plans with SLAs.

**Q: Can I white-label GripDay?**
A: Yes! White-labeling is available as part of our commercial offerings. Contact sales@gripday.com for details.

**Q: Do you offer training and consulting?**
A: Yes! We provide training, consulting, and implementation services. Contact professional-services@gripday.com.

## 🎯 Getting Better Support

### Before Asking for Help

1. **Search Documentation** - Check if your question is already answered
2. **Check GitHub Issues** - Look for existing issues and solutions
3. **Review Logs** - Gather relevant log files and error messages
4. **Prepare Context** - Have your environment details ready
5. **Try Basic Troubleshooting** - Restart services, check configurations

### Providing Good Information

When asking for help, include:

- **GripDay Version** - Which version you're using
- **Environment** - OS, Docker version, Kubernetes version
- **Error Messages** - Complete error messages and stack traces
- **Steps to Reproduce** - Clear steps to reproduce the issue
- **Configuration** - Relevant configuration files (sanitized)
- **Logs** - Relevant log entries

### Response Time Expectations

- **Community Support** - Best effort, typically 24-48 hours
- **Professional Support** - 24 hours for standard issues
- **Enterprise Support** - 4 hours for standard, 1 hour for critical
- **Security Issues** - 24 hours acknowledgment, varies by severity

---

## 🤝 Contributing to Support

Help make GripDay support better:

- **Answer Questions** - Help other users in Discord and GitHub
- **Improve Documentation** - Submit documentation improvements
- **Share Solutions** - Document solutions you've found
- **Report Issues** - Help identify and report problems
- **Provide Feedback** - Share your experience and suggestions

---

_We're here to help you succeed with GripDay! Don't hesitate to reach out through any of our support channels._
