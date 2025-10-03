## Workshop Task: Building Your CI/CD Pipelines

In this exercise, we will create two separate, automated workflows for our application using the reusable actions from the `actions` repository. This is a common pattern in DevOps that separates the process of *validating* code from the process of *deploying* it.

**Our Goals:**

1.  **Pull Request Pipeline:** Create a workflow that automatically runs checks on every Pull Request. This acts as a quality gate to prevent bad code from being merged.
2.  **Deployment Pipeline:** Create a workflow that automatically deploys our application to Docker Hub *only* when code is pushed to the `main` branch.

-----

### **Prerequisites: Configure Your Repository Secrets**

Before we create the pipelines, we need to give them permission to log in to Docker Hub. To do this, we'll add your Docker Hub credentials as secrets in your repository.

1.  Navigate to your forked repository on GitHub (e.g., `your-username/trip-planner-frontend`).
2.  Go to the **Settings** tab.
3.  In the left sidebar, navigate to **Secrets and variables \> Actions**.
4.  Click the **New repository secret** button and create the following two secrets:
      * **Name:** `DOCKERHUB_USERNAME`
          * **Secret:** Your Docker Hub username.
      * **Name:** `DOCKERHUB_TOKEN`
          * **Secret:** Your Docker Hub [Access Token](https://www.google.com/search?q=https://docs.docker.com/docker-hub/access-tokens/).

-----

### **Part 1: The Pull Request Pipeline (Build, Test & Scan)**

This pipeline will run on every pull request made to the `main` branch. Its job is to ensure that the proposed changes build correctly and don't introduce any new security vulnerabilities.

#### **Step-by-Step Instructions:**

1.  In your application repository on GitHub, click on the **Actions** tab.
2.  Click the **set up a workflow yourself** link.
3.  Name the file `pr-checks.yml`.
4.  Delete the boilerplate content and paste the following code into the editor:

<!-- end list -->

```yaml
# .github/workflows/pr-checks.yml

name: Pull Request Checks

# This workflow triggers ONLY on pull requests targeting the main branch
on:
  pull_request:
    branches: [ main ]

jobs:
  # First, run the CI checks to ensure the code builds and tests pass
  run-ci-checks:
    name: Build & Test
    uses: LSEG-Immersion-Day-DevOps-workshop-2025/actions/.github/workflows/build-test-ci.yml@main

  # If CI passes, this job will run a security scan on the Docker image
  run-security-scan:
    name: Trivy Vulnerability Scan
    # This job depends on the successful completion of the 'run-ci-checks' job
    needs: run-ci-checks
    uses: LSEG-Immersion-Day-DevOps-workshop-2025/actions/.github/workflows/security-scan-ci.yml@main
```

5.  Click **Commit changes...** and commit the new file directly to your `main` branch.

-----

### **Part 2: The Deployment Pipeline (Build, Test & Push)**

This pipeline is responsible for deployment. It will only run when code is pushed directly to the `main` branch (which typically happens after a pull request is merged). It re-runs the CI checks and then pushes the new application image to Docker Hub.

#### **Step-by-Step Instructions:**

1.  Go back to the **Actions** tab.
2.  Click **New workflow** and then **set up a workflow yourself**.
3.  Name this new file `deploy-to-dockerhub.yml`.
4.  Delete the boilerplate content and paste the following code. **Remember to change the `image_name` placeholder to your own Docker Hub username\!**

<!-- end list -->

```yaml
# .github/workflows/deploy-to-dockerhub.yml

name: Deploy to Docker Hub

# This workflow triggers ONLY on pushes to the main branch
on:
  push:
    branches: [ main ]

jobs:
  # First, run the CI checks to ensure the code is valid
  run-ci-checks:
    name: Build & Test
    uses: LSEG-Immersion-Day-DevOps-workshop-2025/actions/.github/workflows/build-test-ci.yml@main

  # If CI passes, this job will build and push the Docker image
  build-and-push-image:
    name: Push to Docker Hub
    # This job depends on the successful completion of the 'run-ci-checks' job
    needs: run-ci-checks
    uses: LSEG-Immersion-Day-DevOps-workshop-2025/actions/.github/workflows/docker-push-ci.yml@main
    with:
      # IMPORTANT: Replace 'your-dockerhub-username' with your actual Docker Hub username
      image_name: your-dockerhub-username/trip-planner-frontend
      # We use the unique Git commit SHA as the image tag for versioning
      tag: ${{ github.sha }}
    secrets:
      # These secrets must be created in your repository's settings
      DOCKER_USERNAME: ${{ secrets.DOCKERHUB_USERNAME }}
      DOCKER_PASSWORD: ${{ secrets.DOCKERHUB_TOKEN }}
```

5.  Click **Commit changes...** to save the file to your `main` branch.

-----

### **Part 3: Testing Your Pipelines**

Now, let's see our workflows in action\!

1.  **Clone your forked repository** to your local machine.
2.  **Create a new branch:**
    ```bash
    git checkout -b my-feature-update
    ```
3.  **Make a small change:** For example, edit the `README.md` file and add some text.
4.  **Commit and push your branch:**
    ```bash
    git add .
    git commit -m "feat: updated readme"
    git push -u origin my-feature-update
    ```
5.  **Create a Pull Request:** Go to GitHub and open a pull request from your `my-feature-update` branch to the `main` branch.
6.  **Observe the PR Check:** On the pull request page, you will see the "Pull Request Checks" workflow running. It will run the "Build & Test" and "Trivy Vulnerability Scan" jobs.
7.  **Merge the Pull Request:** Once the checks have passed, click the **Merge pull request** button.
8.  **Observe the Deployment:** Now, go to the **Actions** tab in your repository. You will see the "Deploy to Docker Hub" workflow has started running because you just pushed a new commit to `main` by merging.
9.  **Verify on Docker Hub:** Once the deployment workflow is complete, go to your Docker Hub account. You will see a new image in your repository tagged with the latest Git commit SHA.

Congratulations\! You have successfully built two distinct CI/CD pipelines to automatically validate and deploy your application.
