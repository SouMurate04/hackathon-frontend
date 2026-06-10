import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Home from "./pages/Home";
import MyPage from "./pages/MyPage";
import EditProfile from "./pages/EditProfile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Sell from "./pages/Sell";
import Item from "./pages/Item";

import Loader from "./components/Loader";
import Header from "./components/Header";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
    <Loader>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<Item />} />

        <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/mypage/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Loader>
    </BrowserRouter>
  );
}

export default App;