import Playlists from './pages/playlists';
import Playlist from './pages/playlist';
import Auth from './pages/auth';
import React, {useContext} from 'react'
import { BrowserRouter, Routes, Route } from "react-router";
import { SpotifyAuthContext } from './contexts/SpotifyContext';
import { PlayerContext } from './contexts/PlayerContext';

function App() {
  const { token } = useContext(SpotifyAuthContext);
  const { currentTrack } = useContext(PlayerContext)

  return (
    <div className="App bg-[#121212]">
        {token &&
          <BrowserRouter>
            <Routes>
              <Route path="/index.html" element={<Playlists />} />
              <Route path="/playlist/:id" element={<Playlist />} />
            </Routes>
          </BrowserRouter> 
        }  

        {!token &&
          <Auth />
        }
    </div>
  );
}

export default App;
