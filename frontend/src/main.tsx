import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "./index.css";
import Hero from './sections/Hero.tsx';
import GameRoom from './sections/GameRoom.tsx';
import Lobby from './sections/Lobby.tsx';
import Signup from './sections/SignUp.tsx';
import Login from './sections/Login.tsx';
import WaitingRoom from './sections/WaitingRoom.tsx';
import JoinRoom from './sections/JoinRoom.tsx';
import App from './App.tsx';
import HostRoom from './HostRoom.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>      
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/game-room/:code" element={<GameRoom />} />
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
