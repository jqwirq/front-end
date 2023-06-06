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
  const ws = useRef(null);

  // SSE useless
  // const [data, setData] = useState("");
  // const [eventSource, setEventSource] = useState(null);

  const componentSAPToPrintRef = useRef();
  const componentMaterialToPrintRef = useRef();

  // const handlePrintSAP = () => {
  //   if (sap !== null && sap.isCompleted) {
  //     console.log(sap);
  //   } else {
  //     console.error("error");
  //   }
  // };
  const handlePrintSAP = useReactToPrint({
    content: () =>
      sap !== null && sap.isCompleted ? componentSAPToPrintRef.current : null,
  });

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
      console.log("Disconnected from WebSocket server");
    }
  }

  function connectWebSocket(url) {
    disconnectWebsocket(); // Disconnect any existing WebSocket connection
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log(`Connected to WebSocket server at ${url}`);
      setIsConnectedToScaleValue(true);
    };

    ws.current.onmessage = (message) => {
      const qty = parseFloat(message.data);
      setActualQuantity(qty);

      const isToleranced = isQuantityToleranced(tolerance, targetQty, qty);

      if (!isToleranced) {
        fetch("http://127.0.0.1:1880" + "/api/error-signal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sinyal: "merah",
          }),
        })
          .then(() => console.log("fired"))
          .catch((err) => console.error(err));
      }
    };

    ws.current.onerror = (error) => {
      console.log(error);
    };

    ws.current.onclose = (event) => {
      console.log(`Disconnected from WebSocket server at ${url}`);
    };
  }

  useEffect(() => {
    if (ws.current) {
      ws.current.onmessage = (message) => {
        const qty = parseFloat(message.data);
        setActualQuantity(qty);

        const isToleranced = isQuantityToleranced(tolerance, targetQty, qty);

        if (!isToleranced) {
          fetch("http://127.0.0.1:1880" + "/api/error-signal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sinyal: "merah",
            }),
          })
            .then(() => console.log("fired"))
            .catch((err) => console.error(err));
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

      console.log(responseJson);

      setSAP(responseJson.SAP);
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
      (err) => console.error(err);
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
        console.error("Weigh out of tolerance");
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

      console.log(responseJson);
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
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        console.log("setProducts, useEffect[]", res);
        setProducts(res);
      })
      .catch((err) => console.error(err));

    return () => {
      disconnectWebsocket();
    };
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
    handlePrintSAP,
    handlePrintMaterial,
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
              gridTemplateRows: "1fr 1fr .8fr .4fr 1fr 1fr",
              gridTemplateColumns:
                "1fr 1fr 1fr 1fr 1.2fr 1.2fr 1fr 1fr 1fr 1fr 1fr",
            }}
          >
            <FormWeighing />

            <ScaleSelectButton />

            <Timers />

            <StartButton />

            <div className="col-start-7 col-end-13 row-start-4 row-end-5 flex justify-around items-center gap-4 text-base px-4">
              <button
                className="basis-1/2 bg-slate-400"
                onClick={handlePrintMaterial}
              >
                print
                <br />
                material
              </button>
              <PrintSAPComponent />
            </div>

            <Weight />
          </div>
        </div>
      </div>
      <div style={{ display: "none" }}>
        <ComponentSAPToPrint />
      </div>
    </WeighingProcessContext.Provider>
  );
}

function PrintSAPComponent() {
  const { handlePrintSAP } = useWeighingContext();
  return (
    <button
      className="basis-1/2 bg-slate-400"
      onClick={() => {
        console.log("help");
      }}
    >
      print
      <br /> sap
    </button>
  );
}

