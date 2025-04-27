# Sample Todo Backend

This repository contains a sample Node.js Todo backend application instrumented for Prometheus and OpenTelemetry, along with Kubernetes manifests for deployment and monitoring.

## Contents

- `app.js`: Express application with Prometheus metrics and OpenTelemetry exporter endpoints.
- `package.json`: Node.js dependencies and start script.
- `Dockerfile`: Docker image definition.
- `backend.yaml`: Kubernetes Deployment and Service manifest using Kuma health checks.
- `README.md`: This instruction file.

## Prerequisites

- Docker & DockerHub (or another container registry)
- Kubernetes cluster (e.g., kind, EKS, GKE)
- `kubectl` and `helm` installed
- Kuma service mesh installed on the cluster (optional for blackbox uptime)
- Prometheus, OpenTelemetry Collector, and Grafana deployed in `monitoring` namespace

## Usage

1. **Build and push Docker image**  
   ```bash
   docker build -t <your-registry>/todo-backend:latest .
   docker push <your-registry>/todo-backend:latest
   ```

2. **Deploy backend on Kubernetes**  
   ```bash
   kubectl apply -f backend.yaml
   ```

3. **Verify pods and service**  
   ```bash
   kubectl get pods,svc
   ```

4. **Set up whitebox monitoring**  
   - Install OpenTelemetry Collector  
   - Install Prometheus with scrape targets for `/metrics` and `/otel_metrics`  
   - Install Grafana and add Prometheus as data source

5. **Set up blackbox monitoring (optional)**  
   - Ensure Kuma probes `/healthz` endpoint  
   - Observe uptime metrics in Kuma dashboard or Prometheus

6. **Access Grafana dashboard**  
   - Create panels for latency, traffic, errors, and saturation (Four Golden Signals)

## Cleanup

```bash
kubectl delete -f backend.yaml
```
