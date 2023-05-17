import { useState, useRef, useEffect } from "react";
import { parse } from "csv-parse";

const PRODUCT_NO_CSV_HEADER = "product no";
const MATERIAL_NO_CSV_HEADER = "material no";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CSV() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInput = useRef();

  const handleFileChange = (event) => {
    const files = event.target.files;

    if (files.length === 0) {
      console.error("Please select a file");
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

  const handleClick = async () => {
    try {
      const response = await fetch(API_URL + "/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: products,
        }),
      });
      console.log(response);
      const data = await response.json();
      console.log(data);
    } catch (e) {
      console.error(e);
    }

    if (products.length === 0) {
      console.error("Fuck you");
      return;
    }

    setProducts([]);
    fileInput.current.value = "";
  };

  useEffect(() => {
    console.log("useEffect");
    console.log(products);
  }, [products]);

  return (
    <>
      <input
        ref={fileInput}
        className="cursor-pointer bg-slate-300 p-2 rounded-md"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={isLoading}
      />

      <button className="w-[50%] p-2" onClick={handleClick}>
        Submit
      </button>
    </>
  );
}
