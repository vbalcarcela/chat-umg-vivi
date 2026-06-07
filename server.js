const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API_LOGIN =
  "https://backcvbgtmdesa.azurewebsites.net/api/login/authenticate";

const API_MENSAJES =
  "https://backcvbgtmdesa.azurewebsites.net/api/Mensajes";

/* =====================================================
   RUTAS DE PRUEBA
===================================================== */

app.get("/ping", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

app.get("/api/auth", (req, res) => {
  res.json({
    mensaje: "API funcionando correctamente",
    metodoPermitido: "POST"
  });
});

/* =====================================================
   SERIE I - LOGIN
===================================================== */

app.post("/api/auth", async (req, res) => {
  try {
    const { Username, Password } = req.body || {};

    console.log("");
    console.log("==================================");
    console.log("PETICION LOGIN");
    console.log("USERNAME:", Username);
    console.log("PASSWORD:", Password);
    console.log("==================================");

    if (!Username || !Password) {
      return res.status(400).json({
        error: "Username y Password son obligatorios."
      });
    }

    const response = await fetch(API_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Username,
        Password
      })
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    console.log("STATUS AZURE:", response.status);
    console.log("RESPUESTA AZURE:");
    console.log(data);
    console.log("==================================");

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Credenciales inválidas o error de la API.",
        detalle: data
      });
    }

    return res.json(data);

  } catch (error) {

    console.error("ERROR LOGIN:");
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor.",
      detalle: error.message
    });
  }
});

/* =====================================================
   SERIE II - ENVIAR MENSAJE
===================================================== */

app.post("/api/mensajes", async (req, res) => {
  try {

    const authorization = req.headers.authorization;

    console.log("");
    console.log("==================================");
    console.log("PETICION MENSAJE");
    console.log("AUTH:", authorization);
    console.log("BODY:", req.body);
    console.log("==================================");

    if (!authorization) {
      return res.status(401).json({
        error: "No se recibió el token Bearer."
      });
    }

    const response = await fetch(API_MENSAJES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    console.log("STATUS MENSAJE:", response.status);
    console.log("RESPUESTA MENSAJE:");
    console.log(data);
    console.log("==================================");

    if (!response.ok) {
      return res.status(response.status).json({
        error: "La API rechazó el mensaje.",
        detalle: data
      });
    }

    return res.json(data);

  } catch (error) {

    console.error("ERROR MENSAJE:");
    console.error(error);

    return res.status(500).json({
      error: "Error enviando mensaje.",
      detalle: error.message
    });
  }
});

/* =====================================================
   PAGINA PRINCIPAL
===================================================== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =====================================================
   INICIO SERVIDOR
===================================================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("");
  console.log("==================================");
  console.log("SERVIDOR INICIADO");
  console.log(`PUERTO: ${PORT}`);
  console.log("==================================");
  console.log("");
});