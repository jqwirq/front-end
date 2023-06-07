import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-slate-900 text-slate-200 basis-12 shrink-0 flex items-center">
        <div></div>
      </div>

      <h1 className="text-5xl text-center pt-4">Main Menu</h1>

      <div className="grow flex flex-col justify-center gap-10 pb-[4%] px-10 md:px-[8%] lg:px-[10%]">
        <Link
          className="py-4 text-6xl text-center bg-slate-300 hover:bg-slate-400 active:bg-slate-300"
          href="/product"
        >
          Product
        </Link>

        <Link
          className="py-4 text-6xl text-center bg-slate-300 hover:bg-slate-400 active:bg-slate-300"
          href="/weighing"
        >
          Weighing Process
        </Link>

        <Link
          className="py-4 text-6xl text-center bg-slate-300 hover:bg-slate-400 active:bg-slate-300"
          href="/sap/list"
        >
          SAP
        </Link>
      </div>
    </div>
  );
}
