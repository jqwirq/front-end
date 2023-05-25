import { useRouter } from "next/router";
import { useEffect } from "react";

function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push("/product");
  }, []);

  return (
    <>
      <div></div>
    </>
  );
}

export default Page;
