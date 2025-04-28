// index.js
require('./tracing'); // Start tracing first
const app = require('./app'); // Then start the app

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API server is running at http://localhost:${PORT}`);
});
