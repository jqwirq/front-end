import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getServerSideProps(context) {
  const { params } = context;
  const { no } = params;
  const response = await fetch(API_URL + "/product/" + no);
  const responseJson = await response.json();

  return {
    props: {
      responseJson,
    },
  };
}

function YourPage({ responseJson }) {
  console.log(responseJson);
  return (
    <div className="min-h-screen max-h-screen flex flex-col">
      <div className="bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center">
        <Link
          className="text-xl hover:text-slate-300 active:text-slate-200"
          href="/product/list"
        >
          back
        </Link>
      </div>

      <h1 className="text-5xl text-center pt-4">Product Details</h1>

      <div className="grow flex flex-col gap-8 py-10 px-10 md:px-[8%] lg:px-[10%]">
        {!responseJson && (
          <div className="text-center text-5xl pb-20 grow flex justify-center items-center text-slate-400">
            Empty
          </div>
        )}
        {responseJson && (
          <>
            <div className="text-3xl flex justify-between items-center">
              <div className="">Product No</div>
              <div className="relative basis-2/3">
                <input
                  className={`w-full px-3 py-1 tracking-widest appearance-none focus:outline-none focus:ring-2`}
                  // ref={productNoRef}
                  defaultValue={responseJson.no}
                  type="text"
                  // onChange={handleInputProductNoChange}
                />
                {/* {!isProductNoValid && (
                  <div className="absolute bottom-[-18px] text-red-500 text-xs">
                    Input must number!
                  </div>
                )} */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// {products.length !== 0 && (
//           <table className="table-auto text-lg border-collapse">
//             <thead className="border-b-2 border-slate-950">
//               <tr>
//                 <th className="p-2">Product No.</th>
//                 <th className="p-2">Created At</th>
//                 <th className="p-2">Updated At</th>
//                 <th className="p-2">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {products.map((v, i) => {
//                 let createdAt = new Date(v.createdAt);
//                 let updatedAt = new Date(v.updatedAt);
//                 return (
//                   <tr
//                     className="text-center border-b border-slate-950"
//                     key={v.no}
//                   >
//                     <td className="p-2">{v.no}</td>
//                     <td className="p-2">{createdAt.toLocaleString("en-UK")}</td>
//                     <td className="p-2">{updatedAt.toLocaleString("en-UK")}</td>
//                     <td className="p-2">
//                       {/* <Modal product={v} /> */}
//                       <Link
//                         className="text-slate-600 hover:text-slate-500 active:text-slate-600"
//                         href={`/product/details/${v.no}`}
//                       >
//                         details
//                       </Link>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         )}

export default YourPage;
