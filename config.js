//Criar Tabela de Usuários
(async () => {
  const database = require("./db/db.js");
  const User = require("./model/user.js");

  try {
    const resultado = await database.sync();
    console.log(resultado);
  } catch (error) {
    console.log(error);
  }
})();

//Criar Tabela de Mensagens
(async () => {
  const database = require("./db/db.js");
  const Message = require("./model/message.js");

  try {
    const resultado = await database.sync();
    console.log(resultado);
  } catch (error) {
    console.log(error);
  }
})();

//Criar Constraint entre as mensagens e usuários
(async () => {
  const database = require("./db/db.js");
  const Message = require("./model/message.js");
  const User = require("./model/user.js");

  try {
    Message.belongsTo(User, {
      constraint: true,
      foreignKey: "idUser",
    });

    const resultado = await database.sync({ force: true });
    console.log(resultado);
  } catch (error) {
    console.log(error);
  }
})();
