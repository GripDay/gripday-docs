---
prev: false
next: false
---

# Contributing Guide

Welcome to the GripDay community! We're excited to have you contribute to the first enterprise-grade open-core B2B marketing automation platform. This guide will help you get started with contributing to GripDay.

## 🎯 Ways to Contribute

### Code Contributions

- **Core Platform**: Contribute to the open-source core modules
- **Bug Fixes**: Help fix issues and improve stability
- **Features**: Implement new features and enhancements
- **Performance**: Optimize performance and scalability
- **Tests**: Improve test coverage and quality

### Non-Code Contributions

- **Documentation**: Improve guides, tutorials, and API docs
- **Community Support**: Help other users in discussions and forums
- **Bug Reports**: Report issues and provide detailed feedback
- **Feature Requests**: Suggest new features and improvements
- **Translations**: Help translate the platform to other languages

## 🚀 Getting Started

### 1. Set Up Development Environment

#### Prerequisites

- Java 21+ (OpenJDK recommended)
- Node.js 18+ with npm/pnpm
- Docker Desktop 4.20+
- Git 2.40+
- IDE (IntelliJ IDEA or VS Code recommended)

#### Clone and Setup

```bash
# Fork the repository on GitHub first
git clone https://github.com/YOUR_USERNAME/gripday.git
cd gripday

# Add upstream remote
git remote add upstream https://github.com/GripDay/gripday.git

# Start development environment
./scripts/dev-setup.sh
```

### 2. Development Workflow

#### Create Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

#### Make Changes

```bash
# Make your changes
# Follow coding standards (see below)
# Add tests for new functionality
# Update documentation as needed

# Run tests
./mvnw test
npm test

# Run linting
./mvnw checkstyle:check
npm run lint
```

#### Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit format
git commit -m "feat(contact-service): add advanced search functionality

- Implement Elasticsearch integration
- Add search filters for name, email, company
- Include pagination and sorting
- Add comprehensive tests

Closes #123"
```

#### Submit Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# Fill out the PR template completely
# Link related issues
# Request review from maintainers
```

## 📝 Coding Standards

### Java Code Style

#### General Principles

- Follow Google Java Style Guide
- Use meaningful variable and method names
- Keep methods small and focused (< 20 lines preferred)
- Write self-documenting code with clear intent

#### Code Formatting

```java
// Use 4 spaces for indentation
public class ContactService {

    private final ContactRepository contactRepository;
    private final EventPublisher eventPublisher;

    public ContactService(ContactRepository contactRepository,
                         EventPublisher eventPublisher) {
        this.contactRepository = contactRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ContactDto createContact(CreateContactRequest request) {
        // Validate input
        validateContactRequest(request);

        // Create entity
        Contact contact = Contact.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail())
            .tenantId(TenantContext.getTenantId())
            .build();

        // Save and publish event
        Contact savedContact = contactRepository.save(contact);
        eventPublisher.publishContactCreated(savedContact);

        return ContactDto.from(savedContact);
    }
}
```

#### Documentation

```java
/**
 * Service for managing contact lifecycle operations.
 *
 * <p>This service handles CRUD operations for contacts, including
 * validation, event publishing, and integration with other services.
 *
 * @author Your Name
 * @since 1.0.0
 */
@Service
@Transactional
public class ContactService {

    /**
     * Creates a new contact with the provided information.
     *
     * @param request the contact creation request containing contact details
     * @return the created contact as a DTO
     * @throws ValidationException if the request data is invalid
     * @throws DuplicateEmailException if a contact with the email already exists
     */
    public ContactDto createContact(CreateContactRequest request) {
        // Implementation
    }
}
```

### JavaScript/TypeScript Code Style

#### React Components

```typescript
// Use functional components with hooks
import React, { useState, useEffect } from 'react';
import { Contact, ContactService } from '@/services';

interface ContactListProps {
  searchTerm?: string;
  onContactSelect: (contact: Contact) => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  searchTerm,
  onContactSelect
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      try {
        const result = await ContactService.getContacts({ search: searchTerm });
        setContacts(result.data);
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [searchTerm]);

  if (loading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="contact-list">
      {contacts.map(contact => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onClick={() => onContactSelect(contact)}
        />
      ))}
    </div>
  );
};
```

### Database Migrations

#### Liquibase Migration Format

