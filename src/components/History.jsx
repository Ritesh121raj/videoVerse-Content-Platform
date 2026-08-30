import { useEffect, useState } from "react";
import VideoGrid from "./VideoGrid";

function History() {

  const [history, setHistory] = useState([]);


  useEffect(() => {

    const savedHistory =
      JSON.parse(localStorage.getItem("history")) || [];

    setHistory(savedHistory);

  }, []);


  return (
    <>
      <h1>History</h1>

      {history.length === 0 ? (

        <p className="page-message">
          You haven't watched any videos yet.
        </p>

      ) : (

        <VideoGrid videos={history} />

      )}

    </>
  );
}

export default History;