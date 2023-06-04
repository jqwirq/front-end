import { useEffect, useState, useRef } from "react";

export default function WebSocketExample() {
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    // Do not automatically connect on component mount
    // Connect will be triggered manually by a button
    return () => {
      disconnect();
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
    };
  }

  function disconnect() {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      console.log("Disconnected from WebSocket server");
    }
  }

  return (
    <div>
      <h1>WebSocket Messages</h1>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      {messages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}
