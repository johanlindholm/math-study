Feature: Math Game
    As a user
    I want to be able to play different kinds of math games
    So that I can practice my math skills

    Game Types:
    - Multiplication
    - Addition
    - Subtraction

Scenario: User can view available game modes
    Given the user is on the math games page
    Then the user should see the following game modes:
        | Mode         | Description                       |
        | Multiplication | Practice your multiplication skills |
        | Addition      | Practice your addition skills      |
        | Subtraction   | Practice your subtraction skills   |

Scenario: User can start a multiplication game
    Given the user is on the math games page
    When the user clicks on the "Multiplication" game card
    Then the user should be taken to the multiplication game
    And the game should display a multiplication problem

Scenario: User can start an addition game
    Given the user is on the math games page
    When the user clicks on the "Addition" game card
    Then the user should be taken to the addition game
    And the game should display an addition problem

Scenario: User can start a subtraction game
    Given the user is on the math games page
    When the user clicks on the "Subtraction" game card
    Then the user should be taken to the subtraction game
    And the game should display a subtraction problem

Scenario: User can answer a question correctly
    Given the user is playing the math game
    When the user selects the correct answer
    Then the user's score should increase by 1
    And a new problem should be displayed
    And confetti animation should be shown

Scenario: User can answer a question incorrectly
    Given the user is playing the math game
    When the user selects an incorrect answer
    Then the user should be taken back to the game selection page

Scenario: User can end the game
    Given the user is playing the math game
    When the user clicks the "End Game" button
    Then the user should be taken back to the game selection page

Scenario: Game has a timer
    Given the user is playing the math game
    Then the user should see a countdown timer
    When the timer reaches zero
    Then the game should end automatically
    And the user should be taken back to the game selection page

Scenario: Game increases difficulty with score
    Given the user is playing the math game
    When the user answers several questions correctly
    Then the number of answer options should increase
    And the difficulty of the problems should increase

