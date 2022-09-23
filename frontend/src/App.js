import "./App.css";
import Header from "./components/Header/Header";
import SellingBox from "./pages/SellingBox/SellingBox";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OwnedBox from "./pages/OwnedBox/OwnedBox";
import SellingBoxDetail from "./pages/SellingBoxDetail/SellingBoxDetail";
import OwnedBoxDetail from "./pages/OwnedBoxDetail/OwnedBoxDetail";
import { MoralisProvider } from "react-moralis";
import History from "./pages/History/History";
import { GlobalStateProvider } from "./redux/store";

function App() {
    return (
        <>
            <MoralisProvider initializeOnMount={false}>
                <GlobalStateProvider>
                    <BrowserRouter>
                        <Header />
                        <Routes>
                            <Route path="/">
                                <Route index element={<SellingBox />} />
                                <Route path="owned" element={<OwnedBox />} />
                                <Route path="selling_detail/:id" element={<SellingBoxDetail />} />
                                <Route path="owned_detail/:id" element={<OwnedBoxDetail />} />
                                <Route path="history" element={<History />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </GlobalStateProvider>
            </MoralisProvider>
        </>
    );
}

export default App;
