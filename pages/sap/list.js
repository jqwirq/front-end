import Link from "next/link";
import { useEffect } from "react";

function Page() {
  useEffect(() => {
    console.log("goblok");
  }, []);
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center">
          <Link
            className="text-xl hover:text-slate-300 active:text-slate-200"
            href="/"
          >
            back
          </Link>
        </div>

        <h1 className="text-5xl text-center pt-4">SAP List</h1>

        <div className="grow flex flex-col justify-center gap-10 px-2 md:px-[2%]">
          listnya disini
        </div>
      </div>
    </>
  );
}

export default Page;
