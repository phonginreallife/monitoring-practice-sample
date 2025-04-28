// app.js
const express = require('express');
const client = require('prom-client');

// Initialize Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); // System metrics (CPU, memory, etc.)

// Custom Histogram for HTTP requests
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const app = express();

// Middleware to collect custom HTTP request metrics
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.route ? req.route.path : req.path });
  res.on('finish', () => {
    end({ status_code: res.statusCode });
  });
  next();
});

// Simple sample endpoint
app.get('/todos', (req, res) => {
  res.json([
    { id: 1, task: 'Buy milk' },
    { id: 2, task: 'Write code' }
  ]);
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

module.exports = app;
