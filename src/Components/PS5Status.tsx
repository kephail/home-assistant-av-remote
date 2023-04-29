import { Client as PahoClient } from "paho-mqtt";
import { useEffect, useState } from "react";

const PS5_NAME = process.env.REACT_APP_PS5_NAME;

interface Ps5StatusData {
  power: string;
  title_name: string;
  title_image: string;
}

const PS5Status = () => {
  const [ps5Status, setPs5Status] = useState<Ps5StatusData | null>(null);
  const [client, setClient] = useState<PahoClient | null>(null);

  useEffect(() => {
    if (ps5Status) {
      console.log(ps5Status);
    }
  }, [ps5Status]);

  useEffect(() => {
    if (!PS5_NAME) return;
    const connectToMqttBroker = () => {
      const mqttClient = new PahoClient(
        "homeassistant.local",
        1884,
        "uniqueClientId"
      );

      mqttClient.onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
          console.error("MQTT connection lost:", responseObject.errorMessage);
        }
      };

      mqttClient.onMessageArrived = (message) => {
        if (message.destinationName === PS5_NAME) {
          setPs5Status(JSON.parse(message.payloadString));
        }
      };

      mqttClient.connect({
        userName: process.env.REACT_APP_MQTT_USERNAME,
        password: process.env.REACT_APP_MQTT_PASSWORD,
        onSuccess: () => {
          console.log("Connected to MQTT broker");
          mqttClient.subscribe(PS5_NAME);
        },
        onFailure: (error) => {
          console.error("MQTT connection failed:", error);
        },
      });

      setClient(mqttClient);

      return () => mqttClient.disconnect();
    };

    connectToMqttBroker();
  }, []);

  return (
    <div>
      <h2>PS5 Status</h2>
      {ps5Status ? (
        <div>
          <p>Status: {ps5Status.power}</p>
          {ps5Status.power !== "STANDBY" && (
            <div>
              <p>Currently Playing: {ps5Status.title_name}</p>
              <img
                className="currently-playing-image"
                src={ps5Status.title_image}
                alt={ps5Status.title_name}
              />
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PS5Status;
