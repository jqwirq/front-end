import Link from "next/link";
import CSVForm from "@/components/ImportProductsFromCSV";

export default function Page() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="bg-slate-900 text-slate-200 basis-8 px-4 flex justify-between items-center">
          <Link className="" href="/">
            back
          </Link>
        </div>
        <h1 className="text-3xl text-center pt-2">Product</h1>

        <div className="grow flex flex-col justify-center gap-8 pb-10 px-10 md:px-[11%] lg:px-[14%]">
          <Link
            className="py-2 bg-slate-300 text-4xl text-center"
            href="/product/csv"
          >
            Import From CSV
          </Link>

          <Link
            className="py-2 bg-slate-300 text-4xl text-center"
            href="/product/input"
          >
            Input Manually
          </Link>

          <Link
            className="py-2 bg-slate-300 text-4xl text-center"
            href="/product/list"
          >
            Product List
          </Link>
        </div>
      </div>
    </>
  );
}

// function MyAlert({ message }) {
//   const [isShow, setIsShow] = useState(false);

//   if (!isShow) return null;

//   return (
//     <div
//       // OVERLAY
//       className="fixed inset-0 bg-slate-900/50 flex justify-center items-center"
//     >
//       <div
//         // MODAL
//         className="bg-slate-50 p-6"
//       >
//         <div>{message}</div>

//         <button onClick={() => setIsShow(false)}>Close</button>
//       </div>
//     </div>
//   );
// }
