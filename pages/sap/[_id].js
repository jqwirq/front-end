import Link from "next/link";
import { useState, useEffect, useRef, forwardRef } from "react";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import styles from "@/styles/sap.module.css";

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

const PrintSAPButton = ({ sap, checkedItems }) => {
  const componentRef = useRef();

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <button className='text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2'>
            print
          </button>
        )}
        content={() => componentRef.current}
      />
      <div style={{ display: "none" }}>
        <ComponentSAPToPrint
          ref={componentRef}
          sap={sap}
          checkedItems={checkedItems}
        />
      </div>
    </>
  );
};

const PrintMaterialButton = ({ material }) => {
  const componentRef = useRef();

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <button className='text-blue-500 hover:text-blue-400 underline'>
            print
          </button>
        )}
        content={() => componentRef.current}
      />
      <div style={{ display: "none" }}>
        <ComponentMaterialToPrint ref={componentRef} material={material} />
      </div>
    </>
  );
};

const ComponentMaterialToPrint = forwardRef((props, ref) => {
  const { material } = props;

  return (
    <div style={{ fontSize: "14px" }} ref={ref}>
      <div className='flex gap-4'>
        <div>
          <div>Material No</div>
          <div>Packaging</div>
          <div>Quantity</div>
          <div>Date</div>
          <div>Duration</div>
        </div>
        <div>
          <div>: {material.no}</div>
          <div>: {material.packaging}</div>
          <div>: {material.quantity} Kg</div>
          <div>: {formatDateSimple(material.startTime)}</div>
          <div>: {formatTimeDifference(material.duration)}</div>
        </div>
      </div>
      <br />
      <br />
      <div style={{ display: "flex" }}>
        <div style={{ flexBasis: "50%" }}>
          <div style={{ textAlign: "center" }}>Weighing by</div>
          <br />
          <br />
          <br />
          <br />
          <br />
          <div style={{ textAlign: "center" }}>___________</div>
        </div>
      </div>
    </div>
  );
});
ComponentMaterialToPrint.displayName = "ComponentMaterialToPrint";

