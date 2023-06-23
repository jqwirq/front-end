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
  const [packages, setPackages] = useState([]);

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
          .then(res => {
            // console.log(res);
            return;
          })
          .catch(err => console.error(err));
      } else if (isToleranced) {
        fetch("http://127.0.0.1:1880" + "/api/light-signal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ signal: "hijau" }),
        })
          .then(res => {
            return res.json();
          })
          .then(res => {
            return fetch(API_URL + "/material-weighing/stop", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: sap._id,
                materialId: material._id,
                quantity: actualQuantity,
                endTime: Date.now(),
                tolerance,
                targetQty,
              }),
            });
          })
          .then(res => {
            if (!res.ok) {
              return res.json().then(res => {
                const message = res.message;
                if (response.status === 400) {
                  showAlert(message);
                  // console.error(message);
                  return;
                } else if (response.status === 404) {
                  showAlert(message);
                  // console.error(message);
                  return;
                } else if (response.status === 409) {
                  showAlert(message);
                  // console.error(message);
                  return;
                } else {
                  return;
                }
              });
            } else {
              return res.json().then(res => {
                localStorage.setItem(
                  "WP",
                  JSON.stringify({
                    PID: sap._id,
                  })
                );

                disconnectWebsocket();
                setMaterial(response.material);
                resetMaterial();
                setIsMaterialProcess(false);
                setMaterialTime(0);
                setActualQuantity(0);
              });
            }
          })
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
            .then(res => {
              // console.log(res);
              return;
            })
            .catch(err => console.error(err));
        } else if (isToleranced) {
          fetch("http://127.0.0.1:1880" + "/api/light-signal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ signal: "hijau" }),
          })
            .then(res => {
              return res.json();
            })
            .then(res => {
              return fetch(API_URL + "/material-weighing/stop", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: sap._id,
                  materialId: material._id,
                  quantity: actualQuantity,
                  endTime: Date.now(),
                  tolerance,
                  targetQty,
                }),
              });
            })
            .then(res => {
              if (!res.ok) {
                return res.json().then(res => {
                  const message = res.message;
                  if (response.status === 400) {
                    showAlert(message);
                    // console.error(message);
                    return;
                  } else if (response.status === 404) {
                    showAlert(message);
                    // console.error(message);
                    return;
                  } else if (response.status === 409) {
                    showAlert(message);
                    // console.error(message);
                    return;
                  } else {
                    return;
                  }
                });
              } else {
                return res.json().then(res => {
                  localStorage.setItem(
                    "WP",
                    JSON.stringify({
                      PID: sap._id,
                    })
                  );

                  disconnectWebsocket();
                  setMaterial(response.material);
                  resetMaterial();
                  setIsMaterialProcess(false);
                  setMaterialTime(0);
                  setActualQuantity(0);
                });
              }
            })
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
        const message = responseJson.message;
        if (response.status === 400) {
          showAlert(message);
          // console.error(message);
          return;
        } else if (response.status === 404) {
          showAlert(message);
          // console.error(message);
          return;
        } else if (response.status === 409) {
          showAlert(message);
          // console.error(message);
          return;
        } else {
          return;
        }
      }

      localStorage.setItem(
        "WP",
        JSON.stringify({
          PID: responseJson.process._id,
        })
      );

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
        const message = responseJson.message;
        if (response.status === 400) {
          showAlert(message);
          console.error(message);
          return;
        } else if (response.status === 404) {
          showAlert(message);
          console.error(message);
          return;
        } else if (response.status === 409) {
          showAlert(message);
          console.error(message);
          return;
        } else {
          return;
        }
      }

      localStorage.removeItem("WP");

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
      if (targetQty === 0) {
        showAlert("Target quantity can't be 0");
        return;
      } else if (targetQty < 0) {
        showAlert("Target quantity can't be less than 0");
        return;
      } else if (targetQty > 100000) {
        showAlert("You are exceeding max number for target quantity");
        return;
      }

      if (tolerance < 0) {
        showAlert("Tolerance can't be less than 0");
        return;
      } else if (tolerance > 1000) {
        showAlert("You are exceeding max number for tolerance");
        return;
      }

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
        const message = responseJson.message;
        if (response.status === 400) {
          showAlert(message);
          console.error(message);
          return;
        } else if (response.status === 404) {
          showAlert(message);
          console.error(message);
          return;
        } else if (response.status === 409) {
          showAlert(message);
          console.error(message);
          return;
        } else {
          return;
        }
      }

      localStorage.setItem(
        "WP",
        JSON.stringify({
          PID: sap._id,
          targetQty,
          tolerance,
        })
      );

      setMaterial(responseJson.material);
      setIsMaterialProcess(true);
    } catch (error) {
      console.error(error);
    }
  };

  async function handleStopMaterialWeighing() {
    try {
      if (!isQuantityToleranced(tolerance, targetQty, actualQuantity)) {
        // console.error("The weight is out of tolerance!");
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
          tolerance,
          targetQty,
        }),
      });
      const responseJson = await response.json();

      if (!response.ok) {
        const message = responseJson.message;
        if (response.status === 400) {
          showAlert(message);
          // console.error(message);
          return;
        } else if (response.status === 404) {
          showAlert(message);
          // console.error(message);
          return;
        } else if (response.status === 409) {
          showAlert(message);
          // console.error(message);
          return;
        } else {
          return;
        }
      }

      localStorage.setItem(
        "WP",
        JSON.stringify({
          PID: sap._id,
        })
      );

      disconnectWebsocket();
      setMaterial(responseJson.material);
      resetMaterial();
      setIsMaterialProcess(false);
      setMaterialTime(0);
      setActualQuantity(0);
    } catch (error) {
      console.error(error);
    }
  }

  const handleCancelWeighing = async () => {
    try {
      const response = await fetch(API_URL + "/material-weighing/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sap._id,
          materialId: material._id,
        }),
      });
      const responseJson = await response.json();

      if (!response.ok) {
        const message = responseJson.message;
        if (response.status === 400) {
          showAlert(message);
          // console.error(message);
          return;
        } else if (response.status === 404) {
          showAlert(message);
          // console.error(message);
          return;
        } else if (response.status === 409) {
          showAlert(message);
          // console.error(message);
          return;
        } else {
          return;
        }
      }

      localStorage.setItem(
        "WP",
        JSON.stringify({
          PID: sap._id,
        })
      );

      disconnectWebsocket();
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
        setProducts(res.products);
      })
      .then(() => {
        let storagedWP = localStorage.getItem("WP");
        let currentMaterial;
        let currentMaterialNo;
        let currentMaterialProcess;
        if (storagedWP) {
          let WP = JSON.parse(storagedWP);
          // console.log(WP);
          return fetch(API_URL + "/process/" + WP.PID)
            .then(res => {
              return res.json();
            })
            .then(res => {
              // console.log(res);
              const process = res.process;
              setSAP(process);

              if (!process.isCompleted) {
                setIsWeighingProcess(true);
              }

              sapNoRef.current.value = process.no;
              setSapNo(process.no);
              batchNoRef.current.value = process.batchNo;
              setBatchNo(process.batchNo);
              productNoRef.current.value = process.productNo;
              setProductNo(process.productNo);
              if (WP.targetQty) {
                targetQtyRef.current.value = WP.targetQty;
                setTargetQty(WP.targetQty);
              }
              if (WP.tolerance) {
                toleranceRef.current.value = WP.tolerance;
                setTolerance(WP.tolerance);
              }

              if (process.materials.length !== 0) {
                currentMaterial =
                  process.materials[process.materials.length - 1];
                setMaterial(currentMaterial);
                if (!currentMaterial.isCompleted) {
                  setIsMaterialProcess(true);
                }
                currentMaterialNo = currentMaterial.no;
                currentMaterialProcess = currentMaterial.isCompleted;
              }

              return fetch(API_URL + "/product/" + process.productNo);
            })
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
                setProduct(res.product);
                // console.log("handleProductChange", res);
              }
            })
            .then(() => {
              // console.log(storagedWP);
              if (!currentMaterialProcess) {
                materialNoRef.current.value = currentMaterialNo;
                setMaterialNo(currentMaterialNo);
              }
            })
            .then(() => {
              return fetch(API_URL + "/packaging")
                .then(res => {
                  return res.json();
                })
                .then(res => {
                  setPackages(res.data);
                  if (!currentMaterialProcess) {
                    packagingRef.current.value = currentMaterial.packaging;
                    setPackaging(currentMaterial.packaging);
                  }
                });
            });
        } else {
          return fetch(API_URL + "/packaging")
            .then(res => {
              return res.json();
            })
            .then(res => {
              setPackages(res.data);
            });
        }
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
    packages,
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
    handleCancelWeighing,
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
      <div
        className={`min-h-screen ${
          isWeighingProcess ? "bg-slate-100" : "bg-slate-200"
        }`}
      >
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

            <div className='col-start-7 col-end-13 row-start-4 row-end-5 flex justify-around items-center gap-6 text-base px-6'>
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
                &nbsp;Material
              </button>

              <PrintSAPComponent />
            </div>

            <Weight />
          </div>
        </div>
      </div>

      {isAlert && (
        <div className='bg-slate-900/50 fixed inset-0 flex justify-center items-center z-10'>
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
        &nbsp;SAP
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
  const {
    actualQuantity,
    isConnectedToScaleValue,
    targetQty,
    tolerance,
    isMaterialProcess,
  } = useWeighingContext();

  return (
    <div className='col-start-5 col-end-13 row-start-5 row-end-7 flex flex-col justify-center items-center gap-4'>
      <div
        className={`text-8xl font-bold w-full p-4 text-center ${
          isConnectedToScaleValue
            ? "bg-green-400 text-black"
            : "bg-green-600 brightness-50 text-green-500"
        }`}
      >
        {actualQuantity.toFixed(2)} Kg
      </div>

      <div className='flex justify-center text-3xl text-center gap-6 px-2 w-full'>
        <div
          className={`basis-1/2 py-2 px-4 ${
            !isMaterialProcess
              ? "bg-red-900 text-red-800"
              : "bg-red-700 text-white"
          }`}
        >
          {/* {isConnectedToScaleValue
            ? "- " +
              (targetQty - targetQty * (tolerance / 100)).toFixed(2) +
              " Kg"
            : "..."} */}
          {"- " +
            (targetQty - targetQty * (tolerance / 100)).toFixed(2) +
            " Kg"}
        </div>
        <div
          className={`basis-1/2 py-2 px-4 ${
            !isMaterialProcess
              ? "bg-red-900 text-red-800"
              : "bg-red-700 text-white"
          }`}
        >
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
        <div className='text-base mb-2 flex items-center gap-2'>
          <div>Weighing Process</div>
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
              d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </div>
        <div
          className={` text-center py-2 px-8 text-7xl ${
            isWeighingProcess
              ? "bg-black text-white"
              : "bg-neutral-800 text-neutral-700"
          }`}
        >
          {productTime >= 3600000 && (
            <span>{("0" + Math.floor(productTime / 3600000)).slice(-2)}:</span>
          )}
          <span>
            {("0" + Math.floor((productTime / 60000) % 60)).slice(-2)}:
          </span>
          <span>{("0" + Math.floor((productTime / 1000) % 60)).slice(-2)}</span>
        </div>
      </div>

      <div className='flex flex-col items-center'>
        <div className='text-base mb-2 flex items-center gap-2'>
          <div>Material Weighing</div>
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
              d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </div>
        <div
          className={`bg-black text-center py-2 px-8 text-7xl ${
            isMaterialProcess
              ? "bg-black text-white"
              : "bg-neutral-800 text-neutral-700"
          }`}
        >
          {materialTime >= 3600000 && (
            <span>{("0" + Math.floor(materialTime / 3600000)).slice(-2)}:</span>
          )}
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
    handleCancelWeighing,
  } = useWeighingContext();

  return (
    <div className='px-2 col-start-7 col-end-13 row-start-3 row-end-4 flex justify-center items-center gap-4 text-xl'>
      {isMaterialProcess ? (
        <div className='flex items-center basis-1/2 gap-2'>
          <button
            onClick={handleStopMaterialWeighing}
            className={`basis-1/2 grow py-4 ${
              !isMaterialProcess
                ? "bg-red-700 text-red-500"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
            // disabled if weight is still out of tolerance
            disabled={false}
          >
            <div className='flex items-center justify-center gap-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-6 h-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z'
                />
              </svg>
              <div>Process</div>
            </div>
          </button>
          <button
            onClick={handleCancelWeighing}
            className={`${
              !isMaterialProcess
                ? "bg-yellow-700 text-yellow-500"
                : "bg-yellow-600 hover:bg-yellow-500 text-white rounded-full"
            }`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-8 h-8'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={handleStartMaterialWeighing}
          disabled={
            isMaterialProcess || !isWeighingProcess || isMaterialInputEmpty()
          }
          className={`basis-1/2 py-4 ${
            isMaterialProcess || !isWeighingProcess || isMaterialInputEmpty()
              ? "bg-green-900 text-green-800"
              : "bg-green-600 hover:bg-green-500 text-white"
          }`}
        >
          <div className='flex items-center justify-center gap-2'>
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
                d='M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z'
              />
            </svg>
            <div>Weighing</div>
          </div>
        </button>
      )}

      {isWeighingProcess ? (
        <button
          onClick={handleStopWeighingProcess}
          className={`basis-1/2 py-4 ${
            isMaterialProcess || isMainInputEmpty()
              ? "bg-red-700 text-red-500"
              : "bg-red-600 hover:bg-red-500 text-white"
          }`}
          disabled={isMaterialProcess}
        >
          <div className='flex items-center justify-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z'
              />
            </svg>
            <div>Process</div>
          </div>
        </button>
      ) : (
        <button
          onClick={handleStartWeighingProcess}
          disabled={isWeighingProcess || isMainInputEmpty()}
          className={`basis-1/2 py-4 ${
            isWeighingProcess || isMainInputEmpty()
              ? "bg-green-900 text-green-800"
              : "bg-green-600 hover:bg-green-500 text-white"
          }`}
        >
          <div className='flex items-center justify-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z'
              />
            </svg>
            <div>Process</div>
          </div>
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
          className={`basis-1/2 py-2 ${
            !isMaterialProcess
              ? "bg-slate-400 text-slate-500"
              : "cursor-pointer bg-slate-300 hover:brightness-110 active:brightness-90"
          }`}
          disabled={!isMaterialProcess}
        >
          2 Ton
        </button>

        <button
          onClick={() => connectWebSocket("ws://127.0.0.1:1880/ws/350tscale")}
          className={`basis-1/2 py-2 ${
            !isMaterialProcess
              ? "bg-slate-400 text-slate-500"
              : "cursor-pointer bg-slate-300 hover:brightness-110 active:brightness-90"
          }`}
          disabled={!isMaterialProcess}
        >
          300 TS
        </button>
      </div>
      <div className='flex w-full gap-4 justify-center items-center'>
        <button
          onClick={() => connectWebSocket("ws://127.0.0.1:1880/ws/350jic")}
          className={`basis-1/2 py-2 ${
            !isMaterialProcess
              ? "bg-slate-400 text-slate-500"
              : "cursor-pointer bg-slate-300 hover:brightness-110 active:brightness-90"
          }`}
          disabled={!isMaterialProcess}
        >
          300 JIC
        </button>

        <button
          onClick={() => connectWebSocket("ws://127.0.0.1:1880/ws/2kg")}
          className={`basis-1/2 py-2 ${
            !isMaterialProcess
              ? "bg-slate-400 text-slate-500"
              : "cursor-pointer bg-slate-300 hover:brightness-110 active:brightness-90"
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
    packages,
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
              setProduct(res.product);
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
    <div className='col-span-6 row-span-4 flex flex-col gap-[22px] text-xl justify-center'>
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
              ? "bg-yellow-200 brightness-75"
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
              ? "bg-yellow-200 brightness-75"
              : "bg-yellow-200 cursor-pointer"
          }`}
          onChange={e => {
            const value = e.target.value;
            setPackaging(value);
          }}
        >
          <option value=''></option>
          {packages.length !== 0 &&
            packages.map(v => (
              <option key={v._id} value={v.type}>
                {v.type}
              </option>
            ))}
        </select>
      </div>

      <div className='flex justify-between items-center'>
        <div>Target Qty. (Kg)</div>
        <input
          disabled={isMaterialProcess}
          ref={targetQtyRef}
          className={`w-[55%] p-1 pl-4 text-2xl outline-none ring-4 ring-yellow-400 focus:ring-yellow-300 ${
            isMaterialProcess ? "bg-yellow-200 brightness-75" : "bg-yellow-200"
          }`}
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
          className={`w-[55%] p-1 pl-4 text-2xl outline-none ring-4 ring-yellow-400 focus:ring-yellow-300 ${
            isMaterialProcess ? "bg-yellow-200 brightness-75" : "bg-yellow-200"
          }`}
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
