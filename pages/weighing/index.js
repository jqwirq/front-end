import Link from "next/link";
import { useState, useEffect, createContext, useContext, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const WeighingProcessContext = createContext();

function useWeighingContext() {
  return useContext(WeighingProcessContext);
}

export default function Page() {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [sap, setSAP] = useState(null);

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

  const sapNoRef = useRef("");
  const batchNoRef = useRef("");
  const productNoRef = useRef("");
  const materialNoRef = useRef("");
  const packagingRef = useRef("");
  const targetQtyRef = useRef(0);
  const toleranceRef = useRef(0);

  const [data, setData] = useState("");
  const [eventSource, setEventSource] = useState(null);

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
      setSAP(responseJson.SAP);
      console.log(responseJson);

      setIsWeighingProcess(true);
    } catch (err) {
      (err) => console.error(err);
    }
  };

  useEffect(() => {
    console.log(sap);
  }, [sap]);

  const handleStopWeighingProcess = async () => {
    try {
      const response = await fetch(API_URL + "/weighing-process/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sap._id,
        }),
      });
      const responseJson = await response.json();
      console.log(responseJson);

      setSAP(null);
      setProduct(null);
      resetMain();
      setIsWeighingProcess(false);
      setProductTime(0);
    } catch (err) {
      (err) => console.error(err);
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
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        console.log("setProducts, useEffect[]", res);
        setProducts(res);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let interval;
    if (isWeighingProcess) {
      interval = setInterval(() => {
        setProductTime((prevTime) => prevTime + 100);
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
        setMaterialTime((prevTime) => prevTime + 100);
      }, 100);
    } else if (!isMaterialProcess) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isMaterialProcess]);

  const handleSelectSSE = () => {
    fetch(API_URL + "/weighing/start-tcp/3005")
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
    // if (!eventSource) {
    //   const es = new EventSource(API_URL + "/weighing");
    //   setEventSource(es);
    //   es.onmessage = (event) => {
    //     setData(event.data);
    //   };
    //   es.onerror = (err) => {
    //     console.error("EventSource failed:", err);
    //     es.close();
    //     setEventSource(null);
    //   };
    // }
  };

  const handleCloseTCP = () => {
    fetch(API_URL + "/weighing/stop-tcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        port: 3005,
      }),
    })
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  };

  // const handleBeforeUnload = (event) => {
  //   event.preventDefault();
  //   handleCloseTCP();
  // };

  // useEffect(() => {
  //   // Add beforeunload event listener when component is mounted
  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     // Remove beforeunload event listener when component is unmounted
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //     handleCloseTCP();
  //   };
  // }, []);

  // useEffect(() => {
  //   return () => {
  //     if (eventSource) {
  //       eventSource.close();
  //     }
  //   };
  // }, [eventSource]);

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
    products,
    product,
    setProduct,
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
    handleSelectSSE,
    handleCloseTCP,
    handleStartWeighingProcess,
    handleStopWeighingProcess,
    isConnectedToScaleValue,
    setIsConnectedToScaleValue,
  };

  return (
    <WeighingProcessContext.Provider value={value}>
      <div className="bg-slate-100 min-h-screen">
        <div className="min-h-screen max-h-screen flex flex-col">
          <div className="bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center">
            <Link
              className="text-xl hover:text-slate-300 active:text-slate-200"
              href="/"
            >
              back
            </Link>

            <h1 className="tracking-widest font-semibold text-xl">
              Weighing Process
            </h1>
          </div>

          <div
            className="grow grid grid-cols-10 grid-rows-6 gap-4 px-2 md:px-[1%] lg:px-[3%] py-2 text-2xl"
            style={{
              gridTemplateRows: "1fr 1fr .4fr .6fr 1fr 1fr",
              gridTemplateColumns:
                "1fr 1fr 1fr 1fr 1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr",
            }}
          >
            <FormWeighing />

            <ScaleSelectButton />

            <Timers />

            <StartButton />

            <Weight eventSource={eventSource} data={data} />
          </div>
        </div>
      </div>
    </WeighingProcessContext.Provider>
  );
}

function Weight({ eventSource, data }) {
  const { actualQuantity, isConnectedToScaleValue, tolerance } =
    useWeighingContext();

  return (
    <div className="col-start-5 col-end-13 row-start-5 row-end-7 flex flex-col justify-start items-center px-2 pt-6 gap-4">
      <div className="text-8xl bg-yellow-200 font-bold w-full p-4 text-center">
        {actualQuantity.toFixed(2)} Kg
      </div>

      <div className="flex justify-center text-3xl text-center gap-4 w-full">
        <div className="bg-slate-500 text-slate-50 basis-1/2 py-2 px-4">
          {isConnectedToScaleValue
            ? "- " +
              (actualQuantity - actualQuantity * (tolerance / 100)).toFixed(2) +
              " Kg"
            : "..."}
        </div>
        <div className="bg-slate-500 text-slate-50 basis-1/2 py-2 px-4">
          {isConnectedToScaleValue
            ? "+ " +
              (actualQuantity + actualQuantity * (tolerance / 100)).toFixed(2) +
              " Kg"
            : "..."}
        </div>
      </div>
    </div>
  );
}

