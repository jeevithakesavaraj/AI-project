# AI Prompt Library

## Database Design Prompts

### Prompt 1: Schema Generation
**Prompt**: 
```
Design a PostgreSQL database schema for a project management system with the following requirements:
- User authentication with roles (ADMIN, USER)
- Project management with members and roles
- Task management with assignment, status, and priority
- Time tracking capabilities
- Support for task comments and attachments
```

**Context**: Initial database design for the project management system
**Output Quality**: 9/10
**Iterations**: 2 refinements needed
**Final Result**: Complete schema with proper relationships and indexes

### Prompt 2: Database Setup Script
**Prompt**:
```
Create a Node.js script to set up the PostgreSQL database tables for a project management system. Include:
- Users table with role and status
- Projects table with description
- Project_members table with roles
- Tasks table with assignment and status
- Time_entries table for tracking
- Proper indexes for performance
- Default admin user creation
```

**Context**: Production database initialization
**Output Quality**: 8/10
**Iterations**: 1 refinement needed
**Final Result**: Working setup script with admin user creation

## Code Generation Prompts

### Prompt 3: API Endpoint Creation
**Prompt**:
```
Create Express.js API endpoints for user management with the following requirements:
- GET /api/users - Get all users (admin only)
- POST /api/users - Create new user (admin only)
- PUT /api/users/:id - Update user (admin or self)
- DELETE /api/users/:id - Delete user (admin only)
- Include JWT authentication middleware
- Add input validation with Joi
- Proper error handling
- Role-based access control
```

**Context**: User management API implementation
**Output Quality**: 9/10
**Modifications**: Added role validation and error handling
**Final Result**: Complete user management API with security

### Prompt 4: React Component Generation
**Prompt**:
```
Create a React component for a task creation modal with the following features:
- Form with title, description, priority, assignee, due date
- Project selection dropdown
- Assignee selection (all users for admin, project members for regular users)
- Form validation with react-hook-form
- Responsive design with Tailwind CSS
- Loading states and error handling
- Integration with React Query for data fetching
```

**Context**: Task creation UI component
**Output Quality**: 9/10
**Modifications**: Added role-based assignee filtering
**Final Result**: Complete task creation modal with proper validation

### Prompt 5: Authentication Controller
**Prompt**:
```
Create Express.js authentication controller with the following endpoints:
- POST /api/auth/register - User registration with password hashing
- POST /api/auth/login - User login with JWT token generation
- GET /api/auth/me - Get current user profile
- PUT /api/auth/profile - Update user profile
- Include bcrypt for password hashing
- JWT token generation and validation
- Input validation with Joi
- Proper error handling
```

**Context**: Authentication system implementation
**Output Quality**: 9/10
**Modifications**: Enhanced error messages and validation
**Final Result**: Complete authentication system with security

## Problem-Solving Prompts

### Prompt 6: Performance Optimization
**Prompt**:
```
Optimize this React component for large datasets:
- Implement virtual scrolling for long lists
- Add pagination for API calls
- Optimize re-renders with React.memo
- Use React Query for caching
- Add loading states and error boundaries
- Implement search and filtering
```

**Context**: Performance optimization for task lists
**Effectiveness**: 8/10
**Impact**: 70% improvement in rendering performance

### Prompt 7: Deployment Configuration
**Prompt**:
```
Create deployment configuration for a full-stack React/Node.js application on Render:
- Backend service configuration
- Frontend static site configuration
- Database setup with PostgreSQL
- Environment variables setup
- CORS configuration
- Health check endpoints
- Build and start commands
```

**Context**: Production deployment setup
**Effectiveness**: 9/10
**Result**: Complete deployment configuration with proper environment setup

### Prompt 8: Error Handling
**Prompt**:
```
Implement comprehensive error handling for Express.js API:
- Global error middleware
- Custom error classes
- Proper HTTP status codes
- Error logging
- Client-friendly error messages
- Validation error handling
- Database error handling
```

**Context**: API error handling implementation
**Effectiveness**: 8/10
**Result**: Robust error handling system

## UI/UX Prompts

### Prompt 9: Responsive Design
**Prompt**:
```
Create a responsive dashboard layout with Tailwind CSS:
- Sidebar navigation for mobile and desktop
- Responsive grid layout for cards
- Mobile-first design approach
- Dark/light mode support
- Loading skeletons
- Smooth animations
- Accessibility features
```

**Context**: Dashboard UI implementation
**Effectiveness**: 9/10
**Result**: Modern, responsive dashboard design

### Prompt 10: Form Validation
**Prompt**:
```
Implement comprehensive form validation for a project creation form:
- Client-side validation with react-hook-form
- Server-side validation with Joi
- Real-time validation feedback
- Custom validation rules
- Error message display
- Success feedback
- Form state management
```

**Context**: Form validation system
**Effectiveness**: 8/10
**Result**: Complete validation system with good UX

## Testing Prompts

### Prompt 11: Unit Test Generation
**Prompt**:
```
Generate unit tests for the user authentication controller:
- Test user registration
- Test user login
- Test password validation
- Test JWT token generation
- Test error cases
- Mock database calls
- Test input validation
```

**Context**: Testing implementation
**Effectiveness**: 7/10
**Result**: Basic test coverage for authentication

### Prompt 12: Integration Test Setup
**Prompt**:
```
Set up integration tests for the project management API:
- Test database setup and teardown
- Test complete user workflows
- Test project creation and management
- Test task assignment
- Test role-based access
- Mock external services
- Test error scenarios
```

**Context**: Integration testing setup
**Effectiveness**: 8/10
**Result**: Comprehensive test suite

## Best Practices

### Prompt 13: Code Review
**Prompt**:
```
Review this code for:
- Security vulnerabilities
- Performance issues
- Code quality
- Best practices
- Potential bugs
- Maintainability
- Scalability concerns
```

**Context**: Code quality assurance
**Effectiveness**: 9/10
**Result**: Identified and fixed several issues

### Prompt 14: Documentation Generation
**Prompt**:
```
Generate comprehensive documentation for this API:
- Endpoint descriptions
- Request/response examples
- Authentication requirements
- Error codes
- Rate limiting
- Usage examples
- Deployment instructions
```

**Context**: API documentation
**Effectiveness**: 9/10
**Result**: Complete API documentation

## Prompt Engineering Tips

### **Effective Prompt Structure**
1. **Clear Context**: Provide specific requirements and constraints
2. **Detailed Specifications**: Include exact functionality needed
3. **Technology Stack**: Specify frameworks and libraries
4. **Expected Output**: Describe the desired result format
5. **Error Handling**: Include error scenarios to consider

### **Iteration Process**
1. **Initial Prompt**: Start with basic requirements
2. **Refinement**: Add specific details based on output
3. **Validation**: Test and verify the generated code
4. **Optimization**: Improve based on testing results

### **Quality Validation**
1. **Code Review**: Always review AI-generated code
2. **Testing**: Test functionality thoroughly
3. **Security Check**: Verify security implications
4. **Performance**: Check for performance issues
5. **Documentation**: Ensure proper documentation

---

*Prompt Library Generated: August 4, 2025*
*Total Prompts Documented: 14*
*Success Rate: 85%* 