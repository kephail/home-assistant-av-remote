import { callService, subscribeEntities } from "home-assistant-js-websocket";
import { Connection } from "home-assistant-js-websocket/dist/connection";
import React, { CSSProperties, useEffect, useState } from "react";

interface AppleTVStatusProps {
  connection: Connection;
}

interface AppCardProps {
  title: string;
  imageUrl: string;
  launchCommand: () => void;
}

const avatarStyle: CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  marginRight: "8px",
  overflow: "hidden",
  display: "inline-block",
  verticalAlign: "middle",
};

const AppCard: React.FC<AppCardProps> = ({
  title,
  imageUrl,
  launchCommand,
}) => (
  <div className="app-card" onClick={launchCommand}>
    <img src={imageUrl} alt={title} />
  </div>
);

const LIVING_ROOM_ENTITY_ID = "media_player.living_room";

const AppleTVStatus = ({ connection }: AppleTVStatusProps) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [currentlyPlayingMedia, setCurrentlyPlayingMedia] = useState<
    string | null
  >(null);

  useEffect(() => {
    const unsubscribeEntities = subscribeEntities(connection, (entities) => {
      const mediaPlayer = entities[LIVING_ROOM_ENTITY_ID];
      console.log(mediaPlayer.attributes);
      setCurrentlyPlaying(mediaPlayer?.attributes.media_title || null);
      setCurrentlyPlayingMedia(mediaPlayer?.attributes.entity_picture || null);
    });

    return () => {
      unsubscribeEntities();
    };
  }, [connection]);

  const launchApp = (source: string) => {
    callService(connection, "media_player", "select_source", {
      entity_id: LIVING_ROOM_ENTITY_ID,
      source: source,
    });
  };

  const powerOnMediaPlayer = () => {
    callService(connection, "media_player", "turn_on", {
      entity_id: LIVING_ROOM_ENTITY_ID,
    });
  };

  const powerOffMediaPlayer = () => {
    callService(connection, "media_player", "turn_off", {
      entity_id: LIVING_ROOM_ENTITY_ID,
    });
  };

  const apps = [
    {
      title: "Netflix",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    },
    {
      title: "Disney+",
      imageUrl:
        "https://static-assets.bamgrid.com/product/disneyplus/images/logo.1a56f51c764022ee769c91d894d44326.svg",
    },
  ];

  return (
    <div className="apple-tv-status">
      <button onClick={powerOnMediaPlayer}>Turn on</button>
      <button onClick={powerOffMediaPlayer}>Turn off</button>
      <h2>Apple TV Status</h2>
      <div style={{ display: "flex", alignItems: "center" }}>
        {currentlyPlayingMedia && (
          <div style={avatarStyle}>
            <img
              src={process.env.REACT_APP_HASS_URL + currentlyPlayingMedia}
              alt={currentlyPlaying || "Now playing"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}
        <p>{currentlyPlaying}</p>
      </div>
      <div className="app-grid">
        {apps.map((app) => (
          <AppCard
            key={app.title}
            title={app.title}
            imageUrl={app.imageUrl}
            launchCommand={() => launchApp(app.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default AppleTVStatus;
