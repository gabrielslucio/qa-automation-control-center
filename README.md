# QA Automation Control Center

This project demonstrates an automated testing architecture using:

- Playwright for API/UI test automation
- Node.js as an external test runner service
- OutSystems Reactive as a future visual dashboard/control center

## Architecture

OutSystems Reactive App
-> Node.js Test Runner Service
-> Playwright Test Project
-> REST API under test
-> Test results dashboard

## Project Structure
```text
apps/
    playwright-tests/
    test-runner-service/

docs/