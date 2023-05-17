import { useState, useRef } from "react";
import Link from "next/link";

export default function Page() {
  const [productNo, setProductNo] = useState("");
  const [isInput, setIsInput] = useState(false);
  const [materialsNo, setMaterialsNo] = useState([]);

  const materialNo = useRef();

  const handleClickSubmit = () => {
    if (productNo === "") {
      console.log("it's empty");
    } else {
      const data = {
        productNo,
        materialsNo,
      };
      console.log(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-slate-200 basis-8 px-4 flex justify-between items-center">
        <Link className="" href="/product">
          back
        </Link>
      </div>
      <h1 className="text-3xl text-center pt-2">Input Product</h1>

      <div className="grow flex flex-col gap-2 pb-10 px-10 md:px-[11%] lg:px-[14%] pt-6">
        {/* INPUT PRODUCT NO */}
        <div className="text-lg flex gap-4 items-center px-4">
          <div className="">Product No</div>
          <div>:</div>
          <input
            className="grow px-3 py-1 tracking-widest appearance-none"
            type="number"
            onChange={(e) => {
              const value = e.target.value;
              setProductNo(() => value);
            }}
          />
        </div>

        <div className="text-base flex gap-4 items-center px-4">
          <div className="">Material No</div>
          <div>:</div>
          <input
            ref={materialNo}
            className="grow px-3 py-1 tracking-widest"
            type="number"
          />

          <button
            className="bg-slate-300 p-1 text-xs"
            onClick={() => {
              const v = materialNo.current.value;

              if (v === "") {
                console.log("fuck you");
              } else if (v.length < 8 || v.length > 12) {
                console.log("you dick head");
              } else {
                console.log(v);
                setMaterialsNo((state) => [...state, v]);
                materialNo.current.value = "";
              }
            }}
          >
            Add Material
          </button>
        </div>
        <div className="grow text-center">
          {materialsNo.length === 0 ? (
            <div>empty</div>
          ) : (
            materialsNo.map((v, i) => {
              return <div key={i}>{v}</div>;
            })
          )}
        </div>

        <button
          className="py-1 mx-10 bg-slate-300 text-lg"
          onClick={handleClickSubmit}
          disabled={productNo === ""}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
