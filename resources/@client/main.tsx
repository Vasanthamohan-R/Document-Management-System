import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./stores/index";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "../css/app.css";
import { AlertProvider } from "./utils/Alert/AlertContext";
import { AlertProviderWrapper } from "./utils/Alert/Alert";
import "react-datepicker/dist/react-datepicker.css";

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        
            <Provider store={store}>
                <BrowserRouter>
                    <AlertProvider>
                        <AlertProviderWrapper>
                            <App />
                        </AlertProviderWrapper>
                    </AlertProvider>
                </BrowserRouter>
            </Provider>,
    );
}