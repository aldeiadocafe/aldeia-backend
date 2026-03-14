const express = require("express");
const app = express();
const conn = require("./db/conn");

//Tornar o servidor acessivel
const cors = require("cors");
app.use(cors());

//para usar o .env
require("dotenv/config");
const api = process.env.API_URL;

//Analise dos dados que vem nas requisicoes HTTP
const bodyParser = require("body-parser")

const morgan = require("morgan");

app.use(express.json());

//app.get("/", (req, res) => {
//    res.send("teste");
//});

//Receber e enviar como json
app.use(bodyParser.json());
app.use(morgan("tiny"));

//Rotas Login
const loginRoutes = require("./routes/authRoutes");
app.use(`${api}/login`, loginRoutes);

//Rotas Companys
const companysRoutes = require("./routes/companysRoutes");
app.use(`${api}/companys`, companysRoutes);

//Rotas Users
const usersRoutes = require("./routes/usersRoutes");
app.use(`${api}/users`, usersRoutes);

//Rotas Units
const unitsRoutes = require("./routes/unitsRoutes");
app.use(`${api}/units`, unitsRoutes);

//Rotas Items
const itemsRoutes = require("./routes/itemsRoutes");
app.use(`${api}/items`, itemsRoutes);

//Rotas Inventorys
const inventorysRoutes = require("./routes/inventorysRoutes");
app.use(`${api}/inventorys`, inventorysRoutes);

//Rotas ItemsInventory
const itemsInventoryRoutes = require("./routes/itemsInventorysRoutes");
app.use(`${api}/itemsinventory`, itemsInventoryRoutes);

//Rotas DatesItemsInventory
const datesItemInventory = require("./routes/datesItemInventoryRoutes");
app.use(`${api}/datesiteminventory`, datesItemInventory);

//Rotas Places Inventorys
const placesInventorysRoutes = require("./routes/placesInventoryRoutes");
app.use(`${api}/placesinventory`, placesInventorysRoutes);

//Rotas Count Places
const countPlacesRoutes = require("./routes/countPlacesRoutes");
app.use(`${api}/countplaces`, countPlacesRoutes);

//Rotas Stock Balance
const stockBalanceRoutes = require("./routes/stockBalanceRoutes");
app.use(`${api}/stockbalance`, stockBalanceRoutes);

//Rotas Dates Item Balance
const datesItemBalanceRoutes = require("./routes/datesItemBalanceRoutes");
app.use(`${api}/datesitembalance`, datesItemBalanceRoutes);

//Rotas Recebimento - NFe
const nfesRoutes = require("./routes/nfeRoutes");
app.use(`${api}/nfes`, nfesRoutes);

//Rotas Recebimento - ItemsNfe
const itemsNfeRoutes = require("./routes/itemsNfeRoutes");
app.use(`${api}/itemsnfe`, itemsNfeRoutes);

//Rotas Recebimento - ItemsNfe
const conversationsItemRoutes = require("./routes/conversationsItemRoute");
app.use(`${api}/conversationsitem`, conversationsItemRoutes);

//app.listen(5000, () => {
app.listen(process.env.PORT, () => {    
    console.log("Servidor rodando na porta " + process.env.PORT); 
});