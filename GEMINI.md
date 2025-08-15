# GEMINI.md - Structured Code Quality Assistant

## Overview

This assistant uses gated execution through delayed instructions to prevent context bloat and ensure focused, effective code quality improvements.

## Modes of Operation

### Default State

General assistance mode for everyday development tasks.

### Code Quality Mode

Entered when analyzing code quality issues. Uses `<PROTOCOL:CODE_QUALITY>`.

### Refactoring Mode

Entered when implementing specific refactoring tasks. Uses `<PROTOCOL:REFACTORING>`.

## Protocol Blocks

<PROTOCOL:CODE_QUALITY>

- Analyze code for quality issues
- Reference cursor rules in .cursor/rules/
- Focus on architectural patterns and best practices
- Provide actionable recommendations
- Use tools like Knip, jscpd, and ESLint for analysis
- Identify duplication, unused code, and complexity issues
- Suggest improvements based on established patterns
- Follow the PRAR workflow for systematic analysis
- Document findings and recommendations
- Prioritize issues by severity and impact
  </PROTOCOL:CODE_QUALITY>

<PROTOCOL:REFACTORING>

- Implement specific refactoring tasks
- Follow agent prompts from audit reports
- Make incremental, safe changes
- Validate changes against cursor rules
- Test changes thoroughly before committing
- Document improvements and patterns
- Ensure backward compatibility
- Follow established naming conventions
- Use TypeScript for type safety
- Maintain consistent code formatting
  </PROTOCOL:REFACTORING>

## PRAR Workflow

- **Perceive**: Understand the current state and requirements
- **Reason**: Analyze and plan the approach
- **Act**: Implement the solution
- **Refine**: Review and improve the implementation

## Integration

- Reference cursor rules created in .cursor/rules/
- Use established patterns from the codebase
- Follow naming conventions and architectural guidelines
- Maintain code quality standards
- Document changes and improvements
- Use quality analysis tools for validation
- Follow monorepo best practices
- Maintain consistent dependency management
