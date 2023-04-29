// AppleTVRemote.tsx
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { callService, Connection } from "home-assistant-js-websocket";
import React from "react";
import styled from "styled-components";
import tw from "twin.macro";

interface AppleTVRemoteProps {
  connection: Connection;
}

const RemoteContainer = styled.div`
  ${tw`relative w-40 h-40 bg-gray-400  rounded-full border-black border-2`}
`;

const RemoteButton = styled.button`
  ${tw`text-xl absolute left-1/2 top-1/2 rounded-full w-12 h-12 flex justify-center items-center text-black`}
`;

const CenterButton = styled.button`
  ${tw`w-16 h-16 rounded-full bg-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-white`}
`;

const AppleTVRemote: React.FC<AppleTVRemoteProps> = ({ connection }) => {
  const sendCommand = (command: string) => {
    callService(connection, "remote", "send_command", {
      entity_id: "remote.living_room",
      command: command,
    });
  };

  return (
    <>
      <button
        onClick={() => sendCommand("menu")}
        style={{ transform: "translate(-300%, 0)" }}
        className="relative flex items-center justify-center flex-shrink-0 w-[60px] h-[60px] font-sans text-base leading-none rounded-full overflow-hidden select-none text-white bg-gray-600"
      >
        <ChevronLeftIcon />
      </button>
      <RemoteContainer>
        <CenterButton onClick={() => sendCommand("select")}></CenterButton>
        <RemoteButton
          onClick={() => sendCommand("up")}
          style={{ transform: "translate(-50%, -160%)" }}
        >
          ▲
        </RemoteButton>
        <RemoteButton
          onClick={() => sendCommand("left")}
          style={{ transform: "translate(-160%, -50%)" }}
        >
          ◀
        </RemoteButton>
        <RemoteButton
          onClick={() => sendCommand("right")}
          style={{ transform: "translate(60%, -50%)" }}
        >
          ▶
        </RemoteButton>
        <RemoteButton
          onClick={() => sendCommand("down")}
          style={{ transform: "translate(-50%, 60%)" }}
        >
          ▼
        </RemoteButton>
      </RemoteContainer>
    </>
  );
};

export default AppleTVRemote;
