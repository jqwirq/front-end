import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DATA_LIMIT = 10;

export default function Page() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageNumbers, setPageNumbers] = useState([]);

  const productNoRef = useRef();

  const getProducts = () => {
    fetch(
      API_URL +
        `/products?limit=${DATA_LIMIT}&offset=${(currentPage - 1) * DATA_LIMIT}`
    )
      .then(res => res.json())
      .then(res => {
        setProducts(res.products);
        const newTotalPages = Math.ceil(res.total / DATA_LIMIT);
        setTotalPages(newTotalPages);

        const newPageNumbers = [];
        let leftBound = Math.max(currentPage - 2, 1);
        let rightBound = Math.min(leftBound + 4, newTotalPages);
        leftBound = Math.max(rightBound - 4, 1);

        for (let i = leftBound; i <= rightBound; i++) {
          newPageNumbers.push(i);
        }

        setPageNumbers(newPageNumbers);
      })
      .catch(err => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetch(
      API_URL +
        `/products?limit=${DATA_LIMIT}&offset=${(currentPage - 1) * DATA_LIMIT}`
    )
      .then(res => res.json())
      .then(res => {
        setProducts(res.products);
        const newTotalPages = Math.ceil(res.total / DATA_LIMIT);
        setTotalPages(newTotalPages);

        const newPageNumbers = [];
        let leftBound = Math.max(currentPage - 2, 1);
        let rightBound = Math.min(leftBound + 4, newTotalPages);
        leftBound = Math.max(rightBound - 4, 1);

        for (let i = leftBound; i <= rightBound; i++) {
          newPageNumbers.push(i);
        }

        setPageNumbers(newPageNumbers);
      })
      .catch(err => {
        console.error(err);
      });
  }, [currentPage]);

  const handleSearchProductSubmit = async e => {
    e.preventDefault();
    const no = productNoRef.current.value;
    fetch(
      API_URL +
        `/products?no=${no}&limit=${DATA_LIMIT}`
    )
      .then(res => res.json())
      .then(res => {
        setProducts(res.products);
        const newTotalPages = Math.ceil(res.total / DATA_LIMIT);
        setTotalPages(newTotalPages);

        const newPageNumbers = [];
        let leftBound = Math.max(currentPage - 2, 1);
        let rightBound = Math.min(leftBound + 4, newTotalPages);
        leftBound = Math.max(rightBound - 4, 1);

        for (let i = leftBound; i <= rightBound; i++) {
          newPageNumbers.push(i);
        }

        setPageNumbers(newPageNumbers);
      })
      .catch(err => {
        console.error(err);
      });
  };

  return (
    <>
      <div className='min-h-screen max-h-screen flex flex-col'>
        <div className='bg-slate-900 text-slate-200 basis-12 px-6 flex justify-between items-center'>
          <Link
            className='text-xl hover:text-slate-300 active:text-slate-200'
            href='/product'
          >
            back
          </Link>
        </div>

        <h1 className='text-5xl text-center pt-4'>Product List</h1>

        <div className='flex mt-8 mb-4 md:px-[8%] lg:px-[10%]'>
          <form
            onSubmit={handleSearchProductSubmit}
            className='flex items-center gap-6'
          >
            <label className='text-lg'>Search by product no.</label>
            <input
              ref={productNoRef}
              className='py-1 px-2 w-60 text-base border-2 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500'
              type='text'
            />
          </form>
        </div>

        <div className='grow flex flex-col gap-2 md:px-[8%] lg:px-[10%]'>
          {products.length === 0 && (
            <div className='text-center grow text-slate-400'>empty</div>
          )}

          {products.length !== 0 && (
            <>
              <table className='table-auto text-lg border-collapse'>
                <thead className='border-b-2 border-slate-950'>
                  <tr>
                    <th className='p-2'>Product No.</th>
                    <th className='p-2'>Created At</th>
                    <th className='p-2'>Updated At</th>
                    <th className='p-2'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((v, i) => {
                    let createdAt = new Date(v.createdAt);
                    let updatedAt = new Date(v.updatedAt);
                    return (
                      <>
                        <tr
                          className='text-center border-b border-slate-950'
                          key={v.no}
                        >
                          <td className='p-2'>{v.no}</td>
                          <td className='p-2'>
                            {createdAt.toLocaleString("en-UK", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className='p-2'>
                            {updatedAt.toLocaleString("en-UK", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className='p-2'>
                            {/* <Modal product={v} /> */}
                            <div className='flex justify-around'>
                              <Link
                                className='text-slate-600 hover:text-slate-500 active:text-slate-600'
                                href={`/product/details/${v.no}`}
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  strokeWidth={1.5}
                                  stroke='currentColor'
                                  className='h-6'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125'
                                  />
                                </svg>
                              </Link>

                              <TombolDelete
                                id={v._id}
                                getProducts={getProducts}
                              />
                            </div>
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
              <div className='text-lg flex justify-center gap-4 mt-4'>
                {currentPage > 1 && (
                  <button onClick={() => setCurrentPage(currentPage - 1)}>
                    &lt;
                  </button>
                )}

                {pageNumbers.map(number => (
                  <PageButton
                    key={number}
                    number={number}
                    currentPage={currentPage}
                    onPageChange={num => {
                      setCurrentPage(num);
                    }}
                  />
                ))}

                {currentPage < totalPages && (
                  <button onClick={() => setCurrentPage(currentPage + 1)}>
                    &gt;
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function PageButton({ number, currentPage, onPageChange }) {
  return (
    <button
      style={{ fontWeight: number === currentPage ? "bold" : "normal" }}
      onClick={() => onPageChange(number)}
    >
      {number}
    </button>
  );
}

function TombolDelete({ id, getProducts }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteSubmit = async e => {
    e.preventDefault();

    const password = e.target[0].value;

    try {
      const response = await fetch(API_URL + "/delete-product/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const responseJson = await response.json();
          alert(responseJson.message);
          return;
        }
      }

      // Success
      // const responseJson = await response.json();
      alert("Success");
      getProducts();
      closeModal();
    } catch (e) {
      console.error(e); // this is bad
    }
  };

  return (
    <>
      <button
        onClick={() => {
          openModal();
        }}
        className='text-slate-600 hover:text-slate-500 active:text-slate-600'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
          />
        </svg>
      </button>

      {isModalOpen && (
        <div className='bg-slate-900/50 fixed inset-0 flex justify-center items-center z-10'>
          <form
            onSubmit={e => handleDeleteSubmit(e, id)}
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
      )}
    </>
  );
}

function FeedbackModal({ message, closeModal, modalType, handleDeleteSubmit }) {
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
          onSubmit={handleDeleteSubmit}
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
