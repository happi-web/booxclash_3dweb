import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "./index.css";
import Hero from './GameRoom/Hero.tsx';
import GameRoom from './GameRoom.tsx';
import Lobby from './GameRoom/Lobby.tsx';
import Signup from './GameRoom/SignUp.tsx';
import Login from './GameRoom/Login.tsx';
import WaitingRoom from './GameRoom/WaitingRoom.tsx';
import JoinRoom from './GameRoom/JoinRoom.tsx';
import App from './App.tsx';
import HostRoom from './HostRoom.tsx';
import PlayGround from './PlayGround.tsx';
import HomePage from './HomePage.tsx';
import StudentDashboard from './GameRoom/Dashboard/StudentDashboard.tsx';
import Dashboard from './Admin/Dashboard.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>      
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/game-room/:code" element={<GameRoom />} />
        <Route path="/play-ground" element={<PlayGround />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/admin" element={<Dashboard />} />
        <Route path="/waiting-room/:code" element={<WaitingRoom />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/app" element={<App />} />
        <Route path="/host-room" element={<HostRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/room/:code" element={<WaitingRoom />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
