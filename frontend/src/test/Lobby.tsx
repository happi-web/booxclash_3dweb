import { useState } from "react";
import HostRoom from "./HostRoom";
import JoinRoom from "./JoinRoom";
import WaitingRoom from "./WaitingRoom";

const Lobby = () => {
    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState<string[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [stage, setStage] = useState<'home' | 'waiting'>('home');
  
    const handleRoomCreated = (code: string) => {
      setIsHost(true);
      setRoomCode(code);
      setPlayers(['Host']); // Add host by default
      setStage('waiting');
    };
  
    const handleJoin = (code: string, player: string) => {
      setIsHost(false);
      setRoomCode(code);
      setPlayers((prev) => [...prev, player]);
      setStage('waiting');
    };
  
    return (
      <>
        {stage === 'home' ? (
          <>
            <HostRoom onRoomCreated={handleRoomCreated} />
            <JoinRoom onJoin={handleJoin} />
          </>
        ) : (
          <WaitingRoom
            roomCode={roomCode}
            players={players}
            isHost={isHost}
            onStartQuiz={() => console.log('Start quiz')}
          />
        )}
      </>
    );
  };
  export default Lobby;