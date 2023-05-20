import Link from "next/link";
import CSVForm from "@/components/ImportProductsFromCSV";

export default function Page() {
  return (
    <>
      <div className="bg-slate-100 min-h-screen">
        <div className="min-h-screen flex flex-col">
          <div className="bg-slate-900 text-slate-200  basis-8 px-4 flex justify-between items-center">
            <Link className="" href="/product">
              back
            </Link>
          </div>

          <h1 className="text-3xl text-center pt-2">Input CSV</h1>

          <div className="grow flex flex-col justify-center px-10 md:px-[11%] lg:px-[14%] pt-10 pb-20 gap-8 text-2xl">
            <CSVForm />
          </div>
        </div>
      </div>
    </>
  );
}
