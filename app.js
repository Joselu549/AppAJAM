const express = require("express");
const path = require("path");
const app = express();
const indexRoutes = require("./routes/index").default;

const PORT = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
debugger;
app.use(express.static(path.join(__dirname, "public")));

// Configurar rutas
app.use("/", indexRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
