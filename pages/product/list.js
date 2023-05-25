import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(API_URL + "/products")
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setProducts(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="min-h-screen max-h-screen flex flex-col">
      <div className="bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center">
        <Link className="text-xl hover:text-slate-300 active:text-slate-200" href="/product">
          back
        </Link>
      </div>

      <h1 className="text-5xl text-center pt-4">Product List</h1>

      <div className="grow overflow-auto flex flex-col pt-6 md:px-[8%] lg:px-[10%]">
        {products.length === 0 && <div className="text-center grow text-slate-400">empty</div>}
        {products.length !== 0 && (
          <table className="table-auto text-lg border-collapse">
            <thead className="border-b-2 border-slate-950">
              <tr>
                <th className="p-2">Product No.</th>
                <th className="p-2">Created At</th>
                <th className="p-2">Updated At</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((v, i) => {
                let createdAt = new Date(v.createdAt);
                let updatedAt = new Date(v.updatedAt);
                return (
                  <tr
                    className="text-center border-b border-slate-950"
                    key={v.no}
                  >
                    <td className="p-2">{v.no}</td>
                    <td className="p-2">{createdAt.toLocaleString("en-UK")}</td>
                    <td className="p-2">{updatedAt.toLocaleString("en-UK")}</td>
                    <td className="p-2">
                      <Modal product={v} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Modal({ product }) {
  const [isShow, setisShow] = useState(false);
  console.log(product.materials);

  return (
    <>
      <button
        className="text-slate-600 hover:text-slate-500 active:text-slate-600"
        onClick={() => setisShow(true)}
      >
        details
      </button>

      {isShow && (
        <div className="bg-slate-900/50 fixed inset-0 flex justify-center items-center">
          <div className={`p-4 max-w-[80%] flex flex-col gap-4 bg-slate-100`}>
            <div className="text-base text-left">
              <div className="mb-2">Product no. : {product.no}</div>
              <div className="">Materials:</div>
              <ul className="list-disc pl-6">
                {product &&
                  product.materials.map((m) => <li key={m.no}>{m.no}</li>)}
              </ul>
            </div>

            <button
              onClick={() => setisShow(false)}
              className="bg-slate-300 hover:bg-slate-400 active:bg-slate-300 py-1 px-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// THIS IS WORK
// return (
//   <div className="min-h-screen max-h-screen flex flex-col">
//     <div className="bg-slate-200 basis-8 shrink-0 px-4 flex justify-between items-center">
//       <Link className="" href="/product">
//         back
//       </Link>
//     </div>

//     <h1 className="text-3xl text-center pt-2">Product List</h1>

//     <div className="grow overflow-auto flex flex-col flex-wrap gap-8 pb-10 pt-6 px-10 md:px-[11%] lg:px-[14%]">
//       {products.length === 0 && "Empty"}
//       {products.length !== 0 &&
//         products.map((v, i) => {
//           return (
//             <div
//               className="flex items-center gap-6 text-center bg-slate-200"
//               key={v.no}
//             >
//               <div className="grow">{v.no}</div>
//             </div>
//           );
//         })}
//     </div>
//   </div>
// );

// return (
//   <div
//     className="flex items-center gap-6 text-center bg-slate-200"
//     key={v.no}
//   >
//     <div className="grow">{v.no}</div>
//     {/* <div className="grow">
//       {v.materials.map((x, j) => {
//         return <div key={x.no}>{x.no}</div>;
//       })}
//     </div> */}
//   </div>

// return (

// )

// return (
//   <div className="min-h-screen max-h-screen flex flex-col">
//     <div className="bg-slate-200 flex-shrink-0 px-4 flex justify-between items-center">
//       <Link className="" href="/product">
//         back
//       </Link>
//     </div>

//     <h1 className="text-3xl text-center pt-2 flex-shrink-0">Product List</h1>

//     <div className="flex-grow overflow-auto flex flex-col flex-wrap gap-8 pb-10 pt-6 px-10 md:px-[11%] lg:px-[14%]">
//       {products.length === 0 && "Empty"}
//       {products.length !== 0 &&
//         products.map((v, i) => {
//           return (
//             <div
//               className="flex items-center gap-6 text-center bg-slate-200"
//               key={v.no}
//             >
//               <div className="grow">{v.no}</div>
//             </div>
//           );
//         })}
//     </div>
//   </div>
// );
