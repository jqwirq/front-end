import Link from "next/link";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  const [data, setData] = useState("");
  const [eventSource, setEventSource] = useState(null);

  const handleClick = () => {
    if (!eventSource) {
      const es = new EventSource(API_URL + "/events");
      setEventSource(es);

      es.onmessage = (event) => {
        setData(event.data);
      };

      es.onerror = (err) => {
        console.error("EventSource failed:", err);
        es.close();
        setEventSource(null);
      };
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <>
      <div className="bg-slate-100 min-h-screen">
        <div className="min-h-screen max-h-screen flex flex-col">
          <div className="bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center">
            <Link
              className="text-xl hover:text-slate-300 active:text-slate-200"
              href="/"
            >
              back
            </Link>

            <h1 className="tracking-widest font-semibold text-xl">
              Weighing Process
            </h1>
          </div>

          <div
            className="grow grid grid-cols-10 grid-rows-6 gap-4 px-2 md:px-[1%] lg:px-[3%] py-2 text-2xl"
            style={{ gridTemplateRows: "1fr 1fr 1fr 1fr 1fr 1.5fr" }}
          >
            <FormWeighing />

            <ScaleSelectButton handleClick={handleClick} />

            <div className="col-start-7 col-end-13 row-start-1 row-end-3 flex flex-col justify-center items-center gap-4">
              <THE_TIMER />
            </div>

            <StartButton />

            <Weight eventSource={eventSource} data={data} />
          </div>
        </div>
      </div>
    </>
  );
}

function Weight({ eventSource, data }) {
  return (
    <div className="col-start-5 col-end-13 row-start-5 row-end-7 flex flex-col justify-start items-center px-2 gap-4">
      <div className="text-9xl bg-yellow-200 font-bold w-full p-4 text-center">
        {data ? data : "0.00KG"}
      </div>

      <div className="flex justify-center text-3xl text-center gap-4 w-full">
        <div className="bg-red-400 basis-1/2 py-2 px-4">- 0 KG.</div>
        <div className="bg-red-400 basis-1/2 py-2 px-4">+ 0 KG.</div>
      </div>
    </div>
  );
}

function THE_TIMER() {
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="text-xs">Duration per Product</div>
        <div className="bg-black text-white text-center w-[120px] py-2">
          00:00:00
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-xs">Duration per Product</div>
        <div className="bg-black text-white text-center w-[120px] py-2">
          00:00:00
        </div>
      </div>
    </>
  );
}

function StartButton() {
  return (
    <div className="px-2 pb-8 col-start-7 col-end-13 row-start-3 row-end-5 flex justify-center items-center gap-4 text-xl">
      <button className="bg-green-600 hover:bg-green-500 basis-1/2 text-white py-4">
        Start material
      </button>

      <button className="bg-green-600 hover:bg-green-500 basis-1/2 text-white py-4">
        Start product
      </button>
    </div>
  );
}

function ScaleSelectButton({ handleClick }) {
  return (
    <div className="col-start-1 col-end-5 row-start-5 pb-8 row-end-7 flex flex-col justify-center items-center gap-4 text-4xl">
      <div className="flex w-full gap-4 justify-center items-center">
        <button
          onClick={handleClick}
          className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2"
        >
          2 ton
        </button>

        <button className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2">
          350 Kg
        </button>
      </div>
      <div className="flex w-full gap-4 justify-center items-center">
        <button className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2">
          2 Kg
        </button>

        <button className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2">
          ...
        </button>
      </div>
    </div>
  );
}

function FormWeighing() {
  return (
    <div className="col-span-6 row-span-4 flex flex-col gap-4 pl-4 text-md justify-center">
      <div className="flex justify-between items-center">
        <div>SAP Order No.</div>
        <input className="w-[50%] bg-yellow-200 p-1" type="text" />
      </div>

      <div className="flex justify-between items-center">
        <div>Batch No.</div>
        <input className="w-[50%] bg-yellow-200 p-1" type="text" />
      </div>

      <div className="flex justify-between items-center">
        <div>Product No.</div>
        <select className="w-[50%] bg-yellow-200 p-1">
          <option value=""></option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Material No.</div>
        <select className="w-[50%] bg-yellow-200 p-1">
          <option value="test">Test</option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Packaging</div>
        <select className="w-[50%] bg-yellow-200 p-1">
          <option value=""></option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Batch No.</div>
        <input className="w-[50%] bg-yellow-200 p-1" type="text" />
      </div>

      <div className="flex justify-between items-center">
        <div>Target Qty. (Kg.)</div>
        <input className="w-[50%] bg-yellow-200 p-1" type="text" />
      </div>

      <div className="flex justify-between items-center">
        <div>Tolerance (%)</div>
        <input className="w-[50%] bg-yellow-200 p-1" type="text" />
      </div>
    </div>
  );
}
