import { promises as fs } from "fs";

class CartManager {
  constructor(path) {
    this.path = "./carts.json";
  }

  async getCarts() {
    const arrayCartslist = await fs.readFile(this.path, "utf-8");
    const cartsList = JSON.parse(arrayCartslist);
    return cartsList;
  }

  async getCartById(id) {
    const cartsList = await this.getCarts();
    return cartsList.find((cart) => (cart.id = id));
  }

  async autoId() {
    const cartList = await this.getCarts();
    const counter = cartList.length;
    if (counter === 0) {
      return 1;
    } else {
      return cartList[counter - 1].id + 1;
    }
  }

  async addCart() {
    const cartList = await this.getCarts();
    const id = await this.autoId();

    const newCart = {
      id,
      products: [],
    };
    cartList.push(newCart);
    await fs.writeFile(this.path, JSON.stringify(cartList));
  }
}

export default CartManager;
