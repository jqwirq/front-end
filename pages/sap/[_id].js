import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getServerSideProps(context) {
  const { params } = context;
  const { _id } = params;
  const response = await fetch(API_URL + "/sap/" + _id);
  const responseJson = await response.json();

  return {
    props: {
      responseJson,
    },
  };
}

export default function Page({ responseJson }) {
  const sap = responseJson?.sap;

  return (
    <div className='min-h-screen max-h-screen flex flex-col'>
      <div className='bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center'>
        <Link
          className='text-xl hover:text-slate-300 active:text-slate-200'
          href='/product/list'
        >
          back
        </Link>
      </div>

      <h1 className='text-5xl text-center pt-4'>SAP Details</h1>

      {!responseJson.sap && (
        <div className='text-center text-5xl pb-20 grow flex justify-center items-center text-slate-400'>
          Empty
        </div>
      )}

      {responseJson?.sap && (
        <>
          <div className='text-3xl flex pt-8'>test</div>
        </>
      )}
    </div>
  );
}