```sql
-- V1.2.0__Add_contact_scoring_fields.sql
-- Description: Add scoring fields to contacts table for lead qualification

-- Add scoring columns
ALTER TABLE contacts
ADD COLUMN score INTEGER DEFAULT 0,
ADD COLUMN score_updated_at TIMESTAMP,
ADD COLUMN qualification_status VARCHAR(20) DEFAULT 'unqualified';

-- Create index for performance
CREATE INDEX idx_contacts_score ON contacts(score DESC);
CREATE INDEX idx_contacts_qualification_status ON contacts(qualification_status);

-- Update existing contacts
UPDATE contacts
SET score = 0,
    score_updated_at = CURRENT_TIMESTAMP,
    qualification_status = 'unqualified'
WHERE score IS NULL;

-- Add constraints
ALTER TABLE contacts
ADD CONSTRAINT chk_contacts_score CHECK (score >= 0 AND score <= 1000),
ADD CONSTRAINT chk_contacts_qualification_status
    CHECK (qualification_status IN ('unqualified', 'marketing_qualified', 'sales_qualified', 'customer'));
```

## 🧪 Testing Guidelines

### Unit Tests

#### Java Unit Tests

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
    @DisplayName("Should create contact successfully with valid data")
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
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getEmail()).isEqualTo("john.doe@example.com");

        verify(contactRepository).save(any(Contact.class));
        verify(eventPublisher).publishContactCreated(savedContact);
    }

    @Test
    @DisplayName("Should throw ValidationException for invalid email")
    void shouldThrowValidationExceptionForInvalidEmail() {
        // Given
        CreateContactRequest request = CreateContactRequest.builder()
            .firstName("John")
            .lastName("Doe")
            .email("invalid-email")
            .build();

        // When & Then
        assertThatThrownBy(() -> contactService.createContact(request))
            .isInstanceOf(ValidationException.class)
            .hasMessageContaining("Invalid email format");
    }
}
```

#### React Component Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactList } from './ContactList';
import { ContactService } from '@/services';

// Mock the service
jest.mock('@/services');
const mockContactService = ContactService as jest.Mocked<typeof ContactService>;

describe('ContactList', () => {
  const mockContacts = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
  ];

  beforeEach(() => {
    mockContactService.getContacts.mockResolvedValue({
      data: mockContacts,
      total: 2
    });
  });

  it('should render contacts list', async () => {
    const onContactSelect = jest.fn();

    render(<ContactList onContactSelect={onContactSelect} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('should call onContactSelect when contact is clicked', async () => {
    const onContactSelect = jest.fn();

    render(<ContactList onContactSelect={onContactSelect} />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('John Doe'));
    });

    expect(onContactSelect).toHaveBeenCalledWith(mockContacts[0]);
  });
});
```

### Integration Tests

#### Spring Boot Integration Tests

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

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ContactRepository contactRepository;

    @BeforeEach
    void setUp() {
        contactRepository.deleteAll();
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
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo("john.doe@example.com");

        // Verify in database
        List<Contact> contacts = contactRepository.findAll();
        assertThat(contacts).hasSize(1);
        assertThat(contacts.get(0).getEmail()).isEqualTo("john.doe@example.com");
    }
}
```

### Test Coverage Requirements

- **Minimum Coverage**: 80% for all new code
- **Critical Paths**: 95% coverage for business logic
- **Integration Tests**: Cover all API endpoints
- **End-to-End Tests**: Cover major user workflows

## 📋 Pull Request Process

### PR Template

When creating a pull request, use this template:

```markdown
## Description

Brief description of the changes and their purpose.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Related Issues

Closes #123
Related to #456

## Changes Made

- List the main changes made
- Include any architectural decisions
- Mention any new dependencies

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Performance testing (if applicable)

## Documentation

- [ ] Code comments added/updated
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] README updated (if applicable)

## Checklist

- [ ] Code follows the project's coding standards
- [ ] Self-review of the code completed
- [ ] Tests pass locally
- [ ] No new warnings or errors introduced
- [ ] Backward compatibility maintained (or breaking changes documented)

## Screenshots (if applicable)

Add screenshots for UI changes.

## Additional Notes

Any additional information that reviewers should know.
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: All tests must pass with adequate coverage
4. **Documentation**: Documentation must be updated for user-facing changes
5. **Approval**: Maintainer approval required before merge

## 🏗️ Architecture Guidelines

### Microservices Principles

- **Single Responsibility**: Each service has one clear business purpose
- **Loose Coupling**: Services communicate via well-defined APIs and events
- **High Cohesion**: Related functionality grouped within services
- **Database per Service**: Each service owns its data
- **Stateless**: Services don't maintain client-specific state

