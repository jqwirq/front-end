import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DATA_LIMIT = 2;

function Page() {
  const [sapList, setSapList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageNumbers, setPageNumbers] = useState([]);
  const [noQuery, setNoQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearchSubmit = e => {
    e.preventDefault();

    const no = e.target[0].value;
    const start = e.target[1].value;
    const end = e.target[2].value;

    setNoQuery(no);
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);

    getSAP(no, start, end, 1);
  };

  const getSAP = (
    no = noQuery,
    start = startDate,
    end = endDate,
    page = currentPage
  ) => {
    fetch(
      `${API_URL}/sap-list?no=${no}&limit=${DATA_LIMIT}&offset=${
        (page - 1) * DATA_LIMIT
      }&startDate=${start}&endDate=${end}`
    )
      .then(res => res.json())
      .then(res => {
        console.log(res);
        setSapList(res.data);
        const newTotalPages = Math.ceil(res.total / DATA_LIMIT);
        setTotalPages(newTotalPages);

        const newPageNumbers = [];
        for (
          let i = Math.max(1, page - 2);
          i <= Math.min(page + 2, newTotalPages);
          i++
        ) {
          newPageNumbers.push(i);
        }
        setPageNumbers(newPageNumbers);
      })
      .catch(err => {
        console.error(err);
      });
  };

  useEffect(() => {
    getSAP();
  }, [currentPage]);

  useEffect(() => {
    getSAP();
  }, [noQuery, startDate, endDate]);

  return (
    <>
      <div className='min-h-screen flex flex-col'>
        <div className='bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center'>
          <Link
            className='text-xl hover:text-slate-300 active:text-slate-200'
            href='/'
          >
            back
          </Link>
        </div>

        <h1 className='text-5xl text-center pt-4'>SAP List</h1>

        <div className='flex px-6 mt-6'>
          <form
            onSubmit={handleSearchSubmit}
            className='basis-full flex text-lg justify-around'
          >
            <div className='flex gap-4'>
              <div>No. :</div>
              <input type='text' />
            </div>
            {/* <div className="flex gap-4">
                <div>Batch No. :</div>
                <input type="text" />
              </div> */}
            <div className='flex gap-2'>
              <input
                onChange={e => {
                  const value = e.target.value;
                  setStartDate(value);
                }}
                type='date'
              />
              <div>to</div>
              <input
                type='date'
                onChange={e => {
                  const value = e.target.value;
                  setEndDate(value);
                }}
              />
            </div>

            <button style={{ display: "none" }} type='submit'>
              Submit
            </button>
          </form>
        </div>
        <div className='flex flex-col mt-8 grow gap-6 px-2 md:px-[4%]'>
          <div>
            {sapList.length === 0 && (
              <div className='text-center mt-40 text-slate-400 text-3xl'>
                empty data
              </div>
            )}
            {sapList.length !== 0 && (
              <>
                <table className='w-full text-center table-auto border-collapse text-lg'>
                  <thead className='border-b-2 border-slate-950'>
                    <tr>
                      <th>SAP Order No.</th>
                      <th>Batch No.</th>
                      <th>Product No.</th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sapList.map(s => (
                      <tr key={s._id} className='border-b border-slate-950'>
                        <td className='py-[6px]'>{s.no}</td>
                        <td className='py-[6px]'>{s.batchNo}</td>
                        <td className='py-[6px]'>{s.productNo}</td>
                        <td className='py-[6px]'>
                          {formatDateSimple(s.createdAt)}
                        </td>
                        <td className='py-[6px]'>
                          {formatTimeDifference(s.duration)}
                        </td>
                        <td className='py-[6px]'>
                          <Link
                            className='text-slate-500 hover:text-slate-700'
                            href={`/sap/${s._id}`}
                          >
                            details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {sapList.length !== 0 && (
            <div className='text-lg flex justify-center gap-4'>
              {pageNumbers.map(number => (
                <PageButton
                  key={number}
                  number={number}
                  currentPage={currentPage}
                  onPageChange={num => {
                    setCurrentPage(num);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function PageButton({ number, currentPage, onPageChange }) {
  return (
    <button
      style={{ fontWeight: number === currentPage ? "bold" : "normal" }}
      onClick={() => onPageChange(number)}
    >
      {number}
    </button>
  );
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

export default Page;
