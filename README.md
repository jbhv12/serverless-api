# Workout Tracker API

## Description

This project, Workout Tracker API, is a showcase of my skills as a cloud developer. It was created as an application to Serverless Guru. The application is a Node.js project that provides endpoints for managing users, goals, and workouts. 

This application utilizes a variety of technologies including Node.js for the backend, AWS Lambda for serverless computing, AWS API Gateway for managing and routing API requests, Docker for containerization, and the Serverless framework for managing and deploying the Lambda functions. Data is stored in a DynamoDB database, and the application is set up with a GitHub Actions workflow for continuous deployment. The API is documented using OpenAPI, with all definitions located in the `docs` directory.

The project also supports multistage deployment with GitHub Actions. The `main` branch is deployed to the production environment, ensuring that only stable and tested code is released. The `dev` branch, on the other hand, is deployed to the test environment, allowing for continuous integration and testing of new features and changes before they are merged into the main branch.

## Quick Start

### Hosted Version

To quickly try out the Workout Tracker API, you can access the stable hosted version at [https://jmb6cgzee2.execute-api.us-west-2.amazonaws.com/](https://jmb6cgzee2.execute-api.us-west-2.amazonaws.com/).


The development version can be accessed at [https://krxnwyfj7f.execute-api.us-west-2.amazonaws.com/docs/](https://krxnwyfj7f.execute-api.us-west-2.amazonaws.com/docs/).

### Running locally

If you prefer to run the Workout Tracker API locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/jbhv12/serverless-workout-tracker-api.git
    ```
2. Start the application using Docker Compose:

    ```bash
    docker-compose up
    ```
3. Once the application is running, you can access the different functions at the following URLs:
    - Users function: [http://localhost:3001](http://localhost:3001)
    - Goals function: [http://localhost:3002](http://localhost:3002)
    - Workouts function: [http://localhost:3003](http://localhost:3003)
    - Docs function (API documentation): [http://localhost:3004](http://localhost:3004)
