import { Router } from "express";
import CartManager from "../cartManager.js";

const cartsRouter = Router();
const cartManager = new CartManager();

cartsRouter.post("/", async (req, res) => {
  const newCart = await cartManager.addCart();
  if (newCart) {
    return newCart;
    res.status(200).send("Carrito creado");
  } else {
    res.status(400).send("Error al crear el carrito");
  }
});

export default cartsRouter;
