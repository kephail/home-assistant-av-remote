// BottomNav.tsx
import {
  callService,
  Connection,
  subscribeEntities,
} from "home-assistant-js-websocket";
import React, { useEffect, useState } from "react";

interface BottomNavProps {
  connection: Connection;
}

const navItems = ["Apple TV", "PS5", "Switch", "Shield"];
const hdmiMapping: Record<string, string> = {
  "HDMI 1": "Apple TV",
  "HDMI 2": "PS5",
  "HDMI 3": "Switch",
  "HDMI 4": "Shield",
};

const BottomNav: React.FC<BottomNavProps> = ({ connection }) => {
  const [currentSource, setCurrentSource] = useState<string>("");

  useEffect(() => {
    const unsubEntities = subscribeEntities(connection, (entities) => {
      if (entities["media_player.anthem_av"]) {
        const source = entities["media_player.anthem_av"].attributes.source;
        setCurrentSource(source);

        // Update source based on HDMI mapping
        if (hdmiMapping[source]) {
          callService(connection, "media_player", "select_source", {
            entity_id: "media_player.anthem_av",
            source: hdmiMapping[source],
          });
        }
      }
    });
    return () => unsubEntities();
  }, [connection]);

  const handleNavItemClick = (source: string) => {
    callService(connection, "media_player", "select_source", {
      entity_id: "media_player.anthem_av",
      source: source,
    });
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <div
          key={item}
          className={`nav-item${currentSource === item ? " active" : ""}`}
          onClick={() => handleNavItemClick(item)}
        >
          {item}
        </div>
      ))}
    </nav>
  );
};

export default BottomNav;
