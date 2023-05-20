import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MIN_PRODUCT_LENGTH = 8;
const MAX_PRODUCT_LENGTH = 10;
const MIN_MATERIAL_LENGTH = 8;
const MAX_MATERIAL_LENGTH = 10;

export default function Page() {
  const [productNo, setProductNo] = useState("");
  const [materialNo, setMaterialNo] = useState("");
  const [isProductNoValid, setIsProductNoValid] = useState(true);
  const [isMaterialNoValid, setIsMaterialNoValid] = useState(true);
  const [materialsNo, setMaterialsNo] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [message, setMessage] = useState("");

  const productNoRef = useRef();
  const materialNoRef = useRef();

  const openModal = (type, message) => {
    setIsModalOpen(true);
    setModalType(type);
    setMessage(message);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setMessage("");
  };

  const emptyField = () => {
    productNoRef.current.value = "";
    setMaterialsNo([]);
  };

  const handleAddMaterial = () => {
    if (productNo === "") {
      openModal(0, "Please input product number first!");
      return;
    }

    const v = materialNoRef.current.value;

    if (v === "") {
      openModal(
        0,
        "The material number field is empty. Please input material number"
      );
    } else if (
      v.length < MIN_MATERIAL_LENGTH ||
      v.length > MAX_MATERIAL_LENGTH
    ) {
      openModal(
        0,
        `Please input material number between ${MIN_MATERIAL_LENGTH} and ${MAX_MATERIAL_LENGTH} characters!`
      );
    } else {
      setMaterialsNo((state) => [...state, v]);
      materialNoRef.current.value = "";
    }
  };

  const handleInputProductNoChange = (e) => {
    setProductNo(e.target.value);
  };

  const handleInputMaterialNoChange = (e) => {
    setMaterialNo(e.target.value);
  };

  const handleClickDeleteMaterial = (index) => {
    setMaterialsNo((prevState) => {
      const newArray = [...prevState];
      newArray.splice(index, 1);
      return newArray;
    });
  };

  const handleClickSubmit = async () => {
    if (productNo === "") {
      openModal(0, "Please input product number is empty!");
      return;
    }

    if (
      productNo.length < MIN_PRODUCT_LENGTH ||
      productNo.length > MAX_PRODUCT_LENGTH
    ) {
      openModal(
        0,
        `Please input product number between ${MIN_PRODUCT_LENGTH} and ${MAX_PRODUCT_LENGTH} characters!`
      );
      return;
    }

    if (materialsNo.length === 0) {
      openModal(0, "The materials is empty. Please input material!");
      return;
    }

    const product = {
      productNo,
      materialsNo,
    };

    try {
      const response = await fetch(API_URL + "/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...product,
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const responseJson = await response.json();
          openModal(0, responseJson.message);
          return;
        }
      }

      // Success
      const responseJson = await response.json();
      openModal(0, responseJson.message);
      emptyField();
    } catch (e) {
      console.error(e); // this is bad
    }
  };

  useEffect(() => {
    setIsProductNoValid(/^\d*$/.test(productNo));
  }, [productNo]);

  useEffect(() => {
    setIsMaterialNoValid(/^\d*$/.test(materialNo));
  }, [materialNo]);

  useEffect(() => {
    console.log("materialsNo (useEffect)", materialsNo);
  }, [materialsNo]);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="bg-slate-900 text-slate-200 basis-8 px-4 flex justify-between items-center">
          <Link className="" href="/product">
            back
          </Link>
        </div>
        <h1 className="text-3xl text-center pt-2">Input Product</h1>

        <div className="grow flex flex-col gap-4 pb-10 px-10 md:px-[11%] lg:px-[14%] pt-6">
          <div className="text-lg flex gap-4 px-4">
            <div className="self-start py-1">Product No</div>
            <div className="self-start py-1">:</div>
            <div className="grow flex flex-col">
              <input
                className={`grow px-3 py-1 tracking-widest appearance-none focus:outline-none focus:ring-2 ${
                  isProductNoValid
                    ? "focus:ring-slate-500"
                    : "focus:ring-red-500"
                }`}
                ref={productNoRef}
                type="text"
                onChange={handleInputProductNoChange}
              />
              {!isProductNoValid && (
                <div className="text-red-500 text-xs">Input must number!</div>
              )}
            </div>
          </div>

          <div className="text-base flex gap-4 items-start px-4">
            <div className="py-1">Material No</div>
            <div className="py-1">:</div>
            <div className="grow flex flex-col">
              <input
                ref={materialNoRef}
                className={`grow px-3 py-1 tracking-widest appearance-none focus:outline-none focus:ring-2 ${
                  isMaterialNoValid
                    ? "focus:ring-slate-500"
                    : "focus:ring-red-500"
                }`}
                type="text"
                onChange={handleInputMaterialNoChange}
              />
              {!isMaterialNoValid && (
                <div className="text-red-500 text-xs">Input must number!</div>
              )}
            </div>

            <button
              className="bg-slate-300 p-1 my-1 text-xs hover:bg-slate-400 active:bg-slate-300"
              onClick={handleAddMaterial}
            >
              Add Material
            </button>
          </div>
          <div className="grow flex flex-col">
            {materialsNo.length === 0 ? (
              <div className="grow flex h-full justify-center items-center text-slate-400">
                empty
              </div>
            ) : (
              materialsNo.map((v, i) => {
                return (
                  <div
                    className="flex justify-center items-center text-lg gap-2"
                    key={i}
                  >
                    <div>{v}</div>
                    <button
                      className="bg-slate-300 px-2 rounded-lg"
                      onClick={() => {
                        handleClickDeleteMaterial(i);
                      }}
                    >
                      X
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <button
            className={`py-1 mx-10 text-lg ${
              productNo !== ""
                ? "bg-slate-300 hover:bg-slate-400 active:bg-slate-300"
                : "bg-slate-400"
            }`}
            onClick={handleClickSubmit}
            disabled={productNo === ""}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Feedback */}
      {isModalOpen && (
        <FeedbackModal
          message={message}
          closeModal={closeModal}
          modalType={modalType}
        />
      )}
    </>
  );
}

function FeedbackModal({ message, closeModal, modalType }) {
  let bgColor;

  switch (modalType) {
    case 1:
      bgColor = "bg-green-500";
      break;
    case 2:
      bgColor = "bg-red-500";
      break;
    default:
      bgColor = "bg-slate-100";
  }

  return (
    <div className="bg-slate-900/50 fixed inset-0 flex justify-center items-center">
      <div
        className={`p-4 max-w-[80%] flex flex-col items-center gap-4 ${bgColor}`}
      >
        <div className="text-lg">{message}</div>

        <button
          onClick={closeModal}
          className="bg-slate-300 hover:bg-slate-400 active:bg-slate-300 py-1 px-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
