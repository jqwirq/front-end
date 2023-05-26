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
        <Link
          className="text-xl hover:text-slate-300 active:text-slate-200"
          href="/product"
        >
          back
        </Link>
      </div>

      <h1 className="text-5xl text-center pt-4">Product List</h1>

      <div className="grow overflow-auto flex flex-col pt-6 md:px-[8%] lg:px-[10%]">
        {products.length === 0 && (
          <div className="text-center grow text-slate-400">empty</div>
        )}
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
                      {/* <Modal product={v} /> */}
                      <Link
                        className="text-slate-600 hover:text-slate-500 active:text-slate-600"
                        href={`/product/details/${v.no}`}
                      >
                        details
                      </Link>
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
