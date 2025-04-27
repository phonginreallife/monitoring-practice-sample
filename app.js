const express = require('express');
const client = require('prom-client');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const provider = new NodeTracerProvider();
const exporter = new PrometheusExporter({ startServer: false });
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method','route','code'],
});

const app = express();

// Instrumentation middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => end({ code: res.statusCode }));
  next();
});

app.get('/todos', (req, res) => {
  res.json([{ id:1, task:'Buy milk' }]);
});

// Expose metrics for Prometheus and OTel
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// OTel exporter endpoint
app.get('/otel_metrics', async (req, res) => {
  res.set('Content-Type', exporter.contentType);
  res.end(await exporter.getMetrics());
});

app.listen(3000, () => console.log('API listening on :3000'));
