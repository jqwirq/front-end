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

  const [sapNo, setSapNo] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [productNo, setProductNo] = useState("");

  const [isWeighingProcess, setIsWeighingProcess] = useState(false);
  const [productTime, setProductTime] = useState(0);
  const [isMaterialProcess, setIsMaterialProcess] = useState(false);
  const [materialTime, setMaterialTime] = useState(0);

  const sapNoRef = useRef("");
  const batchNoRef = useRef("");
  const productNoRef = useRef("");
  const materialNoRef = useRef();

  const [data, setData] = useState("");
  const [eventSource, setEventSource] = useState(null);

  const isMainInputEmpty = () => {
    const isEmpty = sapNo === "" || batchNo === "" || productNo === "";

    if (isEmpty) return true;

    return false;
  };

  const resetMain = () => {
    sapNoRef.current.value = "";
    setSapNo("");
    batchNoRef.current.value = "";
    setBatchNo("");
    productNoRef.current.value = "";
    setProductNo("");
    materialNoRef.current.value = "";
    setProduct(null);
    setProductTime(0);
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

  // SSE
  const handleSelectSSE = () => {
    if (!eventSource) {
      const es = new EventSource(API_URL + "/events");
      setEventSource(es);

      es.onmessage = (event) => {
        setData(event.data);
      };

      es.onerror = (err) => {
        console.error("EventSource failed:", err);
        es.close();
        setEventSource(null);
      };
    }
  };

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

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

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
    isMainInputEmpty,
    productTime,
    setProductTime,
    materialTime,
    setMaterialTime,
    resetMain,
    sapNo,
    setSapNo,
    batchNo,
    setBatchNo,
    productNo,
    setProductNo,
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

            <ScaleSelectButton handleSelectSSE={handleSelectSSE} />

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
  return (
    <div className="col-start-5 col-end-13 row-start-5 row-end-7 flex flex-col justify-start items-center px-2 pt-6 gap-4">
      <div className="text-8xl bg-yellow-200 font-bold w-full p-4 text-center">
        {data ? data : "2000.00 Kg"}
      </div>

      <div className="flex justify-center text-3xl text-center gap-4 w-full">
        <div className="bg-red-400 basis-1/2 py-2 px-4">- 1980.00 Kg</div>
        <div className="bg-red-400 basis-1/2 py-2 px-4">+ 2020.00 Kg</div>
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
    resetMain,
  } = useWeighingContext();

  return (
    <div className="px-2 pb-8 col-start-7 col-end-13 row-start-3 row-end-5 flex justify-center items-center gap-4 text-xl">
      <button
        disabled={!isWeighingProcess}
        className={`basis-1/2 text-white py-4 ${
          !isWeighingProcess
            ? "bg-green-700"
            : "bg-green-600 hover:bg-green-500 "
        }`}
      >
        Start material
      </button>

      {isWeighingProcess ? (
        <button
          onClick={() => {
            resetMain();
            setIsWeighingProcess(false);
          }}
        >
          Stop
        </button>
      ) : (
        <button
          onClick={() => {
            setIsWeighingProcess(true);
          }}
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

function ScaleSelectButton({ handleSelectSSE }) {
  return (
    <div className="col-start-1 col-end-5 row-start-5 pb-8 row-end-7 flex flex-col justify-center items-center gap-4 text-4xl">
      <div className="flex w-full gap-4 justify-center items-center">
        <button
          onClick={handleSelectSSE}
          className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2"
        >
          2 ton
        </button>

        <button className="bg-slate-400 py-2 hover:bg-slate-300 basis-1/2">
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
    setSapNo,
    setBatchNo,
    setProductNo,
    isWeighingProcess,
  } = useWeighingContext();

  const handleProductChange = (e) => {
    materialNoRef.current.value = "";
    const targetValue = e.target.value;

    setProductNo(targetValue);
    if (targetValue) {
      fetch(API_URL + "/product/" + targetValue)
        .then((res) => res.json())
        .then((res) => {
          setProduct(res);
          console.log("handleProductChange", res);
        });
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
        <select
          ref={productNoRef}
          onChange={handleProductChange}
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          disabled={isWeighingProcess}
        >
          <option value=""></option>
          {products.length !== 0 &&
            products.map((v) => (
              <option key={v._id} value={v.no}>
                {v.no}
              </option>
            ))}
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Material No.</div>
        <select
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          disabled={product === null}
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
        <select className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl">
          <option value=""></option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <div>Target Qty. (Kg.)</div>
        <input
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          type="text"
        />
      </div>

      <div className="flex justify-between items-center">
        <div>Tolerance (%)</div>
        <input
          className="w-[55%] bg-yellow-200 p-1 pl-4 text-2xl"
          type="text"
        />
      </div>
    </div>
  );
}
