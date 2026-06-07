/* =========================================================================
   CHAT UMG - SERIE I Y II
   ========================================================================= */

const $ = (id) => document.getElementById(id);

const vistaLogin = $("vistaLogin");
const vistaChat = $("vistaChat");

const loginMsg = $("loginMsg");
const chatMsg = $("chatMsg");

const KEY_TOKEN = "umg_token";
const KEY_USER = "umg_usuario";

const API_LOGIN =
  "https://backcvbgtmdesa.azurewebsites.net/api/login/authenticate";

const API_MENSAJES =
  "https://backcvbgtmdesa.azurewebsites.net/api/Mensajes";

/* ===================================================================== */
/* UTILIDADES */
/* ===================================================================== */

function setMsg(el, texto, tipo = "") {
  if (!el) return;

  el.textContent = texto;

  if (tipo === "error") {
    el.style.color = "#dc2626";
  } else if (tipo === "ok") {
    el.style.color = "#16a34a";
  } else {
    el.style.color = "";
  }
}

function getToken() {
  return localStorage.getItem(KEY_TOKEN);
}

function getUsuario() {
  return localStorage.getItem(KEY_USER);
}

function extraerToken(data) {
  if (!data) return null;

  return (
    data.token ||
    data.Token ||
    data.access_token ||
    data.accessToken ||
    data.bearer ||
    data.Bearer ||
    null
  );
}

/* ===================================================================== */
/* LOGIN */
/* ===================================================================== */

async function login() {
  const usuario = $("usuario").value.trim();
  const password = $("password").value.trim();

  if (!usuario || !password) {
    setMsg(loginMsg, "Ingresa usuario y contraseña.", "error");
    return;
  }

  const btn = $("btnLogin");
  btn.disabled = true;

  setMsg(loginMsg, "Verificando credenciales...");

  try {
    const response = await fetch(API_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Username: usuario,
        Password: password
      })
    });

    const data = await response.json();

    console.log("LOGIN STATUS:", response.status);
    console.log("LOGIN DATA:", data);

    if (!response.ok) {
      setMsg(
        loginMsg,
        data.msgRespuesta ||
          data.error ||
          "Usuario o contraseña incorrectos.",
        "error"
      );
      return;
    }

    const token = extraerToken(data);

    if (!token) {
      console.log(data);

      setMsg(
        loginMsg,
        "No se recibió token de autenticación.",
        "error"
      );
      return;
    }

    localStorage.setItem(KEY_TOKEN, token);
    localStorage.setItem(KEY_USER, usuario);

    entrarAlChat();

  } catch (error) {

    console.error(error);

    setMsg(
      loginMsg,
      "Error al conectar con la API.",
      "error"
    );
  } finally {
    btn.disabled = false;
  }
}

/* ===================================================================== */
/* MENSAJES */
/* ===================================================================== */

async function enviarMensaje() {

  const contenido = $("contenido").value.trim();

  if (!contenido) {
    setMsg(chatMsg, "Escribe un mensaje.", "error");
    return;
  }

  const btn = $("btnEnviar");
  btn.disabled = true;

  setMsg(chatMsg, "Enviando mensaje...");

  try {

    const response = await fetch(API_MENSAJES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken()
      },
      body: JSON.stringify({
        Cod_Sala: 0,
        Login_Emisor: getUsuario(),
        Contenido: contenido
      })
    });

    const data = await response.json();

    console.log("MENSAJE STATUS:", response.status);
    console.log("MENSAJE DATA:", data);

    if (!response.ok) {
      setMsg(
        chatMsg,
        data.error ||
          data.msgRespuesta ||
          "No fue posible enviar el mensaje.",
        "error"
      );
      return;
    }

    $("contenido").value = "";

    setMsg(
      chatMsg,
      "Mensaje enviado correctamente.",
      "ok"
    );

  } catch (error) {

    console.error(error);

    setMsg(
      chatMsg,
      "Error al enviar mensaje.",
      "error"
    );

  } finally {
    btn.disabled = false;
  }
}

/* ===================================================================== */
/* NAVEGACION */
/* ===================================================================== */

function entrarAlChat() {

  vistaLogin.hidden = true;
  vistaChat.hidden = false;

  const nombre = $("nombreUsuario");

  if (nombre) {
    nombre.textContent = getUsuario() || "";
  }

  setMsg(loginMsg, "");
}

function logout() {

  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);

  vistaChat.hidden = true;
  vistaLogin.hidden = false;

  $("usuario").value = "";
  $("password").value = "";

  setMsg(loginMsg, "");
  setMsg(chatMsg, "");
}

/* ===================================================================== */
/* TEXTAREA */
/* ===================================================================== */

function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

/* ===================================================================== */
/* EVENTOS */
/* ===================================================================== */

$("btnLogin").addEventListener("click", login);

$("password").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    login();
  }
});

$("btnEnviar").addEventListener("click", enviarMensaje);

$("btnLogout").addEventListener("click", logout);

const textarea = $("contenido");

if (textarea) {

  textarea.addEventListener("input", () => {
    autoResize(textarea);
  });

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  });
}

/* ===================================================================== */
/* INICIO */
/* ===================================================================== */

vistaLogin.hidden = false;
vistaChat.hidden = true;

if (getToken() && getUsuario()) {
  entrarAlChat();
}