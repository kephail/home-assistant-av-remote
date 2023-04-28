import { callService, subscribeEntities } from "home-assistant-js-websocket";
import { Connection } from "home-assistant-js-websocket/dist/connection";
import React, { useEffect, useState } from "react";

interface AppleTVStatusProps {
  connection: Connection;
}

interface AppCardProps {
  title: string;
  imageUrl: string;
  launchCommand: () => void;
}

interface MediaPlayerAttributes {
  media_title: string;
  entity_picture: string;
}

const AppCard: React.FC<AppCardProps> = ({
  title,
  imageUrl,
  launchCommand,
}) => (
  <div className="app-card" onClick={launchCommand}>
    <img src={imageUrl} alt={title} />
    {/* <h4>{title}</h4> */}
  </div>
);

const AppleTVStatus: React.FC<AppleTVStatusProps> = ({ connection }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [currentlyPlayingMedia, setCurrentlyPlayingMedia] = useState<
    string | null
  >(null);

  useEffect(() => {
    const unsubscribeEntities = subscribeEntities(connection, (entities) => {
      const mediaPlayer = entities["media_player.living_room"];
      console.log(mediaPlayer.attributes);
      if (mediaPlayer) {
        setCurrentlyPlaying(mediaPlayer.attributes.media_title);
        if (mediaPlayer.attributes.entity_picture) {
          setCurrentlyPlayingMedia(mediaPlayer.attributes.entity_picture);
        }
      }
    });

    return () => {
      unsubscribeEntities();
    };
  }, [connection]);

  const launchApp = (source: string) => {
    callService(connection, "media_player", "select_source", {
      entity_id: "media_player.living_room",
      source: source,
    });
  };

  const powerOnMediaPlayer = async () => {
    if (connection) {
      callService(connection, "media_player", "turn_on", {
        entity_id: "media_player.living_room",
      });
    }
  };

  const powerOffMediaPlayer = async () => {
    if (connection) {
      callService(connection, "media_player", "turn_off", {
        entity_id: "media_player.living_room",
      });
    }
  };

  return (
    <div className="apple-tv-status">
      <button onClick={powerOnMediaPlayer}>Turn on</button>
      <h2>Apple TV Status</h2>
      <p>Currently playing: {currentlyPlaying || "Nothing"}</p>
      {currentlyPlayingMedia && (
        <img src={process.env.REACT_APP_HASS_URL + currentlyPlayingMedia} />
      )}
      <div className="app-grid">
        <AppCard
          title="Netflix"
          imageUrl="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          launchCommand={() => launchApp("Netflix")}
        />
        <AppCard
          title="Disney+"
          imageUrl="https://static-assets.bamgrid.com/product/disneyplus/images/logo.1a56f51c764022ee769c91d894d44326.svg"
          launchCommand={() => launchApp("Disney+")}
        />
      </div>
    </div>
  );
};

export default AppleTVStatus;
