import "./index.css";

import Main from "./main";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <Main />
  </Provider>,
);
