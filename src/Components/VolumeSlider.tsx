// VolumeSlider.tsx
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Connection,
  callService,
  subscribeEntities,
} from "home-assistant-js-websocket";
import React, { useEffect, useState } from "react";

interface VolumeSliderProps {
  connection: Connection;
}

const VolumeSlider = ({ connection }: VolumeSliderProps) => {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    const unsubEntities = subscribeEntities(connection, (entities) => {
      if (entities["media_player.anthem_av"]) {
        const currentVolume =
          entities["media_player.anthem_av"].attributes.volume_level;
        setVolume(currentVolume);
      }
    });
    return () => unsubEntities();
  }, [connection]);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    callService(connection, "media_player", "volume_set", {
      entity_id: "media_player.anthem_av",
      volume_level: newVolume,
    });
  };

  const incrementVolume = () => {
    const newVolume = Math.min(volume + 0.01, 1);
    updateVolume(newVolume);
  };

  const decrementVolume = () => {
    const newVolume = Math.max(volume - 0.01, 0);
    updateVolume(newVolume);
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    callService(connection, "media_player", "volume_set", {
      entity_id: "media_player.anthem_av",
      volume_level: newVolume,
    });
  };

  return (
    <div className="volume-slider">
      <button className="volume-button" onClick={decrementVolume}>
        <RemoveIcon />
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
      />
      <button className="volume-button" onClick={incrementVolume}>
        <AddIcon />
      </button>
    </div>
  );
};

export default VolumeSlider;
