import {
  Connection,
  callService,
  subscribeEntities,
} from "home-assistant-js-websocket";
import { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";

const BottomNavContainer = styled.nav`
  ${tw`flex justify-around items-center bg-white p-2 border-t border-gray-300`}
`;

const NavItem = styled.div`
  ${tw`p-2 cursor-pointer`}
`;

const ActiveNavItem = styled(NavItem)`
  ${tw`text-blue-500`}
`;

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

const BottomNav = ({ connection }: BottomNavProps) => {
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
    <BottomNavContainer>
      {navItems.map((item) => {
        const NavItemComponent =
          currentSource === item ? ActiveNavItem : NavItem;

        return (
          <NavItemComponent key={item} onClick={() => handleNavItemClick(item)}>
            {item}
          </NavItemComponent>
        );
      })}
    </BottomNavContainer>
  );
};

export default BottomNav;
