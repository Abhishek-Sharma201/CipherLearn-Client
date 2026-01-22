import { config } from "./config/env.config";
import app from "./server";
import allRoutes from "./routes";
import { connectDatabase } from "./config/db.config";

app.use("/api", allRoutes);

async function startServer() {
  try {
    await connectDatabase();
    app.listen(config.APP.PORT, () => {
      console.log(`Server is running on port ${config.APP.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

