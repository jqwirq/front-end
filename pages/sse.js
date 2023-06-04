// import { useEffect } from "react";

// const HomePage = () => {
//   useEffect(() => {
//     // const eventSource = new EventSource("http://127.0.0.1:5000/events");
//     const eventSource = new EventSource("http://127.0.0.1:1880/test");

//     eventSource.onmessage = (event) => {
//       console.log("New message", event.data);
//     };

//     eventSource.onerror = (event) => {
//       console.log("EventSource failed:", event);
//     };

//     return () => {
//       eventSource.close();
//     };
//   }, []);

//   return <div>Check your console for events</div>;
// };

// export default HomePage;

import { useEffect } from "react";

const HomePage = () => {
  useEffect(() => {
    const eventSource = new EventSource("http://127.0.0.1:1880/test");

    eventSource.onmessage = (event) => {
      console.log("New message", event.data);
    };

    eventSource.onerror = (event) => {
      console.log("EventSource failed:", event);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return <div>Check your console for events</div>;
};

export default HomePage;
