import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-slate-200 basis-8 px-4 flex items-center">
        <div></div>
      </div>

      <h1 className="text-3xl text-center pt-2">Main Menu</h1>

      <div className="grow flex flex-col justify-center gap-8 pb-10 px-10 md:px-[11%] lg:px-[14%]">
        <Link
          className="text-center bg-slate-300 text-4xl py-2"
          href="/product"
        >
          Product
        </Link>

        <button className="py-2 bg-slate-300 text-4xl">Weighing Process</button>
      </div>
    </div>
  );
}
