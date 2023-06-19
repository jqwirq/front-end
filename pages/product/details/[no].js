import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MIN_PRODUCT_LENGTH = 4;
const MAX_PRODUCT_LENGTH = 10;
const MIN_MATERIAL_LENGTH = 4;
const MAX_MATERIAL_LENGTH = 10;

function isArraysHaveNotChange(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  const setA = new Set(a);
  const setB = new Set(b);

  for (let value of setA) {
    if (!setB.has(value)) {
      return false;
    }
  }

  return true;
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { no } = params;
  const response = await fetch(API_URL + "/product/" + no);
  const responseJson = await response.json();

  return {
    props: {
      data: responseJson.product,
    },
  };
}

function YourPage({ data }) {
  const [productNo, setProductNo] = useState("");
  const [materialNo, setMaterialNo] = useState("");
  const [materialsNo, setMaterialsNo] = useState([]);
  const [isProductNoValid, setIsProductNoValid] = useState(true);
  const [isMaterialNoValid, setIsMaterialNoValid] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [message, setMessage] = useState("");

  const productNoRef = useRef();
  const materialNoRef = useRef();
  const updateButtonRef = useRef();

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
    materialNoRef.current.value = "";
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
      return;
    } else if (
      v.length < MIN_MATERIAL_LENGTH ||
      v.length > MAX_MATERIAL_LENGTH
    ) {
      openModal(
        0,
        `Please input material number between ${MIN_MATERIAL_LENGTH} and ${MAX_MATERIAL_LENGTH} characters!`
      );
    } else {
      setMaterialsNo(state => [...state, v]);
      materialNoRef.current.value = "";
    }
  };

  const handleInputProductNoChange = e => {
    setProductNo(e.target.value);
  };

  const handleInputMaterialNoChange = e => {
    setMaterialNo(e.target.value);
  };

  const handleClickDeleteMaterial = index => {
    setMaterialsNo(prevState => {
      const newArray = [...prevState];
      newArray.splice(index, 1);
      return newArray;
    });
  };

  const handleUpdateSubmit = async e => {
    e.preventDefault();

    const password = e.target[0].value;
    if (password !== "test123") {
      closeModal();
      openModal(0, "Wrong password!");
      return;
    } else {
      closeModal();
    }

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
      const response = await fetch(API_URL + "/product/" + data._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productNo,
          materialsNo,
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
      openModal(1, responseJson.message);
      emptyField();
    } catch (e) {
      console.error(e); // this is bad
    }
  };

  useEffect(() => {
    const materials = data.materials.map(x => x.no);
    // console.log(materials);
    setMaterialsNo(state => {
      return materials;
    });
    setProductNo(data.no);
    // productNoRef.current.value = responseJson.no;
    // updateButtonRef.current.disabled = false;
  }, []);

  useEffect(() => {
    setIsProductNoValid(/^\d*$/.test(productNo));
  }, [productNo]);

  useEffect(() => {
    setIsMaterialNoValid(/^\d*$/.test(materialNo));
  }, [materialNo]);

  // useEffect(() => {
  //   console.log("materialsNo (useEffect)", materialsNo);
  // }, [materialsNo]);

  return (
    <>
      <div className='min-h-screen max-h-screen flex flex-col'>
        <div className='bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center'>
          <Link
            className='text-xl hover:text-slate-300 active:text-slate-200'
            href='/product/list'
          >
            back
          </Link>
        </div>

        <h1 className='text-5xl text-center pt-4'>Product Details</h1>

        <div className='grow flex flex-col gap-8 py-10 px-10 md:px-[8%] lg:px-[10%]'>
          {!data && (
            <div className='text-center text-5xl pb-20 grow flex justify-center items-center text-slate-400'>
              Empty
            </div>
          )}
          {data && (
            <>
              <div className='text-3xl flex justify-between items-center'>
                <div className=''>Product No</div>
                <div className='relative basis-2/3'>
                  <input
                    className={`w-full px-3 py-1 tracking-widest appearance-none focus:outline-none focus:ring-2`}
                    ref={productNoRef}
                    defaultValue={data.no}
                    type='text'
                    onChange={handleInputProductNoChange}
                  />
                  {!isProductNoValid && (
                    <div className='absolute bottom-[-18px] text-red-500 text-xs'>
                      Input must number!
                    </div>
                  )}
                </div>
              </div>

              <div className='text-3xl flex justify-between items-center'>
                <div className=''>Material No</div>
                <div className='basis-2/3 flex gap-4 items-center'>
                  <div className='relative grow flex flex-col'>
                    <input
                      ref={materialNoRef}
                      className={`grow px-3 py-1 tracking-widest appearance-none focus:outline-none focus:ring-2`}
                      type='text'
                      onChange={handleInputMaterialNoChange}
                    />
                    {!isMaterialNoValid && (
                      <div className='absolute bottom-[-18px] text-red-500 text-xs'>
                        Input must number!
                      </div>
                    )}
                  </div>

                  <button
                    className='hover:text-slate-500'
                    onClick={handleAddMaterial}
                  >
                    <svg
                      className='w-[1em] h-[1em]'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className='grow overflow-scroll flex flex-col gap-2'>
                {materialsNo.length === 0 ? (
                  <div className='grow flex h-full justify-center items-center text-slate-400'>
                    empty
                  </div>
                ) : (
                  materialsNo.map((v, i) => {
                    return (
                      <div
                        className='bg-slate-200 flex flex-wrap justify-between px-4 py-2 items-center text-lg'
                        key={i}
                      >
                        <div>{v}</div>

                        <button
                          className='text-slate-500 hover:text-slate-400 active:text-slate-500'
                          onClick={() => {
                            handleClickDeleteMaterial(i);
                          }}
                        >
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
                              d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                className={`py-2 text-3xl ${
                  productNo !== ""
                    ? "bg-slate-300 hover:bg-slate-400 active:bg-slate-300"
                    : "bg-slate-200 text-slate-300"
                }`}
                onClick={() => {
                  // console.log(data.no);
                  // console.log(productNo);
                  // console.log(data.materials.map((x) => x.no));
                  // console.log(materialsNo);

                  // if (
                  //   productNo === data.no ||
                  //   isArraysHaveNotChange(
                  //     materialsNo,
                  //     data.materials.map((x) => x.no)
                  //   )
                  // ) {
                  //   openModal(0, "No change!");
                  //   return;
                  // } else {
                  // }
                  openModal(2, "");
                }}
                disabled={productNo === ""}
                ref={updateButtonRef}
              >
                Update
              </button>
            </>
          )}
        </div>
      </div>

      {/* Feedback */}
      {isModalOpen && (
        <FeedbackModal
          message={message}
          closeModal={closeModal}
          modalType={modalType}
          handleUpdateSubmit={handleUpdateSubmit}
        />
      )}
    </>
  );
}

function FeedbackModal({ message, closeModal, modalType, handleUpdateSubmit }) {
  const router = useRouter();

  if (modalType === 1) {
    return (
      <div className='bg-slate-900/50 fixed inset-0 flex justify-center items-center'>
        <div
          className={`p-6 max-w-[80%] flex flex-col items-center gap-8 bg-slate-100`}
        >
          <div className='text-4xl'>{message}</div>

          <button
            onClick={() => {
              closeModal();
              router.push("/product/list");
            }}
            className='text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2'
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  if (modalType === 2) {
    return (
      <div className='bg-slate-900/50 fixed inset-0 flex justify-center items-center'>
        <form
          onSubmit={handleUpdateSubmit}
          className={`p-6 max-w-[80%] flex flex-col items-center gap-8 bg-slate-100`}
        >
          <div className='text-3xl flex items-center gap-8'>
            <label>Input password</label>
            <input type='password' className='p-2' />
          </div>

          <div className='flex gap-8'>
            <button
              type='submit'
              className='text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2'
            >
              Submit
            </button>
            <button
              type='button'
              className='text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2'
              onClick={() => {
                closeModal();
              }}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className='bg-slate-900/50 fixed inset-0 flex justify-center items-center'>
      <div
        className={`p-6 max-w-[80%] flex flex-col items-center gap-8 bg-slate-100`}
      >
        <div className='text-4xl'>{message}</div>

        <button
          onClick={closeModal}
          className='text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2'
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default YourPage;