function Weight() {
  const { actualQuantity, isConnectedToScaleValue, targetQty, tolerance } =
    useWeighingContext();

  return (
    <div className="col-start-5 col-end-13 row-start-5 row-end-7 flex flex-col justify-start items-center px-2 pt-6 gap-4">
      <div className="text-8xl bg-yellow-200 font-bold w-full p-4 text-center">
        {actualQuantity.toFixed(2)} Kg
      </div>

      <div className="flex justify-center text-3xl text-center gap-4 w-full">
        <div className="bg-slate-500 text-slate-50 basis-1/2 py-2 px-4">
          {/* {isConnectedToScaleValue
            ? "- " +
              (targetQty - targetQty * (tolerance / 100)).toFixed(2) +
              " Kg"
            : "..."} */}
          {"- " +
            (targetQty - targetQty * (tolerance / 100)).toFixed(2) +
            " Kg"}
        </div>
        <div className="bg-slate-500 text-slate-50 basis-1/2 py-2 px-4">
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
    handleStartMaterialWeighing,
    handleStopMaterialWeighing,
  } = useWeighingContext();

  return (
    <div className="px-2 col-start-7 col-end-13 row-start-3 row-end-4 flex justify-center items-center gap-4 text-xl">
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
              ? "bg-green-700"
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
              ? "bg-red-700"
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
  const { connectWebSocket, isMaterialProcess } = useWeighingContext();
  return (
    <div className="col-start-1 col-end-5 row-start-5 pb-8 row-end-7 flex flex-col justify-center items-center gap-4 text-4xl">
      <div className="flex w-full gap-4 justify-center items-center">
        <button
          onClick={() => connectWebSocket("ws://127.0.0.1:1880/ws1")}
          className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2"
          disabled={!isMaterialProcess}
        >
          2 ton
        </button>

        <button
          className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2"
          disabled={!isMaterialProcess}
        >
          350 Kg
        </button>
      </div>
      <div className="flex w-full gap-4 justify-center items-center">
        <button
          className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2"
          disabled={!isMaterialProcess}
        >
          2 Kg
        </button>

        <button
          className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2"
          disabled={!isMaterialProcess}
        >
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
    <div className="col-span-6 row-span-4 flex flex-col gap-4 text-xl justify-center">
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
          <option value="Sak">Sak</option>
          <option value="Pail">Pail</option>
          <option value="Drum">Drum</option>
          <option value="IBC">IBC</option>
          <option value="Botol 250mL-1000mL">Botol 250mL-1000mL</option>
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

function ComponentSAPToPrint() {
  const { componentSAPToPrintRef, sap, componentMaterialToPrintRef, material } =
    useWeighingContext();

  return (
    <>
      {sap !== null && (
        <div className={styles.printArea} ref={componentSAPToPrintRef}>
          <br />
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flexBasis: "50%" }}>
              <div className={styles.upperData}>
                <div>SAP</div>
                <div>:&nbsp;{sap.no}</div>
              </div>
              <div className={styles.upperData}>
                <div>Batch No</div>
                <div>:&nbsp;{sap.batchNo}</div>
              </div>
              <div className={styles.upperData}>
                <div>Product No</div>
                <div>:&nbsp;{sap.productNo}</div>
              </div>
            </div>
            <div style={{ flexBasis: "50%" }}>
              <div className={styles.upperData}>
                <div>Date</div>
                <div>:&nbsp;Date</div>
              </div>
              <div className={styles.upperData}>
                <div>Duration</div>
                <div>:&nbsp;Duration</div>
              </div>
            </div>
          </div>
          <br />
          <div className={styles.tableTest}>
            <table>
              <thead>
                <tr>
                  <td>M</td>
                  <td>Q</td>
                  <td>P</td>
                  <td>D</td>
                </tr>
              </thead>
              <tbody>
                {sap !== null &&
                  sap.materials.map((m) => (
                    <tr key={m.no}>
                      <td>{m.no}</td>
                      <td>{m.quantity}</td>
                      <td>{m.packaging}</td>
                      <td>date</td>
                    </tr>
                  ))}
                {/* <tr>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                </tr>
                <tr>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                </tr>
                <tr>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                </tr>
                <tr>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                </tr>
                <tr>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                  <td>XXXXXXXXXX</td>
                </tr> */}
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
              <hr />
            </div>
          </div>
          <hr />
        </div>
      )}

      {material !== null && (
        <>
          <div ref={componentMaterialToPrintRef}>
            <div>Material No: {material.no}</div>
            <div>Packaging: {material.packaging}</div>
            <div>Date</div>
            <div>Duration</div>
          </div>
        </>
      )}
    </>
  );
}
