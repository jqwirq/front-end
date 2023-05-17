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
    <div className="min-h-screen flex flex-col">
      <div className="bg-slate-200 basis-8 px-4 flex justify-between items-center">
        <Link className="" href="/product">
          back
        </Link>
      </div>

      <h1 className="text-3xl text-center pt-2">Product List</h1>

      <div className="grow flex flex-col justify-center gap-8 pb-10 px-10 md:px-[11%] lg:px-[14%]">
        {products.length === 0 && "Empty"}
        {products.length !== 0 &&
          products.map((v, i) => {
            return (
              <div
                className="flex items-center gap-6 text-center bg-slate-200"
                key={v.no}
              >
                <div className="grow">{v.no}</div>
                <div className="grow">
                  {v.materials.map((x, j) => {
                    return <div key={x.no}>{x.no}</div>;
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
