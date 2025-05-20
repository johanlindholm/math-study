# Cucumber BDD Tests for Math Study Project

This directory contains Behavior-Driven Development (BDD) tests using Cucumber.js for the Math Study project.

## Directory Structure

- `features/`: Contains the feature files written in Gherkin syntax
  - `math-game.feature`: Describes the math game scenarios
- `features/step_definitions/`: Contains the step definition files
  - `math-game.steps.ts`: Implements the steps for math game scenarios
- `features/support/`: Contains support files
  - `world.ts`: Defines the custom world for sharing context between steps

## Running the Tests

To run the Cucumber tests, use one of the following npm scripts:

```bash
# Run tests with default formatter
npm run test:cucumber

# Run tests with pretty formatter for better readability
npm run test:cucumber:pretty
```

## Writing Tests

### Feature Files

Feature files are written in Gherkin syntax and describe the behavior of the application from a user's perspective. They consist of scenarios, each with given-when-then steps.

Example:
```gherkin
Feature: Math Game
  As a user
  I want to be able to play different kinds of math games
  So that I can practice my math skills

Scenario: User can select game mode with a drop down
  Given the user is on the math game page
  When the user clicks on dropdown and clicks multiplication
  Then the user should be ready to start multiplication game
```

### Step Definitions

Step definitions map the Gherkin steps to JavaScript/TypeScript code that tests the application. They are defined using the `Given`, `When`, and `Then` functions from Cucumber.js.

Example:
```typescript
Given('the user is on the math game page', function(this: CustomWorld) {
  // Test code here
});
```

### Custom World

The custom world provides a way to share context between steps. It's defined in `features/support/world.ts` and can include properties and methods that are useful for testing.

## Notes

- Some tests may fail if the implementation doesn't match the feature file. This is expected behavior in BDD, where tests are written before implementation.
- The tests use mocks to simulate the behavior of the application, as direct rendering of React components in Cucumber tests can be challenging.