import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { authRouter } from "./routes/auth.routes";
import { complaintsRouter } from "./routes/complaints.routes";
import { adminRouter } from "./routes/admin.routes";
import { lookupsRouter } from "./routes/lookups.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "residence-hub-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/complaints", complaintsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/lookups", lookupsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : "Unexpected server error";
  res.status(500).json({ message });
});
