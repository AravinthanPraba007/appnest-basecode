// server.js
const express = require("express");
const { handler } = require("./index.js");

const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    // Simulate the AWS API Gateway event
    const event = {
      httpMethod: req.method,
      path: req.path,
      headers: req.headers,
      body: JSON.stringify(req.body),
      queryStringParameters: req.query,
    };

    const context = {
      functionName: "localLambdaSimulation..",
      awsRequestId: `req-${Date.now()}`,
    };

    // Call your Lambda handler
    const result = await handler(event, context);

    // Return Lambda-style response
    res.status(result.statusCode).set(result.headers || {}).send(result.body);
  } catch (err) {
    console.error("Error invoking handler:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Backend App is running at http://localhost:${PORT}`)
);
