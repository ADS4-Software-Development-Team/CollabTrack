import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabaseConnection } from "./src/config/database.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



//Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

const startServer = async () => {
  //Test the Supabase connection and wait for it to finish
  await supabaseConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
