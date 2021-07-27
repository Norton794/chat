const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

let messages = [];

io.on("connection", (socket) => {
  const database = require("./db/db.js");
  const Message = require("./model/message.js");
  const User = require("./model/user.js");

  let array = [];

  (async () => {
    const messagex = await Message.findAll();

    socket.emit("previousMessages", messagex);
  })();

  socket.on("sendMessage", (data) => {
    messages.push(data);
    socket.broadcast.emit("receiveMessage", data);

    (async () => {
      try {
        const resultadoCreate = await Message.create({
          message: data.message,
          idUser: data.id,
        });
      } catch (err) {
        console.log(err);
      }
    })();
  });
});

app.get("/chat", (req, res) => {
  const database = require("./db/db");
  const User = require("./model/user");

  if (req.cookies.idUser) {
    (async () => {
      try {
        const user = await User.findByPk(req.cookies.idUser);
        user.session_id = socket.id;
        const resultadoSave = await user.save();
      } catch (err) {
        console.log(err);
      }
    })();
    res.render("chat.html");
  } else {
    res.redirect("/");
  }
});

app.get("/", (req, res) => {
  res.render("index.html");
});

app.post("/login", (req, res) => {
  (async () => {
    const database = require("./db/db");
    const User = require("./model/user");

    try {
      const user = await User.findOne({
        where: { username: req.body.username },
      });
      const isValid = bcrypt.compareSync(req.body.password, user.password);
      if (isValid) {
        user.status = true;
        const resultadoSave = await user.save();

        res.cookie("idUser", user.id, { maxAge: 30 * 60 * 1000 });
        res.redirect("/chat");
      } else {
        res.redirect("/");
      }
    } catch (err) {
      console.log(err);
    }
  })();
});

app.get("/cad", (req, res) => {
  res.render("cadUser.html");
});

app.post("/cadUser", (req, res) => {
  (async () => {
    const database = require("./db/db");
    const User = require("./model/user");

    try {
      const resultado = await database.sync();

      const resultadoCreate = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
        status: false,
      });
    } catch (error) {
      console.log(error);
    }
  })();

  res.redirect("/");
});

app.get("/logout", (req, res) => {
  (async () => {
    const database = require("./db/db");
    const User = require("./model/user");
    const user = await User.findByPk(req.cookies.idUser);
    user.status = false;
    const resultadoSave = await user.save();
    res.clearCookie("idUser");
    res.redirect("/");
  })();
});

app.get("/getUsername", (req, res) => {
  (async () => {
    const database = require("./db/db");
    const User = require("./model/user");

    try {
      const user = await User.findByPk(req.cookies.idUser);
      res.send({ username: user.username, id: req.cookies.idUser });
    } catch (error) {
      console.log(error);
    }
  })();
});

app.get("/getAllUsers", (req, res) => {
  (async () => {
    const database = require("./db/db");
    const User = require("./model/user");
    try {
      const users = await User.findAll();
      users.forEach((u) => {
        if (u.status === true) {
          u.status = "Online";
        } else if (u.status === false) {
          u.status = "Offline";
        }
      });
      res.send(users);
    } catch (error) {}
  })();
});

server.listen(3000);