function Timers() {
  const { productTime, materialTime, isWeighingProcess, isMaterialProcess } =
    useWeighingContext();

  return (
    <div className="col-start-7 col-end-13 row-start-1 row-end-3 flex flex-col justify-center items-center gap-4">
      <div className="flex flex-col items-center">
        <div className="text-lg">Duration per Product</div>
        <div className="bg-black text-white text-center py-2 px-6 text-5xl">
          <span>
            {("0" + Math.floor((productTime / 60000) % 60)).slice(-2)}:
          </span>
          <span>{("0" + Math.floor((productTime / 1000) % 60)).slice(-2)}</span>
          {/* <span>{("0" + ((productTime / 10) % 100)).slice(-2)}</span> */}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-lg">Duration per Material</div>
        <div className="bg-black text-white text-center py-2 px-6 text-5xl">
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
  } = useWeighingContext();

  return (
    <div className="px-2 pb-8 col-start-7 col-end-13 row-start-3 row-end-5 flex justify-center items-center gap-4 text-xl">
      {isMaterialProcess ? (
        <button
          onClick={() => {
            resetMaterial();
            setIsMaterialProcess(false);
            setMaterialTime(0);
          }}
          className={`basis-1/2 text-white py-4 ${
            false ? "bg-red-700" : "bg-red-600 hover:bg-red-500 "
          }`}
          // disabled if weight is still out of tolerance
          disabled={false}
        >
          Stop
        </button>
      ) : (
        <button
          onClick={() => {
            setIsMaterialProcess(true);
          }}
          disabled={
            isMaterialProcess || !isWeighingProcess || isMaterialInputEmpty()
          }
          className={`basis-1/2 text-white py-4 ${
            isMaterialProcess || !isWeighingProcess || isMaterialInputEmpty()
              ? "bg-green-700"
              : "bg-green-600 hover:bg-green-500 "
          }`}
        >
          Start material
        </button>
      )}

      {isWeighingProcess ? (
        <button
          onClick={() => {
            handleStopWeighingProcess();
          }}
          className={`basis-1/2 text-white py-4 ${
            isMaterialProcess || isMainInputEmpty()
              ? "bg-red-700"
              : "bg-red-600 hover:bg-red-500 "
          }`}
          disabled={isMaterialProcess}
        >
          Stop
        </button>
      ) : (
        <button
          onClick={handleStartWeighingProcess}
          disabled={isWeighingProcess || isMainInputEmpty()}
          className={`basis-1/2 text-white py-4 ${
            isWeighingProcess || isMainInputEmpty()
              ? "bg-green-700"
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
  const { handleSelectSSE, handleCloseTCP } = useWeighingContext();
  return (
    <div className="col-start-1 col-end-5 row-start-5 pb-8 row-end-7 flex flex-col justify-center items-center gap-4 text-4xl">
      <div className="flex w-full gap-4 justify-center items-center">
        <button
          onClick={handleSelectSSE}
          className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2"
        >
          2 ton
        </button>

        <button
          onClick={handleCloseTCP}
          className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2"
        >
          350 Kg
        </button>
      </div>
      <div className="flex w-full gap-4 justify-center items-center">
        <button className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2">
          2 Kg
        </button>

        <button className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2">
          ...
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
  } = useWeighingContext();

  const timeoutRef = useRef(null);
  const handleProductChange = (e) => {
    clearTimeout(timeoutRef.current);
    const targetValue = e.target.value;
    setProductNo(targetValue);

    if (targetValue) {
      timeoutRef.current = setTimeout(() => {
        fetch(API_URL + "/product/" + targetValue)
          .then((res) => {
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
          .then((res) => {
            if (res) {
              // if res is not undefined
              setProduct(res);
              console.log("handleProductChange", res);
              materialNoRef.current.value = "";
            }
          })
          .catch((e) =>
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
    <div className="col-span-6 row-span-4 flex flex-col gap-4 pl-4 text-xl justify-center">
      <div className="flex justify-between items-center">
        <div>SAP Order No.</div>
        <input
          ref={sapNoRef}
          onChange={() => {
            const no = sapNoRef.current.value;
            setSapNo(no);
          }}
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          type="text"
          disabled={isWeighingProcess}
        />
      </div>

      <div className="flex justify-between items-center">
        <div>Batch No.</div>
        <input
          ref={batchNoRef}
          onChange={() => {
            const no = batchNoRef.current.value;
            setBatchNo(no);
          }}
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          type="text"
          disabled={isWeighingProcess}
        />
      </div>

      <div className="flex justify-between items-center">
        <div>Product No.</div>
        <input
          ref={productNoRef}
          onChange={handleProductChange}
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          disabled={isWeighingProcess}
          list="productsNo"
        />
        <datalist id="productsNo">
          {products.length !== 0 &&
            products.map((v) => (
              <option key={v._id} value={v.no}>
                {v.no}
              </option>
            ))}
        </datalist>
      </div>

      <div className="flex justify-between items-center">
        <div>Material No.</div>
        <select
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          disabled={product === null}
          onChange={() => {
            const no = materialNoRef.current.value;
            setMaterialNo(no);
          }}
          ref={materialNoRef}
        >
          <option value=""></option>
          {product !== null &&
            product.materials.map((v) => (
              <option key={v._id} value={v.no}>
                {v.no}
              </option>
            ))}
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Packaging</div>
        <select
          ref={packagingRef}
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          onChange={(e) => {
            const value = e.target.value;
            setPackaging(value);
          }}
        >
          <option value=""></option>
          <option value="test1">test1</option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Target Qty. (Kg.)</div>
        <input
          ref={targetQtyRef}
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          type="number"
          onChange={(e) => {
            const value = e.target.valueAsNumber;
            setTargetQty(value);
          }}
        />
      </div>

      <div className="flex justify-between items-center">
        <div>Tolerance (%)</div>
        <input
          ref={toleranceRef}
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          type="number"
          onChange={(e) => {
            const value = e.target.valueAsNumber;
            setTolerance(value);
          }}
        />
      </div>
    </div>
  );
}
