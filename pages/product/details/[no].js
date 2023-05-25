const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getServerSideProps(context) {
  const { params } = context;
  const { no } = params;
  const response = await fetch(API_URL + "/product/" + no);
  const responseJson = await response.json();

  return {
    props: {
      responseJson,
    },
  };
}

function YourPage({ responseJson }) {
  console.log(responseJson);
  return (
    <div>
      <h1>hallo</h1>
    </div>
  );
}

export default YourPage;
