import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MIN_PRODUCT_CHARACTER = 10;
const MAX_PRODUCT_CHARACTER = 12;
const MIN_MATERIAL_CHARACTER = 10;
const MAX_MATERIAL_CHARACTER = 12;

export default function Page() {
  const [productNo, setProductNo] = useState("");
  const [materialsNo, setMaterialsNo] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [message, setMessage] = useState("");

  const productNoRef = useRef();
  const materialNo = useRef();

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
    setProductNo("");
    setMaterialsNo([]);
  };

  const handleDeleteItem = (index) => {
    setMaterialsNo((prevState) => {
      const newArray = [...prevState]; // Create a copy of the state array
      newArray.splice(index, 1); // Remove the item at the specified index
      return newArray; // Update the state with the new array
    });
  };

  const handleClickSubmit = async () => {
    if (productNo === "") {
      openModal(0, "Product is empty");
      return;
    }

    if (materialsNo.length === 0) {
      openModal(0, "Material is empty");
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
      console.log(response);
      const responseJson = await response.json();
      openModal(0, responseJson.message);
      console.log(responseJson);
      emptyField();
    } catch (e) {
      console.error(e); // this is bad
    } finally {
    }
  };

  useEffect(() => {
    console.log(materialsNo);
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

        <div className="grow flex flex-col gap-2 pb-10 px-10 md:px-[11%] lg:px-[14%] pt-6">
          <div className="text-lg flex gap-4 items-center px-4">
            <div className="">Product No</div>
            <div>:</div>
            <input
              className="grow px-3 py-1 tracking-widest appearance-none"
              ref={productNoRef}
              type="number"
              onChange={(e) => {
                const value = e.target.value;
                setProductNo(() => value);
              }}
            />
          </div>

          <div className="text-base flex gap-4 items-center px-4">
            <div className="">Material No</div>
            <div>:</div>
            <input
              ref={materialNo}
              className="grow px-3 py-1 tracking-widest"
              type="number"
            />

            <button
              className="bg-slate-300 p-1 text-xs hover:bg-slate-400 active:bg-slate-300"
              onClick={() => {
                const v = materialNo.current.value;

                if (v === "") {
                  openModal(0, "Please input material no.");
                } else if (
                  v.length < MIN_MATERIAL_CHARACTER ||
                  v.length > MAX_MATERIAL_CHARACTER
                ) {
                  openModal(
                    0,
                    `Please input between ${MIN_MATERIAL_CHARACTER} and ${MAX_MATERIAL_CHARACTER} characters`
                  );
                } else {
                  console.log(v);
                  setMaterialsNo((state) => [...state, v]);
                  materialNo.current.value = "";
                }
              }}
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
                        handleDeleteItem(i);
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
            className="py-1 mx-10 bg-slate-300 text-lg hover:bg-slate-400 active:bg-slate-300"
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
      <div className={`p-4 flex flex-col items-center gap-4 ${bgColor}`}>
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
