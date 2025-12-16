import express from "express";
import cors from "cors";
import httpLogger from "./middleware/httpLogger";
import logger from "./utils/logger";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.get("/", (req, res) => {
  logger.info("Health check endpoint hit");
  return res.send("CipherLearn");
});

export default app;
