import "./index.css";
import App from "./app";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
      <Routes>
        <Route index element={<App/>}/>
      </Routes>
  </BrowserRouter>
);
