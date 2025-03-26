import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
const router = express.Router(); // Use "router" minúsculo por convenção
const prisma = new PrismaClient();

// Rota de cadastro
router.post("/cadastro", async (req, res) => {
  try{
  const user = req.body;
  const salt= await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(user.password,salt)
 const userDb = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        password: hashPassword
      },
    });

  res.status(201).json(userDb);
}catch(err){
  res.status(500).json({message:"erro no servidor tente novamente"})
}
});

export default router; // Exporte o "router" que você criou