### Event-Driven Architecture

```java
// Publishing events
@Service
public class ContactService {

    public ContactDto createContact(CreateContactRequest request) {
        Contact contact = // ... create contact

        // Publish domain event
        ContactCreatedEvent event = ContactCreatedEvent.builder()
            .contactId(contact.getId())
            .tenantId(contact.getTenantId())
            .timestamp(Instant.now())
            .build();

        eventPublisher.publish("contact.created", event);

        return ContactDto.from(contact);
    }
}

// Consuming events
@Component
public class CampaignEventHandler {

    @EventListener
    public void handleContactCreated(ContactCreatedEvent event) {
        // Trigger welcome campaign
        campaignService.triggerWelcomeCampaign(event.getContactId());
    }
}
```

### API Design Guidelines

- **RESTful**: Follow REST principles and HTTP semantics
- **Versioning**: Use URL versioning (e.g., `/api/v1/contacts`)
- **Consistent**: Use consistent naming and response formats
- **Error Handling**: Provide meaningful error messages and status codes
- **Documentation**: Comprehensive OpenAPI documentation

```java
@RestController
@RequestMapping("/api/v1/contacts")
@Validated
@Tag(name = "Contacts", description = "Contact management operations")
public class ContactController {

    @GetMapping
    @Operation(summary = "List contacts", description = "Retrieve a paginated list of contacts")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Contacts retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<PagedResponse<ContactDto>> getContacts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Search term") @RequestParam(required = false) String search) {

        PagedResponse<ContactDto> contacts = contactService.getContacts(page, size, search);
        return ResponseEntity.ok(contacts);
    }
}
```

## 🔒 Security Guidelines

### Authentication & Authorization

- **JWT Tokens**: Use for stateless authentication
- **Role-Based Access**: Implement granular permissions
- **Tenant Isolation**: Ensure complete data isolation
- **Input Validation**: Validate all inputs thoroughly

### Secure Coding Practices

```java
@Service
@Validated
public class ContactService {

    @PreAuthorize("hasPermission('CONTACT', 'CREATE')")
    public ContactDto createContact(@Valid CreateContactRequest request) {
        // Validate tenant context
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new SecurityException("Tenant context required");
        }

        // Sanitize input
        String email = sanitizeEmail(request.getEmail());

        // Create contact with tenant isolation
        Contact contact = Contact.builder()
            .firstName(sanitizeInput(request.getFirstName()))
            .lastName(sanitizeInput(request.getLastName()))
            .email(email)
            .tenantId(tenantId)
            .build();

        return ContactDto.from(contactRepository.save(contact));
    }
}
```

## 📚 Documentation Standards

### Code Documentation

- **JavaDoc**: All public methods and classes
- **Inline Comments**: Complex business logic
- **README**: Each service needs comprehensive README
- **API Docs**: OpenAPI specifications for all endpoints

### User Documentation

- **Getting Started**: Clear setup instructions
- **Tutorials**: Step-by-step guides for common tasks
- **API Reference**: Complete API documentation
- **Troubleshooting**: Common issues and solutions

## 🎉 Recognition

### Contributor Recognition

- **Contributors Page**: All contributors listed on website
- **Release Notes**: Major contributions highlighted
- **Community Spotlight**: Featured contributors in newsletters
- **Swag**: GripDay swag for significant contributions

### Maintainer Path

Active contributors may be invited to become maintainers:

- **Requirements**: Consistent high-quality contributions
- **Responsibilities**: Code review, issue triage, community support
- **Benefits**: Direct commit access, decision-making participation

## 📞 Getting Help

### Community Support

- **Discord**: [discord.gg/gripday](https://discord.gg/gripday)
- **GitHub Discussions**: [github.com/GripDay/gripday/discussions](https://github.com/GripDay/gripday/discussions)
- **Stack Overflow**: Tag questions with `gripday`

### Maintainer Contact

- **Technical Questions**: Create GitHub issue
- **Security Issues**: security@gripday.com
- **General Inquiries**: community@gripday.com

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read our [Code of Conduct](./code-of-conduct) before participating.

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome people of all backgrounds and experience levels
- **Be Collaborative**: Work together constructively
- **Be Professional**: Maintain professional communication

---

Thank you for contributing to GripDay! Together, we're building the future of open-core B2B marketing automation. 🚀
