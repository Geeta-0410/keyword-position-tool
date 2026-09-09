import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [keyword, setKeyword] = useState("");
  const [targetDomain, setTargetDomain] = useState("");

  const [results, setResults] = useState([]);
  const [matchingResults, setMatchingResults] = useState([]);

  const [position, setPosition] = useState(null);
  const [found, setFound] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // -------------------------
  // Search
  // -------------------------
  const searchKeyword = async () => {

    if (!keyword || !targetDomain) {

      setError(
        "Please enter keyword and target website"
      );

      return;
    }


    try {

      setLoading(true);

      setError("");


      const response = await axios.post(
        "http://localhost:5000/api/search",
        {
          keyword,
          targetDomain
        }
      );


      // SERP results
      setResults(
        response.data.results
      );


      // Matching keyword results
      setMatchingResults(
        response.data.matchingResults
      );


      // Website position
      setPosition(
        response.data.position
      );


      // Website found
      setFound(
        response.data.found
      );


    } catch (error) {

      console.error(error);

      setError(
        "Failed to fetch search results"
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="container">

      <h1>
        Keyword Position Checker
      </h1>


      {/* -------------------------
          Search Box
      ------------------------- */}

      <div className="search-box">

        <input
          type="text"
          placeholder="Enter keyword"
          value={keyword}
          onChange={(e) =>
            setKeyword(e.target.value)
          }
        />


        <input
          type="text"
          placeholder="Target website e.g. example.com"
          value={targetDomain}
          onChange={(e) =>
            setTargetDomain(e.target.value)
          }
        />


        <button
          onClick={searchKeyword}
        >

          {loading
            ? "Searching..."
            : "Search"}

        </button>

      </div>


      {/* -------------------------
          Error
      ------------------------- */}

      {error && (

        <div className="error">

          {error}

        </div>

      )}


      {results.length > 0 && (

        <>

          {/* -------------------------
              Website Position
          ------------------------- */}

          <div className="position-card">

            <h2>
              Keyword Position
            </h2>


            {found ? (

              <>

                <div className="position">

                  #{position}

                </div>

                <p>
                  Your website ranking
                </p>

              </>

            ) : (

              <>

                <div className="not-found">

                  Not Found

                </div>

                <p>
                  Website was not found
                  in search results
                </p>

              </>

            )}

          </div>


          {/* -------------------------
              MATCHING RESULTS
          ------------------------- */}

          {matchingResults.length > 0 && (

            <div className="matching-card">

              <h2>
                🎯 Matching Results
              </h2>

              <p className="matching-subtitle">
                Results matching your
                searched keyword
              </p>


              {matchingResults.map(
                (result) => (

                  <div
                    key={result.position}
                    className="matching-result"
                  >

                    <div className="matching-rank">

                      #{result.position}

                    </div>


                    <div>

                      <h3>

                        {result.isTarget &&
                          "⭐ "}

                        {result.title}

                      </h3>


                      <p className="domain">

                        {result.domain}

                      </p>


                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {result.url}
                      </a>

                    </div>

                  </div>

                )
              )}

            </div>

          )}


          {/* -------------------------
              SERP RESULTS
          ------------------------- */}

          <div className="results">

            <h2>
              Search Results
            </h2>


            {results.map(
              (result) => (

                <div
                  key={result.position}
                  className={`
                    result

                    ${
                      result.isTarget
                        ? "target-result"
                        : ""
                    }

                    ${
                      result.isKeywordMatch
                        ? "keyword-match"
                        : ""
                    }
                  `}
                >

                  <div className="rank">

                    #{result.position}

                  </div>


                  <div className="result-content">

                    <h3>

                      {result.isTarget &&
                        "⭐ "}

                      {result.isKeywordMatch &&
                        "🎯 "}

                      {result.title}

                    </h3>


                    <p className="domain">

                      {result.domain}

                    </p>


                    <p className="snippet">

                      {result.snippet}

                    </p>


                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >

                      {result.url}

                    </a>

                  </div>

                </div>

              )
            )}

          </div>

        </>

      )}

    </div>

  );
}

export default App;