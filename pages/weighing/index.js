import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="bg-slate-100 min-h-screen">
        <div className="min-h-screen max-h-screen flex flex-col">
          <div className="bg-slate-900 text-slate-200 basis-8 shrink-0 px-4 flex justify-between items-center">
            <Link className="" href="/">
              back
            </Link>

            <h1 className="tracking-widest font-semibold">Weighing Process</h1>
          </div>

          <div className="grow grid grid-cols-10 grid-rows-6 gap-4 px-2 md:px-[1%] lg:px-[3%] py-2 text-2xl">
            <div className="col-span-6 row-span-4 flex flex-col gap-4 px-8 text-sm justify-center">
              <THE_FORMS />
            </div>
            <div className="col-start-1 col-end-6 row-start-5 row-end-7 flex flex-col justify-center items-center gap-4 px-8 text-sm">
              <THE_BUTTONS />
            </div>
            <div className="col-start-7 col-end-13 row-start-1 row-end-3 flex flex-col justify-center items-center gap-4">
              <THE_TIMER />
            </div>
            <div className="col-start-7 col-end-13 row-start-3 row-end-5 flex justify-center items-center gap-4 text-sm">
              <THE_BUTTONS_2 />
            </div>
            <div className="col-start-6 col-end-13 row-start-5 row-end-7 flex flex-col justify-center items-center gap-4">
              <THE_WEIGHT />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function THE_WEIGHT() {
  return (
    <>
      <div className="bg-yellow-200 w-4/5 p-1 py-2 text-center">2000.00 KG</div>
      <div className="flex gap-2">
        <div className="bg-red-400">- 1980.00 KG.</div>
        <div className="bg-green-400">+ 2020.00 KG.</div>
      </div>
    </>
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

function THE_BUTTONS_2() {
  return (
    <>
      <button className="bg-green-600 hover:bg-green-500 text-white w-[120px] py-2">
        Start material
      </button>
      <button className="bg-green-600 hover:bg-green-500 text-white w-[120px] py-2">
        Start product
      </button>
    </>
  );
}

function THE_BUTTONS() {
  return (
    <>
      <div className="flex gap-4 basis-10 justify center">
        <button className="bg-slate-400 hover:bg-slate-300 w-[100px]">
          2 ton
        </button>
        <button className="bg-slate-400 hover:bg-slate-300 w-[100px]">
          350 Kg
        </button>
      </div>
      <div className="flex gap-4 basis-10 justify center">
        <button className="bg-slate-400 hover:bg-slate-300 w-[100px]">
          2 Kg
        </button>
        <button className="bg-slate-400 hover:bg-slate-300 w-[100px]">
          ...
        </button>
      </div>
    </>
  );
}

function THE_FORMS() {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>SAP Order No.</div>
        <input className="w-[50%] bg-yellow-200 p-1 text-[14px]" type="text" />
      </div>

      <div className="flex justify-between items-center">
        <div>Batch No.</div>
        <input className="w-[50%] bg-yellow-200 p-1 text-[14px]" type="text" />
      </div>

      <div className="flex justify-between items-center">
        <div>Product No.</div>
        <select className="w-[50%] bg-yellow-200 p-1 text-[14px]">
          <option value=""></option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Material No.</div>
        <select className="w-[50%] bg-yellow-200 p-1 text-[14px]">
          <option value=""></option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Packaging</div>
        <select className="w-[50%] bg-yellow-200 p-1 text-[14px]">
          <option value=""></option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Batch No.</div>
        <input className="w-[50%] bg-yellow-200 p-1 text-[14px]" type="text" />
      </div>

      <div className="flex justify-between items-center">
        <div>Target Qty. (Kg.)</div>
        <input className="w-[50%] bg-yellow-200 p-1 text-[14px]" type="text" />
      </div>

      <div className="flex justify-between items-center">
        <div>Tolerance (%)</div>
        <input className="w-[50%] bg-yellow-200 p-1 text-[14px]" type="text" />
      </div>
    </>
  );
}
