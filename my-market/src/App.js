import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Home from "./pages/Home";
import EditProfile from "./pages/EditProfile";
import UserPage from "./pages/UserPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Sell from "./pages/Sell";
import ItemPage from "./pages/ItemPage";
import EditItem from "./pages/EditItem";
import Chat from "./pages/Chat";
import Buy from "./pages/Buy";

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
        <Route path="/item/:id" element={<ItemPage />} />
        <Route path="/item/:id/buy" element={<ProtectedRoute><Buy /></ProtectedRoute>} />
        <Route path="/item/:id/edit" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />
        <Route path="/item/:id/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />


        <Route path="/user/:id" element={<UserPage />} />

        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

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