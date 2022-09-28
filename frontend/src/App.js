import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Footer } from "./components/Footer";
import { History } from "./pages/History";
import { Home } from "./pages/Home/Home";
import { Header } from "./components/Header";
import { CreateBox } from "./pages/CreateBox";
import { BottomAlert } from "./components/BottomAlert";
import { useDispatch, useSelector } from "react-redux";
import { closeAlert } from "./redux/slices/alertSlice";
import { SellingBoxDetail } from "./pages/SellingBoxDetail";
import { SellingBox } from "./pages/SellingBox";
import { OwnedBoxDetail } from "./pages/OwnedBoxDetail";
import { OwnedBox } from "./pages/OwnedBox";

function App() {
    const alert = useSelector((state) => state.alert);
    const dispatch = useDispatch();

    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/">
                    <Route index element={<Home />} />
                    <Route path="selling" element={<SellingBox />} />
                    <Route path="owned" element={<OwnedBox />} />
                    <Route path="selling_detail/:id" element={<SellingBoxDetail />} />
                    <Route path="owned_detail/:id" element={<OwnedBoxDetail />} />
                    <Route path="history" element={<History />} />
                    <Route path="create_box" element={<CreateBox />} />
                </Route>
            </Routes>
            <Footer />
            <BottomAlert
                isOpen={alert.isOpen}
                handleClose={() => dispatch(closeAlert())}
                severity={alert.type}
            >
                {alert.content}
            </BottomAlert>
        </BrowserRouter>
    );
}

export default App;
