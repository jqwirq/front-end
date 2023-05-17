import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  useEffect(() => {
    console.log(API_URL);
  }, []);

  return (
    <>
      <div>list</div>
    </>
  );
}
