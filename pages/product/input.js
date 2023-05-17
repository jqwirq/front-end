import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-slate-200 basis-8 px-4 flex justify-between items-center">
        <Link className="" href="/product">
          back
        </Link>
      </div>
      <h1 className="text-3xl text-center pt-2">Input Product</h1>

      <div className="grow flex flex-col gap-2 pb-10 px-10 md:px-[11%] lg:px-[14%] pt-6">
        <div className="text-lg flex gap-4 items-center px-4">
          <div>Product No :</div>
          <input className="grow px-3 py-1 tracking-widest" type="text" />
        </div>

        <div className="grow">test</div>

        <button className="py-1 mx-10 bg-slate-300 text-lg">Submit</button>
      </div>
    </div>
  );
}
