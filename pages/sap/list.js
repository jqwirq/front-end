import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function Page() {
  const [sapList, setSapList] = useState([]);
  const [noQuery, setNoQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleNoQueryChange = (e) => {
    setNoQuery(e.target.value); // Update the input value when the user types
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    setNoQuery(noQuery); // Update noQuery with the input value
    await getSAP();
  };

  const getSAP = () => {
    fetch(
      `${API_URL}/sap-list?no=${noQuery}&limit=50&offset=0&startDate=${startDate}&endDate=${endDate}`
    ) // pass noQuery as a parameter
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setSapList(res);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    getSAP();
  }, [startDate, endDate]);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center">
          <Link
            className="text-xl hover:text-slate-300 active:text-slate-200"
            href="/"
          >
            back
          </Link>
        </div>

        <h1 className="text-5xl text-center pt-4">SAP List</h1>

        <div className="flex flex-col mt-8 pb-10 justify-center gap-6 px-2 md:px-[4%]">
          <div className="flex px-6">
            <form
              onSubmit={handleSearchSubmit}
              className="basis-full flex text-lg justify-around"
            >
              <div className="flex gap-4">
                <div>No. :</div>
                <input onChange={handleNoQueryChange} type="text" />
              </div>
              {/* <div className="flex gap-4">
                <div>Batch No. :</div>
                <input type="text" />
              </div> */}
              <div className="flex gap-2">
                <input
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartDate(value);
                  }}
                  type="date"
                />
                <div>to</div>
                <input
                  type="date"
                  onChange={(e) => {
                    const value = e.target.value;
                    setEndDate(value);
                  }}
                />
              </div>

              <button style={{ display: "none" }} type="submit">
                Submit
              </button>
            </form>
          </div>
          <div>
            {sapList.length !== 0 && (
              <table className="w-full text-center table-auto border-collapse text-lg">
                <thead className="border-b-2 border-slate-950">
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
                  {sapList.map((s) => (
                    <tr key={s._id} className="border-b border-slate-950">
                      <td>{s.no}</td>
                      <td>{s.batchNo}</td>
                      <td>{s.productNo}</td>
                      <td>{formatDateSimple(s.createdAt)}</td>
                      <td>{formatTimeDifference(s.duration)}</td>
                      <td>details</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
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
