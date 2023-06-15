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
          href='/sap/list'
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
          <div className='text-2xl grow flexpt-8 px-12'>
            <div className='flex justify-around pt-8'>
              <div className='flex gap-8'>
                <div className='flex flex-col gap-2'>
                  <div>SAP Order No.</div>
                  <div>Batch No.</div>
                  <div>Product No.</div>
                </div>

                <div className='flex flex-col gap-2'>
                  <div>:&nbsp;{sap.no}</div>
                  <div>:&nbsp;{sap.batchNo}</div>
                  <div>:&nbsp;{sap.productNo}</div>
                </div>
              </div>
              <div className='flex gap-8'>
                <div>
                  <div>Date</div>
                  <div>Duration</div>
                </div>

                <div>
                  <div>:&nbsp;{formatDateSimple(sap.createdAt)}</div>
                  <div>
                    :&nbsp;
                    {sap.isCompleted ? formatTimeDifference(sap.duration) : "-"}
                  </div>
                </div>
              </div>
            </div>
            <div className='pt-6 px-8'>
              <table className='w-full text-center'>
                <thead className='border-t-2 border-slate-950'>
                  <tr className='border-b-2 border-slate-950'>
                    <th className='p-2'>Material</th>
                    <th className='p-2'>Quantity</th>
                    <th className='p-2'>Packaging</th>
                    <th className='p-2'>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {responseJson?.sap?.materials?.map(s => (
                    <tr key={s._id} className='border-b border-slate-950'>
                      <td className='p-2'>{s.no}</td>
                      <td className='p-2'>{s.quantity} Kg.</td>
                      <td className='p-2'>{s.packaging}</td>
                      <td className='p-2'>
                        {formatTimeDifference(s.duration)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatDateSimple(timestamp) {
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear()).slice(-2);

  return `${day}-${month}-${year}`;
}

function formatTimeDifference(duration) {
  // Convert duration from milliseconds to seconds
  const difference = duration / 1000;

  const hours = Math.floor(difference / 3600);
  const minutes = Math.floor((difference % 3600) / 60);
  const seconds = Math.floor(difference % 60);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  if (hours === 0) {
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
