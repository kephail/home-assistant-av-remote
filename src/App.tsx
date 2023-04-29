// App.tsx
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { IconButton } from "@mui/material";
import {
  callService,
  Connection,
  subscribeEntities,
} from "home-assistant-js-websocket";
import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { fetchUser, getAuthAndConnection } from "./api";
import "./App.css";
import AppleTVStatus from "./Components/AppleTVStatus";
import BottomNav from "./Components/BottomNav";
import PS5Status from "./Components/PS5Status";
import VolumeSlider from "./Components/VolumeSlider";

const StyledButton = styled.button`
  ${tw`bg-blue-500 text-white font-bold py-2 px-4 rounded`}
`;

const App = () => {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isMediaPlayerOn, setIsMediaPlayerOn] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { auth, connection } = await getAuthAndConnection();
        setConnection(connection);
        const user = await fetchUser(connection);
        console.log("Logged in as", user);

        subscribeEntities(connection, (entities) => {
          const mediaPlayer = entities["media_player.anthem_av"];
          if (mediaPlayer) {
            setSelectedSource(mediaPlayer.attributes.source);
            setIsMediaPlayerOn(
              mediaPlayer.state === "on" || mediaPlayer.state === "playing"
            );
          }
        });
      } catch (err) {
        console.error("Error getting connection:", err);
      }
    })();
  }, []);

  const powerOnMediaPlayer = useCallback(async () => {
    if (connection) {
      callService(connection, "media_player", "turn_on", {
        entity_id: "media_player.anthem_av",
      });
    }
  }, [connection]);

  const powerOnTV = async () => {
    if (connection) {
      callService(connection, "wake_on_lan", "send_magic_packet", {
        mac: process.env.REACT_APP_WEBOS_TV_MAC_ADDRESS,
      });
    }
  };

  const powerOffMediaPlayer = useCallback(async () => {
    if (connection) {
      callService(connection, "media_player", "turn_off", {
        entity_id: "media_player.anthem_av",
      });
    }
  }, [connection]);

  const renderComponentBySource = () => {
    if (!connection) return null;
    switch (selectedSource) {
      case "Apple TV":
        return <AppleTVStatus connection={connection} />;
      case "PS5":
        return <PS5Status />;
      default:
        return (
          <div>
            <p>No source selected.</p>
            <button onClick={powerOnMediaPlayer}>Power On</button>
          </div>
        );
    }
  };

  if (!connection) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {/* test styled components and tailwind */}
      <StyledButton>Click me</StyledButton>
      <button onClick={powerOnTV}>powerOnTV</button>
      <div className="container">
        {isMediaPlayerOn && (
          <IconButton
            className="power-off-button"
            onClick={powerOffMediaPlayer}
            color="secondary"
          >
            <PowerSettingsNewIcon />
          </IconButton>
        )}
        {renderComponentBySource()}
      </div>
      {isMediaPlayerOn && (
        <div className="bottom-container">
          <VolumeSlider connection={connection} />
          <BottomNav connection={connection} />
        </div>
      )}
    </div>
  );
};

export default App;
