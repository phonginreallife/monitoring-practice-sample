// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { detectResources } = require('@opentelemetry/resources');
const { envDetector, processDetector, hostDetector } = require('@opentelemetry/resources');

async function initTracing() {
  const resource = await detectResources({
    detectors: [envDetector, processDetector, hostDetector],
  });

  const sdk = new NodeSDK({
    resource,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  try {
    await sdk.start();
    console.log('✅ OpenTelemetry SDK started');
  } catch (err) {
    console.error('❌ Error starting OpenTelemetry SDK', err);
  }
}

initTracing();
