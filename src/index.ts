import express from "express";
import usersRouter from "@routes/users";
import { connectDB } from "./config/db";

const main = async (): Promise<void> => {
  const app = express();
  const port = 4000;

  await connectDB();
  app.use(express.json());

  app.get("/", async (req, res) => {
    res.send("Hello World2!");
  });

  app.use("/users", usersRouter);

  app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
};

main();
