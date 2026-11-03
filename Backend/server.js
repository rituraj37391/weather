const app = require("./src/app");

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});