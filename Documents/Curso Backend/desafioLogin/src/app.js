import "dotenv/config";
import express from "express";
import multer from "multer";
import productRouter from "./routes/products.routes.js";
import viewRouter from "./routes/view.routes.js";
import cartRouter from "./routes/carts.routes.js";
import userRouter from "./routes/users.routes.js";
import sessionRouter from "./routes/session.routes.js";
import { engine } from "express-handlebars";
import { __dirname } from "./path.js";
import { Server } from "socket.io";
import path from "path";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import ProductManager from "./dao/managers_mongo/productManagerMongo.js";
import MessageManager from "./dao/managers_mongo/chat.ManagerMongo.js";
import SessionManager from "./dao/managers_mongo/sessionManagerMongo.js";
import cookieParser from "cookie-parser";
import session from "express-session";

const PORT = 8080;
const app = express();
const messageManager = new MessageManager();
const productManager = new ProductManager();
const sessionManager = new SessionManager();

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    console.log("BDD conectada");
  })
  .catch(() => console.log("Error en conexion a BDD"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/img");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});

const server = app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SIGNED_COOKIES));
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      ttl: 60,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));
const upload = multer({ storage: storage });
app.use("/static", express.static(path.join(__dirname, "/public")));
const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`Servidor Socket.io del cliente conectado con id: ${socket.id}`);

  socket.on("mensaje", async (infoMensaje) => {
    await messageManager.sendMessage(infoMensaje);
    const listaMensajes = await messageManager.getMessages();
    socket.emit("mensajes", listaMensajes);
  });

  socket.on("nuevoProducto", async (data) => {
    const updatedProduct = await productManager.addProduct(
      data.title,
      data.description,
      data.stock,
      data.code,
      data.price,
      data.category
    );
    socket.emit("productoUpdated", updatedProduct);
    console.log(updatedProduct);
  });
});

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewRouter);
app.use("/api/users", userRouter);
app.use("/api/sessions", sessionRouter);

app.post("/upload", upload.single("product"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  res.status(200).send("Imagen cargada");
});
