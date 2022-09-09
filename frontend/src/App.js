import "./App.css";
import Header from "./components/Header/Header";
import SellingBox from "./pages/SellingBox";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import OwnedBox from "./pages/OwnedBox/OwnedBox";
import SellingBoxDetail from "./pages/SellingBoxDetail";
import OwnedBoxDetail from "./pages/OwnedBoxDetail/OwnedBoxDetail";

function App() {
    return (
        <>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/">
                        <Route index element={<SellingBox />} />
                        <Route path="owned" element={<OwnedBox />} />
                        <Route path="selling_detail/:id" element={<SellingBoxDetail />} />
                        <Route path="owned_detail/:id" element={<OwnedBoxDetail />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
