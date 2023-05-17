import Link from "next/link";
import CSVForm from "@/components/ImportProductsFromCSV";

export default function Page() {
  return (
    <>
      <div
        // CONTAINER
        className="bg-slate-100 min-h-screen"
      >
        <div className="min-h-screen flex flex-col">
          <div className="px-4 flex justify-between items-center">
            <Link className="" href="/product">
              back
            </Link>
          </div>

          <h1 className="text-4xl text-center py-4">Input CSV</h1>

          <div className="grow flex flex-col justify-center items-center pt-10 pb-20 gap-2">
            <CSVForm />
          </div>
        </div>
      </div>
    </>
  );
}
