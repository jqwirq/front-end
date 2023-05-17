import { useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  useEffect(() => {
    console.log(API_URL);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-slate-200 basis-8 px-4 flex justify-between items-center">
        <Link className="" href="/product">
          back
        </Link>
      </div>
      
      <h1 className="text-3xl text-center pt-2">Product List</h1>
    </div>
  );
}