const ComponentSAPToPrint = forwardRef((props, ref) => {
  const { sap, checkedItems } = props;

  return (
    <>
      {sap &&
        sap !== null &&
        sap.no !== "" &&
        sap.batchNo !== "" &&
        sap.productNo !== "" && (
          <div className={styles.printArea} ref={ref}>
            {/* <hr style={{ height: "5px", color: "black" }} /> */}
            {/* <br /> */}
            <div
              style={{
                display: "flex",
                fontSize: "8px",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div
                className='flex basis-1/2 gap-2'
                // style={{ fontSize: "8px" }}
              >
                <div className=''>
                  <div>SAP Order No.</div>
                  <div>Batch No.</div>
                  <div>Product No.</div>
                </div>
                <div className=''>
                  <div>:&nbsp;{sap.no}</div>
                  <div>:&nbsp;{sap.batchNo}</div>
                  <div>:&nbsp;{sap.productNo}</div>
                </div>
              </div>
              <div
                className='flex basis-1/2 gap-2'
                // style={{ fontSize: "8px" }}
              >
                <div className=''>
                  <div>Date</div>
                  <div>Duration</div>
                </div>
                <div className=''>
                  <div>:&nbsp;{formatDateSimple(sap.createdAt)}</div>
                  <div>:&nbsp;{formatTimeDifference(sap.duration)}</div>
                </div>
              </div>
            </div>
            <br />
            <div className={styles.tableTest}>
              <table>
                <thead>
                  <tr>
                    <th>M</th>
                    <th>Q</th>
                    <th>P</th>
                    <th>D</th>
                  </tr>
                </thead>
                <tbody>
                  {sap &&
                    sap !== null &&
                    checkedItems.map(m => (
                      <tr key={m._id}>
                        <td>{m.no}</td>
                        <td>{m.quantity} Kg</td>
                        <td>{m.packaging}</td>
                        <td>{formatTimeDifference(m.duration)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <br />
            <br />
            <div style={{ display: "flex" }}>
              <div style={{ flexBasis: "50%" }}>
                <div style={{ textAlign: "center" }}>Weighing by</div>
                <br />
                <br />
                <br />
                <br />
                <br />
                <div style={{ textAlign: "center" }}>___________</div>
              </div>
            </div>
          </div>
        )}
    </>
  );
});
ComponentSAPToPrint.displayName = "ComponentSAPToPrint";

export default function Page({ responseJson }) {
  const sap = responseJson?.sap;

  return (
    <div className='min-h-screen max-h-screen flex flex-col'>
      <div className='bg-slate-900 shrink-0 text-slate-200 basis-12 px-6 flex justify-between items-center'>
        <Link
          className='text-xl hover:text-slate-300 active:text-slate-200'
          href='/sap/list'
        >
          back
        </Link>
      </div>

      <h1 className='text-5xl text-center pt-4'>Weighing Result Details</h1>

      {!responseJson.sap && (
        <div className='text-center text-5xl pb-20 grow flex justify-center items-center text-slate-400'>
          Empty
        </div>
      )}

      {responseJson?.sap && (
        <>
          <div className='text-xl grow overflow-hidden flex flex-col pb-8 px-12'>
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
              <div>
                <div className='flex gap-8'>
                  <div>
                    <div>Date</div>
                    <div>Duration</div>
                  </div>

                  <div>
                    <div>:&nbsp;{formatDateSimple(sap.createdAt)}</div>
                    <div>
                      :&nbsp;
                      {sap.isCompleted
                        ? formatTimeDifference(sap.duration)
                        : "-"}
                    </div>
                  </div>
                </div>
                {/* <button className='mt-4 w-full py-2 px-4 bg-slate-300 hover:brightness-105'>
                  Print
                </button> */}
                <PrintModal sap={sap} />
              </div>
            </div>
            <div className='pt-6 overflow-scroll px-8'>
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
            <div className='flex justify-center mt-10'></div>
          </div>
        </>
      )}
    </div>
  );
}

function PrintModal({ sap }) {
  const [isOpen, setisOpen] = useState(false);

  const [checkedItems, setCheckedItems] = useState([]);
  const [allChecked, setAllChecked] = useState(true);

  useEffect(() => {
    if (sap && sap !== null) {
      setCheckedItems(sap.materials);
    }
  }, [sap]);

  useEffect(() => {
    // if any item is unchecked, set allChecked to false
    if (sap && sap !== null) {
      if (checkedItems.length !== sap.materials.length) {
        setAllChecked(false);
      }
      // if all items are checked, set allChecked to true
      else if (checkedItems.length === sap.materials.length) {
        setAllChecked(true);
      }
    }
  }, [checkedItems, sap]);

  const handleCheckChange = (event, item) => {
    if (event.target.checked) {
      setCheckedItems(prevItems => [...prevItems, item]);
    } else {
      setCheckedItems(prevItems => prevItems.filter(i => i._id !== item._id));
    }
  };

  const handleAllCheckChange = event => {
    setAllChecked(event.target.checked);
    if (event.target.checked && sap) {
      setCheckedItems(sap.materials);
    } else {
      setCheckedItems([]);
    }
  };

  return (
    <>
      <button
        // className={`basis-1/2 bg-slate-400 py-4 text-sm`}
        className={`mt-4 w-full py-2 px-4 bg-slate-300 hover:brightness-105`}
        onClick={() => {
          setisOpen(true);
        }}
        disabled={!sap || sap === null || !sap.isCompleted}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-6 h-6 inline-block'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z'
          />
        </svg>
        &nbsp;Result
      </button>
      {/* <button className='mt-4 w-full py-2 px-4 bg-slate-300 hover:brightness-105'>
        Print
      </button> */}

      {isOpen && (
        <div className='bg-slate-900/50 fixed inset-0 flex justify-center items-center z-10'>
          <div
            className={`p-6 max-w-[80%] flex flex-col items-center gap-8 bg-slate-100`}
          >
            <div className='text-4xl'>
              {sap && sap !== null ? (
                <>
                  <div>
                    <div className='flex gap-8 text-lg'>
                      <div className='flex gap-4'>
                        <div>
                          <div>SAPOrder No.</div>
                          <div>Batch No.</div>
                          <div>Product No.</div>
                        </div>
                        <div>
                          <div>: {sap.no}</div>
                          <div>: {sap.batchNo}</div>
                          <div>: {sap.productNo}</div>
                        </div>
                      </div>
                      <div className='flex gap-4'>
                        <div>
                          <div>Date</div>
                          <div>Duration</div>
                        </div>
                        <div>
                          <div>: {formatDate(sap.createdAt)}</div>
                          <div>: {formatTimeDifference(sap.duration)}</div>
                        </div>
                      </div>
                    </div>
                    <div className='text-lg max-h-[480px] overflow-auto'>
                      <table className='w-full text-center'>
                        <thead className=''>
                          <tr>
                            <th>
                              <input
                                className='cursor-pointer'
                                type='checkbox'
                                checked={allChecked}
                                onChange={handleAllCheckChange}
                              />
                            </th>
                            <th className='p-2'>Material No.</th>
                            <th className='p-2'>Quantity</th>
                            <th className='p-2'>Packaging</th>
                            <th className='p-2'>Duration</th>
                            <th className='p-2'>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sap.materials.length !== 0 &&
                            sap.materials.map(m => (
                              <tr key={m._id}>
                                <td>
                                  <input
                                    type='checkbox'
                                    className='cursor-pointer'
                                    checked={checkedItems.some(
                                      checkedItem => checkedItem._id === m._id
                                    )}
                                    onChange={event =>
                                      handleCheckChange(event, m)
                                    }
                                  />
                                </td>
                                <td>{m.no}</td>
                                <td>{m.quantity} Kg</td>
                                <td>{m.packaging}</td>
                                <td>{formatTimeDifference(m.duration)}</td>
                                <td>
                                  <PrintMaterialButton material={m} />
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                "Empty"
              )}
            </div>

            <div className='w-full flex justify-around'>
              {sap && sap !== null && (
                <>
                  {/* <button
                    className='text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2'
                    onClick={handlePrintSAP}
                  >
                    print
                  </button> */}
                  <PrintSAPButton sap={sap} checkedItems={checkedItems} />
                </>
              )}

              <button
                onClick={() => {
                  setisOpen(false);
                }}
                className='text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* <div style={{ display: "none" }}>
        <ComponentSAPToPrint checkedItems={checkedItems} />
      </div> */}
    </>
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

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = weekdays[date.getUTCDay()];
  const dateNumber =
    date.getUTCDate() < 10 ? "0" + date.getUTCDate() : date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day}, ${dateNumber} ${month} ${year}`;
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
