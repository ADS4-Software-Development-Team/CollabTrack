import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./src/routes/userRoutes.js";
import projectsRoutes from "./src/routes/projectsRoutes.js";
import projectMemberRoutes from "./src/routes/projectMemberRoutes.js";
import workspaceRoutes from "./src/routes/workspaceRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//testing
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/workspaces", workspaceRoutes);

// Nested route for project members
projectsRoutes.use("/:projectId/members", projectMemberRoutes);

const startServer = async () => {

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
