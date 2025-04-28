# Sample Todo Backend

This repository contains a sample Node.js Todo backend application instrumented for Prometheus and OpenTelemetry, along with Kubernetes manifests and values files for deployment and monitoring.

## Contents

- `app.js`: Express application with Prometheus metrics and OpenTelemetry exporter endpoints.
- `package.json`: Node.js dependencies and start script.
- `Dockerfile`: Docker image definition.
- `backend.yaml`: Kubernetes Deployment and Service manifest using Kuma health checks.
- `prometheus-values.yaml`: Helm values override for Prometheus to scrape both the app and the OpenTelemetry Collector.
- `README.md`: This instruction file.

## Prerequisites

- Docker & access to a container registry
- Kubernetes cluster (e.g., kind, EKS, GKE): aws alb controllers, ebs driver
- `kubectl` and `helm` installed
- Namespace `monitoring` for Prometheus, OpenTelemetry Collector, and Grafana

## Workflow Overview

1. **Instrumentation**: `app.js` includes Prometheus client instrumentation (`/metrics`) and OpenTelemetry exporter (`/otel_metrics`).
2. **OpenTelemetry Collector**:
   - Receives OTLP metrics from the application via HTTP (`/otel_metrics`).
   - Processes and exposes these metrics in Prometheus format at its own `/metrics` endpoint.
3. **Prometheus Server**:
   - Scrapes the application's `/metrics` endpoint for whitebox metrics.
   - Scrapes the Collector's `/metrics` endpoint for OTEL-derived metrics, as configured in `prometheus-values.yaml`.
4. **Grafana**:
   - Connects to Prometheus as a data source.
   - Visualizes the Four Golden Signals: latency, traffic, errors, saturation.


## Setup Instructions

1. **Build and push Docker image**  
    ```bash
    docker build -t <your-registry>/todo-backend:latest .
    docker push <your-registry>/todo-backend:latest
    ```

2. **Deploy backend on Kubernetes**  
    ```bash
    kubectl apply -f backend.yaml
    ```

3. **Install OpenTelemetry Collector**  
    ```bash
    helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
    helm install otel-collector open-telemetry/opentelemetry-collector       --namespace monitoring       --set service.pipelines.metrics.receivers.otlp.protocols.http.endpoint="0.0.0.0:4318"       --set service.pipelines.metrics.exporters.prometheus.endpoint="/metrics"
    ```

4. **Install Prometheus with custom scrape config**  
    ```bash
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm install prometheus prometheus-community/prometheus       --namespace monitoring       -f prometheus-values.yaml
    ```

5. **Install Grafana**  
    ```bash
    helm repo add grafana https://grafana.github.io/helm-charts
    helm install grafana grafana/grafana --namespace monitoring       --set adminPassword='StrongPass123'
    ```
    - In Grafana UI, add Prometheus data source (`http://prometheus-server.monitoring.svc.cluster.local:80`).
    - Import or build dashboards for:
      - Latency (histogram_quantile)
      - Traffic (rate of requests)
      - Errors (rate of 5xx responses)
      - Saturation (CPU/Memory metrics)

6. **Verify Blackbox Uptime**  
    ```bash
    kumactl inspect dataplanes
    ```
    - Confirm pods report status "online" via Kuma.

## Cleaning Up

```bash
kubectl delete -f backend.yaml
helm uninstall prometheus --namespace monitoring
helm uninstall otel-collector --namespace monitoring
helm uninstall grafana --namespace monitoring
```

---
Feel free to customize the scrape intervals, retention, and dashboards as needed!
