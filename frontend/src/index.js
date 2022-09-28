import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { MoralisProvider } from "react-moralis";
import { GlobalStateProvider } from "./redux/store";

const client = new ApolloClient({
    uri: "http://127.0.0.1:8000/subgraphs/name/dinhbx-smartosc/backend_the_graph",
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: "cache-and-network",
            errorPolicy: "ignore",
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <MoralisProvider initializeOnMount={false}>
        <GlobalStateProvider>
            <ApolloProvider client={client}>
                <App />
            </ApolloProvider>
        </GlobalStateProvider>
    </MoralisProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
