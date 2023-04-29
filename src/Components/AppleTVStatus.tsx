import { callService, subscribeEntities } from "home-assistant-js-websocket";
import { Connection } from "home-assistant-js-websocket/dist/connection";
import { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import AppleTVRemote from "./AppleTVRemote";

interface AppleTVStatusProps {
  connection: Connection;
}

interface AppCardProps {
  title: string;
  imageUrl: string;
  launchCommand: () => void;
}

const Avatar = styled.div`
  ${tw`w-12 h-12 rounded-full mr-2 overflow-hidden inline-block align-middle`}
`;

const AppCardContainer = styled.div`
  ${tw`bg-black flex flex-col items-center justify-center border border-gray-300 rounded p-4 cursor-pointer transition-all duration-300 ease-in-out`}
  &:hover {
    ${tw`shadow-md`}
  }
`;

const AppCard = ({ title, imageUrl, launchCommand }: AppCardProps) => (
  <AppCardContainer onClick={launchCommand}>
    <img
      src={imageUrl}
      alt={title}
      className="w-full h-auto max-h-24 object-contain"
    />
  </AppCardContainer>
);

export const LIVING_ROOM_ENTITY_ID = "media_player.living_room";

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
    <div className="apple-tv-status flex flex-col items-center">
      <h2 className="mb-4">Apple TV Status</h2>
      <div className="flex items-center">
        {currentlyPlayingMedia && (
          <Avatar>
            <img
              src={process.env.REACT_APP_HASS_URL + currentlyPlayingMedia}
              alt={currentlyPlaying || "Now playing"}
              className="w-full h-full object-cover"
            />
          </Avatar>
        )}
        <p>{currentlyPlaying}</p>
      </div>
      <div className="app-grid pt-4 grid grid-cols-2 gap-4">
        {apps.map((app) => (
          <AppCard
            key={app.title}
            title={app.title}
            imageUrl={app.imageUrl}
            launchCommand={() => launchApp(app.title)}
          />
        ))}
      </div>
      <div className="fixed right-4 bottom-32">
        <AppleTVRemote connection={connection} />
      </div>
    </div>
  );
};

export default AppleTVStatus;
