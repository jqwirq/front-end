import Link from "next/link";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
  forwardRef,
} from "react";
import { useReactToPrint } from "react-to-print";
import styles from "@/styles/sap.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WeighingProcessContext = createContext();

function useWeighingContext() {
  return useContext(WeighingProcessContext);
}

const PrintSAP = forwardRef(ComponentSAPToPrint);

export default function Page() {
  const [sap, setSAP] = useState(null);
  const [product, setProduct] = useState(null);
  const [material, setMaterial] = useState(null);
  const [products, setProducts] = useState([]);

  const [processTimeDifference, setProcessTimeDifference] = useState(0);
  const [materialTimeDifference, setMaterialTimeDifference] = useState(0);

  const [sapNo, setSapNo] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [productNo, setProductNo] = useState("");
  const [materialNo, setMaterialNo] = useState("");
  const [packaging, setPackaging] = useState("");
  const [targetQty, setTargetQty] = useState(0);
  const [tolerance, setTolerance] = useState(0);
  const [actualQuantity, setActualQuantity] = useState(0);
  const [isConnectedToScaleValue, setIsConnectedToScaleValue] = useState(false);

  const [isWeighingProcess, setIsWeighingProcess] = useState(false);
  const [productTime, setProductTime] = useState(0);
  const [isMaterialProcess, setIsMaterialProcess] = useState(false);
  const [materialTime, setMaterialTime] = useState(0);

  const [isAlert, setIsAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const sapNoRef = useRef("");
  const batchNoRef = useRef("");
  const productNoRef = useRef("");
  const materialNoRef = useRef("");
  const packagingRef = useRef("");
  const targetQtyRef = useRef(0);
  const toleranceRef = useRef(0);
  const ws = useRef(null);

  const componentSAPToPrintRef = useRef();
  const componentMaterialToPrintRef = useRef();

  const showAlert = message => {
    setIsAlert(true);
    setAlertMessage(message);
  };

  const closeAlert = () => {
    setIsAlert(false);
    setAlertMessage("");
  };

  const handlePrintMaterial = useReactToPrint({
    content: () =>
      material !== null && material.isCompleted
        ? componentMaterialToPrintRef.current
        : null,
  });

  const isMainInputEmpty = () => {
    return sapNo === "" || batchNo === "" || productNo === "";
  };

  const isMaterialInputEmpty = () => {
    return (
      materialNo === "" ||
      packaging === "" ||
      targetQty === 0 ||
      targetQty === ""
    );
  };

  const isQuantityToleranced = (tolerance, targetQty, actualQuantity) => {
    if (tolerance === 0 || targetQty === 0 || actualQuantity === 0) {
      return false;
    }

    const toleranceValue = (tolerance / 100) * targetQty;
    const lowerLimit = targetQty - toleranceValue;
    const upperLimit = targetQty + toleranceValue;

    const result = actualQuantity >= lowerLimit && actualQuantity <= upperLimit;
    return result;
  };

  function disconnectWebsocket() {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setIsConnectedToScaleValue(false);
    }
  }

  function connectWebSocket(url) {
    disconnectWebsocket(); // Disconnect any existing WebSocket connection
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      // console.log(`Connected to WebSocket server at ${url}`);
      setIsConnectedToScaleValue(true);
    };

    ws.current.onmessage = message => {
      const qty = parseFloat(message.data);
      setActualQuantity(qty);

      const isToleranced = isQuantityToleranced(tolerance, targetQty, qty);

      if (!isToleranced) {
        fetch("http://127.0.0.1:1880" + "/api/light-signal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ signal: "merah" }),
        })
          .then(res => {
            showAlert("The weight is out of tolerance!");
            return res.json();
          })
          .then(res => console.log(res))
          .catch(err => console.error(err));
      }
    };

    ws.current.onerror = error => {
      console.error(error);
    };

    ws.current.onclose = event => {
      // console.log(`Disconnected from WebSocket server at ${url}`);
    };
  }

  useEffect(() => {
    if (ws.current) {
      ws.current.onmessage = message => {
        const qty = parseFloat(message.data);
        setActualQuantity(qty);

        const isToleranced = isQuantityToleranced(tolerance, targetQty, qty);

        if (!isToleranced) {
          fetch("http://127.0.0.1:1880" + "/api/light-signal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ signal: "merah" }),
          })
            .then(res => {
              showAlert("The weight is out of tolerance!");
              return res.json();
            })
            .then(res => console.log(res))
            .catch(err => console.error(err));
        }
      };
    }
  }, [actualQuantity, tolerance, targetQty]);

  const handleStartWeighingProcess = async () => {
    try {
      const response = await fetch(API_URL + "/weighing-process/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          no: sapNo,
          batchNo,
          productNo,
        }),
      });
      const responseJson = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          console.error(responseJson.message);
          return;
        } else if (response.status === 404) {
          console.error(responseJson.message);
          return;
        } else if (response.status === 409) {
          console.error(responseJson.message);
          return;
        } else {
          return;
        }
      }

      setMaterial(null);
      setSAP(responseJson.process);
      setIsWeighingProcess(true);
    } catch (err) {
      err => console.error(err);
    }
  };

  // useEffect(() => {
  //   console.log(sap);
  // }, [sap]);

  const handleStopWeighingProcess = async () => {
    try {
      const response = await fetch(API_URL + "/weighing-process/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sap._id,
          endTime: +new Date(),
        }),
      });
      const responseJson = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          console.error(responseJson.message);
          return;
        } else if (response.status === 404) {
          console.error(responseJson.message);
          return;
        } else if (response.status === 409) {
          console.error(responseJson.message);
          return;
        } else {
          return;
        }
      }

      setSAP(responseJson.SAP);
      setProduct(null);
      resetMain();
      setIsWeighingProcess(false);
      setProductTime(0);
    } catch (err) {
      err => console.error(err);
    }
  };

  const handleStartMaterialWeighing = async () => {
    try {
      const response = await fetch(API_URL + "/material-weighing/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sap._id,
          materialNo,
          packaging,
        }),
      });
      const responseJson = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          console.error(responseJson.message);
          return;
        } else if (response.status === 404) {
          console.error(responseJson.message);
          return;
        } else if (response.status === 409) {
          console.error(responseJson.message);
          return;
        } else {
          return;
        }
      }

      setMaterial(responseJson.material);
      setIsMaterialProcess(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStopMaterialWeighing = async () => {
    try {
      if (!isQuantityToleranced(tolerance, targetQty, actualQuantity)) {
        console.error("The weight is out of tolerance!");
        showAlert("The weight is out of tolerance!");
        return;
      }

      const response = await fetch(API_URL + "/material-weighing/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sap._id,
          materialId: material._id,
          quantity: actualQuantity,
          endTime: Date.now(),
        }),
      });
      const responseJson = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          console.error(responseJson.message);
          return;
        } else if (response.status === 404) {
          console.error(responseJson.message);
          return;
        } else if (response.status === 409) {
          console.error(responseJson.message);
          return;
        } else {
          return;
        }
      }

      // console.log(responseJson);
      disconnectWebsocket();
      setMaterial(responseJson.material);
      resetMaterial();
      setIsMaterialProcess(false);
      setMaterialTime(0);
      setActualQuantity(0);
    } catch (error) {
      console.error(error);
    }
  };

  const resetMain = () => {
    sapNoRef.current.value = "";
    setSapNo("");
    batchNoRef.current.value = "";
    setBatchNo("");
    productNoRef.current.value = "";
    setProductNo("");
    materialNoRef.current.value = "";
    setMaterialNo("");
    packagingRef.current.value = "";
    setPackaging("");
    targetQtyRef.current.value = "";
    setTargetQty(0);
    toleranceRef.current.value = "";
    setTolerance(0);
  };

  const resetMaterial = () => {
    materialNoRef.current.value = "";
    setMaterialNo("");
    packagingRef.current.value = "";
    setPackaging("");
    targetQtyRef.current.value = "";
    setTargetQty(0);
    toleranceRef.current.value = "";
    setTolerance(0);
  };

  useEffect(() => {
    fetch(API_URL + "/products")
      .then(res => {
        return res.json();
      })
      .then(res => {
        // console.log("setProducts, useEffect[]", res);
        setProducts(res);
      })
      .catch(err => console.error(err));

    return () => {
      disconnectWebsocket();
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isWeighingProcess) {
      interval = setInterval(() => {
        const now = Date.now();
        setProductTime(now - sap.startTime);
      }, 100);
    } else if (!isWeighingProcess) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isWeighingProcess]);

  // useEffect(() => {
  //   console.log(productTime);
  // }, [productTime]);

  useEffect(() => {
    let interval;
    if (isMaterialProcess) {
      interval = setInterval(() => {
        const now = Date.now();
        setMaterialTime(now - material.startTime);
      }, 100);
    } else if (!isMaterialProcess) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isMaterialProcess]);

  // useEffect(() => {
  //   if (actualQuantity !== 0) {
  //     isQuantityToleranced();
  //   }
  // }, [actualQuantity, tolerance]);

  // useEffect(() => {
  //   console.log("setProduct, useEffect[product]", product);
  // }, [product]);

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

  // useEffect(() => {
  //   if (sapNo !== "") {
  //     console.log("setMainValue, useEffect[formValue]", sapNo);
  //   }
  // }, [sapNo, batchNo, productNo]);

  const value = {
    sap,
    setSAP,
    product,
    setProduct,
    products,
    material,
    setMaterial,
    isWeighingProcess,
    setIsWeighingProcess,
    isMaterialProcess,
    setIsMaterialProcess,
    sapNoRef,
    batchNoRef,
    productNoRef,
    materialNoRef,
    packagingRef,
    targetQtyRef,
    toleranceRef,
    isMainInputEmpty,
    productTime,
    setProductTime,
    materialTime,
    setMaterialTime,
    resetMain,
    resetMaterial,
    sapNo,
    setSapNo,
    batchNo,
    setBatchNo,
    productNo,
    setProductNo,
    materialNo,
    setMaterialNo,
    packaging,
    setPackaging,
    targetQty,
    setTargetQty,
    tolerance,
    setTolerance,
    actualQuantity,
    setActualQuantity,
    isMaterialInputEmpty,
    handleStartWeighingProcess,
    handleStopWeighingProcess,
    handleStartMaterialWeighing,
    handleStopMaterialWeighing,
    isConnectedToScaleValue,
    setIsConnectedToScaleValue,
    connectWebSocket,
    isQuantityToleranced,
    componentSAPToPrintRef,
    componentMaterialToPrintRef,
    handlePrintMaterial,
  };

  return (
    <WeighingProcessContext.Provider value={value}>
      <div className='bg-slate-100 min-h-screen'>
        <div className='min-h-screen max-h-screen flex flex-col'>
          <div className='bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center'>
            <div
              className={`text-xl ${
                !isWeighingProcess
                  ? "hover:text-slate-300 active:text-slate-200"
                  : "cursor-default text-slate-600"
              }`}
            >
              {!isWeighingProcess && (
                <Link href='/' disabled={isWeighingProcess}>
                  back
                </Link>
              )}
              {isWeighingProcess && "back"}
            </div>

            <h1 className='tracking-widest font-semibold text-xl'>
              Weighing Process
            </h1>
          </div>

          <div
            className='grow grid grid-cols-10 grid-rows-6 gap-4 px-2 md:px-[1%] lg:px-[3%] py-2 text-2xl'
            style={{
              gridTemplateRows: "1fr 1fr .8fr .4fr .9fr .9fr",
              gridTemplateColumns:
                "1fr 1fr 1fr 1fr 1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr",
            }}
          >
            <FormWeighing />

            <ScaleSelectButton />

            <Timers />

            <StartButton />

            <div className='col-start-7 col-end-13 row-start-4 row-end-5 flex justify-around items-center gap-2 text-base px-2'>
              <button
                className={`basis-1/2 py-4 text-sm ${
                  !material || material === null || !material.isCompleted
                    ? "bg-slate-400 brightness-90 text-slate-700"
                    : "bg-slate-300 hover:brightness-105 active:brightness-90 cursor-pointer"
                }`}
                onClick={() => {
                  if (material && material !== null && material.isCompleted) {
                    handlePrintMaterial();
                  } else {
                    console.error("Empty data");
                  }
                }}
                disabled={
                  !material || material === null || !material.isCompleted
                }
              >
                Print material receipt
              </button>

              <PrintSAPComponent />
            </div>

            <Weight />
          </div>
        </div>
      </div>

      {isAlert && (
        <div className='bg-slate-900/50 fixed inset-0 flex justify-center items-center'>
          <div
            className={`p-6 max-w-[80%] flex flex-col items-center gap-8 bg-slate-200`}
          >
            <div className='text-4xl'>{alertMessage}</div>

            <button
              onClick={closeAlert}
              className='text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </WeighingProcessContext.Provider>
  );
}

function PrintSAPComponent() {
  const { sap, componentSAPToPrintRef } = useWeighingContext();
  const [isOpen, setisOpen] = useState(false);

  const [checkedItems, setCheckedItems] = useState([]);
  const [allChecked, setAllChecked] = useState(true);

  const handlePrintSAP = useReactToPrint({
    content: () =>
      sap && sap !== null && sap.isCompleted
        ? componentSAPToPrintRef.current
        : null,
  });

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
        className={`basis-1/2 py-4 text-sm ${
          !sap || sap === null || !sap.isCompleted
            ? "bg-slate-400 brightness-90 text-slate-700"
            : "bg-slate-300 hover:brightness-105 active:brightness-90"
        }`}
        onClick={() => {
          setisOpen(true);
        }}
        disabled={!sap || sap === null || !sap.isCompleted}
      >
        Print sap receipt
      </button>

      {isOpen && (
        <div className='bg-slate-900/50 fixed inset-0 flex justify-center items-center'>
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
                    <div className='text-lg'>
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
                <button
                  className='text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2'
                  onClick={handlePrintSAP}
                >
                  print
                </button>
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
      <div style={{ display: "none" }}>
        <ComponentSAPToPrint checkedItems={checkedItems} />
      </div>
    </>
  );
}

function Weight() {
  const { actualQuantity, isConnectedToScaleValue, targetQty, tolerance } =
    useWeighingContext();

  return (
    <div className='col-start-5 col-end-13 row-start-5 row-end-7 flex flex-col justify-center items-center px-2 gap-4'>
      <div
        className={`text-8xl font-bold w-full p-4 text-center ${
          isConnectedToScaleValue
            ? "bg-yellow-200 text-black"
            : "bg-yellow-300 brightness-50 text-neutral-500"
        }`}
      >
        {actualQuantity.toFixed(2)} Kg
      </div>

      <div className='flex justify-center text-3xl text-center gap-4 w-full'>
        <div className='bg-slate-500 text-slate-50 basis-1/2 py-2 px-4'>
          {/* {isConnectedToScaleValue
            ? "- " +
              (targetQty - targetQty * (tolerance / 100)).toFixed(2) +
              " Kg"
            : "..."} */}
          {"- " +
            (targetQty - targetQty * (tolerance / 100)).toFixed(2) +
            " Kg"}
        </div>
        <div className='bg-slate-500 text-slate-50 basis-1/2 py-2 px-4'>
          {/* {isConnectedToScaleValue
            ? "+ " +
              (targetQty + targetQty * (tolerance / 100)).toFixed(2) +
              " Kg"
            : "..."} */}
          {"+ " +
            (targetQty + targetQty * (tolerance / 100)).toFixed(2) +
            " Kg"}
        </div>
      </div>
    </div>
  );
}

function Timers() {
  const { productTime, materialTime, isWeighingProcess, isMaterialProcess } =
    useWeighingContext();

  return (
    <div className='col-start-7 col-end-13 row-start-1 row-end-3 flex flex-col justify-center items-center gap-2'>
      <div className='flex flex-col items-center'>
        <div className='text-lg'>Total Weighing Time</div>
        <div
          className={` text-center py-2 px-8 text-7xl ${
            isWeighingProcess
              ? "bg-black text-white"
              : "bg-neutral-800 text-neutral-400"
          }`}
        >
          <span>
            {("0" + Math.floor((productTime / 60000) % 60)).slice(-2)}:
          </span>
          <span>{("0" + Math.floor((productTime / 1000) % 60)).slice(-2)}</span>
        </div>
      </div>

      <div className='flex flex-col items-center'>
        <div className='text-lg'>Material Weighing Time</div>
        <div
          className={`bg-black text-center py-2 px-8 text-7xl ${
            isMaterialProcess
              ? "bg-black text-white"
              : "bg-neutral-800 text-neutral-400"
          }`}
        >
          <span>
            {("0" + Math.floor((materialTime / 60000) % 60)).slice(-2)}:
          </span>
          <span>
            {("0" + Math.floor((materialTime / 1000) % 60)).slice(-2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function StartButton() {
  const {
    isWeighingProcess,
    setIsWeighingProcess,
    isMainInputEmpty,
    isMaterialInputEmpty,
    isMaterialProcess,
    setIsMaterialProcess,
    resetMain,
    resetMaterial,
    setProductTime,
    setMaterialTime,
    setProduct,
    handleStartWeighingProcess,
    handleStopWeighingProcess,
    handleStartMaterialWeighing,
    handleStopMaterialWeighing,
  } = useWeighingContext();

  return (
    <div className='px-2 col-start-7 col-end-13 row-start-3 row-end-4 flex justify-center items-center gap-4 text-xl'>
      {isMaterialProcess ? (
        <button
          onClick={handleStopMaterialWeighing}
          className={`basis-1/2 text-white py-4 ${
            false ? "bg-red-700" : "bg-red-600 hover:bg-red-500 "
          }`}
          // disabled if weight is still out of tolerance
          disabled={false}
        >
          Stop material
        </button>
      ) : (
        <button
          onClick={handleStartMaterialWeighing}
          disabled={
            isMaterialProcess || !isWeighingProcess || isMaterialInputEmpty()
          }
          className={`basis-1/2 text-white py-4 ${
            isMaterialProcess || !isWeighingProcess || isMaterialInputEmpty()
              ? "bg-green-900 text-neutral-500/80"
              : "bg-green-600 hover:bg-green-500 "
          }`}
        >
          Start material
        </button>
      )}

      {isWeighingProcess ? (
        <button
          onClick={handleStopWeighingProcess}
          className={`basis-1/2 text-white py-4 ${
            isMaterialProcess || isMainInputEmpty()
              ? "bg-red-700 text-neutral-300"
              : "bg-red-600 hover:bg-red-500 "
          }`}
          disabled={isMaterialProcess}
        >
          Stop product
        </button>
      ) : (
        <button
          onClick={handleStartWeighingProcess}
          disabled={isWeighingProcess || isMainInputEmpty()}
          className={`basis-1/2 text-white py-4 ${
            isWeighingProcess || isMainInputEmpty()
              ? "bg-green-900 text-neutral-500/80"
              : "bg-green-600 hover:bg-green-500 "
          }`}
        >
          Start product
        </button>
      )}
    </div>
  );
}

function ScaleSelectButton() {
  const { connectWebSocket, isMaterialProcess } = useWeighingContext();
  return (
    <div className='col-start-1 col-end-5 row-start-5 pb-8 row-end-7 flex flex-col justify-center items-center gap-4 text-4xl'>
      <div className='flex w-full gap-4 justify-center items-center'>
        <button
          onClick={() => connectWebSocket("ws://127.0.0.1:1880/ws/2ton")}
          className={`basis-1/2 py-2 border-4 border-slate-600 ${
            !isMaterialProcess
              ? "bg-slate-400 text-slate-700"
              : "cursor-pointer bg-slate-300 hover:brightness-105 active:brightness-90"
          }`}
          disabled={!isMaterialProcess}
        >
          2 Ton
        </button>

        <button
          onClick={() => connectWebSocket("ws://127.0.0.1:1880/ws/350tscale")}
          className={`basis-1/2 py-2 border-4 border-slate-600 ${
            !isMaterialProcess
              ? "bg-slate-400 text-slate-700"
              : "cursor-pointer bg-slate-300 hover:brightness-105 active:brightness-90"
          }`}
          disabled={!isMaterialProcess}
        >
          350 T
        </button>
      </div>
      <div className='flex w-full gap-4 justify-center items-center'>
        <button
          onClick={() => connectWebSocket("ws://127.0.0.1:1880/ws/350jic")}
          className={`basis-1/2 py-2 border-4 border-slate-600 ${
            !isMaterialProcess
              ? "bg-slate-400 text-slate-700"
              : "cursor-pointer bg-slate-300 hover:brightness-105 active:brightness-90"
          }`}
          disabled={!isMaterialProcess}
        >
          350 J
        </button>

        <button
          onClick={() => connectWebSocket("ws://127.0.0.1:1880/ws/2kg")}
          className={`basis-1/2 py-2 border-4 border-slate-600 ${
            !isMaterialProcess
              ? "bg-slate-400 text-slate-700"
              : "cursor-pointer bg-slate-300 hover:brightness-105 active:brightness-90"
          }`}
          disabled={!isMaterialProcess}
        >
          2 Kg
        </button>
      </div>
    </div>
  );
}

function FormWeighing() {
  const {
    products,
    product,
    setProduct,
    sapNoRef,
    batchNoRef,
    productNoRef,
    materialNoRef,
    packagingRef,
    targetQtyRef,
    toleranceRef,
    setSapNo,
    setBatchNo,
    setProductNo,
    setMaterialNo,
    setPackaging,
    setTargetQty,
    setTolerance,
    isWeighingProcess,
    isMaterialProcess,
  } = useWeighingContext();

  const timeoutRef = useRef(null);
  const handleProductChange = e => {
    clearTimeout(timeoutRef.current);
    const targetValue = e.target.value;
    setProductNo(targetValue);

    if (targetValue) {
      timeoutRef.current = setTimeout(() => {
        fetch(API_URL + "/product/" + targetValue)
          .then(res => {
            if (!res.ok) {
              // if HTTP status is not 200-299
              if (res.status === 400) {
                console.error("Bad request");
                // Handle 400 error
              } else if (res.status === 404) {
                console.error("No product found with this ID");
                // Handle 404 error
              } else {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
            } else {
              return res.json();
            }
          })
          .then(res => {
            if (res) {
              // if res is not undefined
              setProduct(res);
              // console.log("handleProductChange", res);
              materialNoRef.current.value = "";
            }
          })
          .catch(e =>
            console.error(
              "There was a problem with the fetch operation: " + e.message
            )
          );
      }, 1000);
    } else {
      setProduct(null);
    }
  };

  return (
    <div className='col-span-6 row-span-4 flex flex-col gap-4 text-xl justify-center'>
      <div className='flex justify-between items-center'>
        <div>SAP Order No.</div>
        <input
          ref={sapNoRef}
          onChange={() => {
            const no = sapNoRef.current.value;
            setSapNo(no);
          }}
          className={`w-[55%] p-1 pl-4 text-2xl outline-none ring-4 ring-yellow-400 focus:ring-yellow-300 ${
            isWeighingProcess
              ? "bg-yellow-200 brightness-75 text-neutral-600"
              : "bg-yellow-200"
          }`}
          type='text'
          disabled={isWeighingProcess}
        />
      </div>

      <div className='flex justify-between items-center'>
        <div>Batch No.</div>
        <input
          ref={batchNoRef}
          onChange={() => {
            const no = batchNoRef.current.value;
            setBatchNo(no);
          }}
          className={`w-[55%] p-1 pl-4 text-2xl outline-none ring-4 ring-yellow-400 focus:ring-yellow-300 ${
            isWeighingProcess
              ? "bg-yellow-200 brightness-75 text-neutral-600"
              : "bg-yellow-200"
          }`}
          type='text'
          disabled={isWeighingProcess}
        />
      </div>

      <div className='flex justify-between items-center'>
        <div>Product No.</div>
        <input
          ref={productNoRef}
          onChange={handleProductChange}
          className={`w-[55%] p-1 pl-4 text-2xl outline-none ring-4 ring-yellow-400 focus:ring-yellow-300 ${
            isWeighingProcess
              ? "bg-yellow-200 brightness-75 text-neutral-600"
              : "bg-yellow-200"
          }`}
          disabled={isWeighingProcess}
          list='productsNo'
        />
        <datalist id='productsNo'>
          {products.length !== 0 &&
            products.map(v => (
              <option key={v._id} value={v.no}>
                {v.no}
              </option>
            ))}
        </datalist>
      </div>

      <div className='flex justify-between items-center'>
        <div>Material No.</div>
        <select
          className={`w-[55%] p-1 pl-4 text-2xl outline-none ring-4 ring-yellow-400 focus:ring-yellow-300 ${
            isMaterialProcess
              ? "bg-yellow-200 brightness-90"
              : "bg-yellow-200 cursor-pointer"
          }`}
          disabled={isMaterialProcess}
          defaultValue={""}
          onChange={() => {
            const no = materialNoRef.current.value;
            setMaterialNo(no);
          }}
          ref={materialNoRef}
        >
          <option disabled value=''></option>
          {product !== null &&
            product.materials.map(v => (
              <option key={v._id} value={v.no}>
                {v.no}
              </option>
            ))}
        </select>
      </div>

      <div className='flex justify-between items-center'>
        <div>Packaging</div>
        <select
          disabled={isMaterialProcess}
          ref={packagingRef}
          className={`w-[55%] p-1 pl-4 text-2xl outline-none ring-4 ring-yellow-400 focus:ring-yellow-300 ${
            isMaterialProcess
              ? "bg-yellow-200 brightness-90"
              : "bg-yellow-200 cursor-pointer"
          }`}
          onChange={e => {
            const value = e.target.value;
            setPackaging(value);
          }}
        >
          <option value=''></option>
          <option value='Sak'>Sak</option>
          <option value='Pail'>Pail</option>
          <option value='Drum'>Drum</option>
          <option value='IBC'>IBC</option>
          <option value='Botol 250mL-1000mL'>Botol 250mL-1000mL</option>
        </select>
      </div>

      <div className='flex justify-between items-center'>
        <div>Target Qty. (Kg)</div>
        <input
          disabled={isMaterialProcess}
          ref={targetQtyRef}
          className='w-[55%] bg-yellow-200 p-1 pl-4 text-2xl outline-none ring-4 ring-yellow-400 focus:ring-yellow-300'
          type='number'
          onChange={e => {
            const value = e.target.valueAsNumber;
            if (isNaN(value)) {
              setTargetQty(0);
            } else {
              setTargetQty(value);
            }
          }}
        />
      </div>

      <div className='flex justify-between items-center'>
        <div>Tolerance (%)</div>
        <input
          disabled={isMaterialProcess}
          ref={toleranceRef}
          className='w-[55%] bg-yellow-200 p-1 pl-4 text-2xl outline-none ring-4 ring-yellow-400 focus:ring-yellow-300'
          type='number'
          onChange={e => {
            const value = e.target.valueAsNumber;
            if (isNaN(value)) {
              setTolerance(0);
            } else {
              setTolerance(value);
            }
          }}
        />
      </div>
    </div>
  );
}

function ComponentSAPToPrint(props, ref) {
  const { componentSAPToPrintRef, sap, componentMaterialToPrintRef, material } =
    useWeighingContext();

  return (
    <>
      {sap &&
        sap !== null &&
        sap.no !== "" &&
        sap.batchNo !== "" &&
        sap.productNo !== "" && (
          <div className={styles.printArea} ref={componentSAPToPrintRef}>
            {/* <hr style={{ height: "5px", color: "black" }} /> */}
            {/* <br /> */}
            <div
              style={{
                display: "flex",
                fontSize: "9px",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div className='flex basis-1/2 gap-2'>
                <div className=''>
                  <div>SAP</div>
                  <div>Batch No</div>
                  <div>Product No</div>
                </div>
                <div className=''>
                  <div>:&nbsp;{sap.no}</div>
                  <div>:&nbsp;{sap.batchNo}</div>
                  <div>:&nbsp;{sap.productNo}</div>
                </div>
              </div>
              <div className='flex basis-1/2 gap-2'>
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
                    props.checkedItems.map(m => (
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
            {/* <div style={{ textAlign: "center", overflow: "hidden" }}>
            -------------------------------------------------------------------------------
          </div> */}
          </div>
        )}

      {material !== null && (
        <>
          <div style={{ fontSize: "14px" }} ref={componentMaterialToPrintRef}>
            <div className='flex gap-4'>
              <div>
                <div>Material No</div>
                <div>Packaging</div>
                <div>Date</div>
                <div>Duration</div>
              </div>
              <div>
                <div>: {material.no}</div>
                {/* <div>: {material.packaging}</div> */}
                <div>: Botol 250mL-1000mL</div>
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
        </>
      )}
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

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const options = {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
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
