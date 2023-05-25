import Link from "next/link";
import CSVForm from "@/components/ImportProductsFromCSV";

export default function Page() {
  return (
    <>
      <div className="bg-slate-100 min-h-screen">
        <div className="min-h-screen flex flex-col">
          <div className="bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center">
            <Link className="text-xl hover:text-slate-300 active:text-slate-200" href="/product">
              back
            </Link>
          </div>

          <h1 className="text-5xl text-center pt-4">Input CSV</h1>

          <div className="grow flex flex-col justify-center gap-10 pb-[4%] px-10 md:px-[8%] lg:px-[10%]">
            <CSVForm />
          </div>
        </div>
      </div>
    </>
  );
}
