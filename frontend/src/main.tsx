import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import "./index.css";
import HomePage from './HomePage';
import PlayGround from './StudentDashboard/Games/Knockout/PlayGround';
import StudentDashboard from './StudentDashboard/StudentDashboard';
import WaitingRoom from './StudentDashboard/Games/Knockout/WaitingRoom';
import PlaceValues from './StudentDashboard/HandsOnLearning/Lessons/PlaceValues';
import Signup from './SignUp';
import Login from './Login';
import Dashboard from './Admin/Dashboard';
import KnockoutHome from './StudentDashboard/Games/Knockout/KnockoutHome';
import Landing from './StudentDashboard/Games/Knockout/Landing';
import NumberHunt from './StudentDashboard/Games/NumberHunt/NumberHunt';
import Insolo from './StudentDashboard/Games/Insolo/Insolo';
import PlayerWaitingRoom from './StudentDashboard/Games/Knockout/PlayersWaitingRoom';

import GameRoomInfo from './StudentDashboard/Games/Knockout/GameRoomInfo';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play-ground/:roomId" element={<PlayGround />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/admin" element={<Dashboard />} />
        <Route path="/waiting-room/:roomId" element={<WaitingRoom />} />
        <Route path="/player-waiting" element={<PlayerWaitingRoom />} />
        <Route path="/place-value" element={<PlaceValues />} />
        <Route path="/dashboard/student/knockout-home" element={<KnockoutHome />} />
        <Route path="/dashboard/student/number-hunt" element={<NumberHunt />} />
        <Route path="/dashboard/student/insolo" element={<Insolo />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/room/:code" element={<WaitingRoom />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="game-room-info/:roomId/:currentRound" element={<GameRoomInfo />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
