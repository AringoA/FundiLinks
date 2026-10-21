const { createApp } = require("./app");
const PORT = Number(process.env.PORT) || 3001;
createApp().listen(PORT, () => console.log("FundiLink API listening on http://localhost:" + PORT));
