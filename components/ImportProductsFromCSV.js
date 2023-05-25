import { useState, useRef, useEffect } from "react";
import { parse } from "csv-parse";

const PRODUCT_NO_CSV_HEADER = "product no";
const MATERIAL_NO_CSV_HEADER = "material no";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CSV() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [message, setMessage] = useState("");

  const fileInput = useRef();

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
    setProducts([]);
    fileInput.current.value = "";
  };

  const handleFileChange = (event) => {
    const files = event.target.files;

    if (files.length === 0) {
      openModal(0, "Please select a file!");
      return;
    }

    const targetFile = files[0];

    // Check if the file extension is not csv
    if (targetFile.name.split(".").pop().toLowerCase() !== "csv") {
      console.error("Invalid file type. Please select a csv file");
      return;
    }

    setIsLoading(true);

    const fileReader = new FileReader();
    fileReader.readAsText(targetFile);

    fileReader.onload = () => {
      const fileContent = fileReader.result;

      // Check if the csv file is empty
      if (!fileContent.trim()) {
        console.error("The file is empty");
        setIsLoading(false);
        return;
      }

      parse(fileContent, { columns: true }, (err, records) => {
        setIsLoading(false);

        if (err) {
          console.error(err); // This error handling is bad, i'll fix it later
          return;
        } else {
          // Check if the csv header is not the same as variable
          const firstRecord = records[0];
          if (
            !firstRecord.hasOwnProperty(PRODUCT_NO_CSV_HEADER) ||
            !firstRecord.hasOwnProperty(MATERIAL_NO_CSV_HEADER)
          ) {
            console.error("Invalid CSV header");
            return;
          }

          const updatedRecords = records.reduce((acc, record, index) => {
            const productNo = record[PRODUCT_NO_CSV_HEADER];
            const materialNo = record[MATERIAL_NO_CSV_HEADER];

            if (!productNo && acc.length > 0) {
              acc[acc.length - 1].materialsNo.push(materialNo);
            } else {
              acc.push({
                productNo,
                materialsNo: [materialNo],
              });
            }

            return acc;
          }, []);

          // Check if at least one product with one material exists
          if (
            !updatedRecords.some(
              (record) =>
                record.productNo &&
                record.materialsNo &&
                record.materialsNo.length > 0
            )
          ) {
            console.error(
              "At least one product with one material must be present in the CSV file"
            );
            return;
          }

          setProducts((state) => {
            return [...state, ...updatedRecords];
          });
        }
      });
    };
  };

  const handleClickSubmit = async () => {
    try {
      if (products.length === 0) {
        openModal(
          0,
          "No data. please make sure you select a file before submitting!"
        );
        return;
      }

      const response = await fetch(API_URL + "/products-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: products,
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const responseJson = await response.json();
          openModal(0, responseJson.message);
          emptyField();
          return;
        }
      }

      const responseJson = await response.json();
      openModal(0, responseJson.message);
      emptyField();
    } catch (e) {
      console.error(e); //this is bad
    }
  };

  useEffect(() => {
    console.log("products useEffect");
    console.log(products);
  }, [products]);

  return (
    <>
      <input
        ref={fileInput}
        className="py-4 text-5xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 cursor-pointer"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <button
        className="py-4 text-5xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300"
        onClick={handleClickSubmit}
      >
        Submit
      </button>

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
        className={`p-6 max-w-[80%] flex flex-col items-center gap-8 ${bgColor}`}
      >
        <div className="text-4xl">{message}</div>

        <button
          onClick={closeModal}
          className="text-3xl bg-slate-300 hover:bg-slate-400 active:bg-slate-300 p-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
