import { useEffect, useState, useRef } from "react";

export default function WebSocketExample() {
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);
  const shouldAttemptReconnect = useRef(true);

  useEffect(() => {
    connect();

    // Make sure to close the WebSocket connection when the component unmounts
    return () => {
      shouldAttemptReconnect.current = false;
      ws.current && ws.current.close();
    };
  }, []);

  function connect() {
    ws.current = new WebSocket("ws://127.0.0.1:1880/ws1");

    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.current.onmessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message.data]);
    };

    ws.current.onerror = (error) => {
      console.log(error);
    };

    ws.current.onclose = (event) => {
      console.log("Disconnected from WebSocket server");
      if (shouldAttemptReconnect.current) {
        console.log("Attempting to reconnect...");
        setTimeout(connect, 3000); // Attempt to reconnect every 3 seconds
      }
    };
  }

  return (
    <div>
      <h1>WebSocket Messages</h1>
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}
