# EcoCraft Backend

This repo is a RESTful API for the EcoCraft application. It will run on Google Cloud Run. The following are steps to running it locally:

## Local Development
1. Get the service account key with permission to Firestore and Cloud Storage. Then, place it into `config/service-account-key.json`. The service account key is used only for local development. This is because, in production, the service account will be mounted with Cloud Run service.
2. Copy the `.env.example` file into `.env`. Fill the key value.
3. Start the development:
```bash
npm install
npm run dev
```

### API Documentation
API documentation can be accessed in `http://localhost:8080/api/v1/docs`

## EcoCraft Cloud Architecture
This is the EcoCraft cloud architecture:

![Architecture](docs/EcoCraft_Cloud_Architecture.png)

- Backend: Cloud Run hosts both our RESTful API and machine learning service. We chose Cloud Run for its seamless integration with CI/CD pipelines using Cloud Build, streamlining development and deployment.
- Database: Firestore, a NoSQL solution, manages flexible data structures.
- Storage: Cloud Storage handles craft images, user photos, and other files.