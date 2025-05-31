import { useEffect, useState} from 'react';
import Rating from "react-rating";
import { FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { fetchAllSpots } from '../../store/spots';
import Cookies from 'js-cookie';
import "./SpotsIndex.css"

function SpotsIndex() {
  const navigate = useNavigate();
  const [spotsArr, setSpotsArr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
                const fetchData = async () => {
                try {
                    const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/api/spots/current', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Cookie':'XSRF-TOKEN=I9HpLu2t-eDtpDCV40iJ73X4hS8STBlAeu2U; _csrf=_K9bWzDubDNbneyfIgLnzoGD; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjo0LCJlbWFpbCI6ImRlbW9AdXNlci5pbyIsInVzZXJuYW1lIjoiRGVtby1saXRpb24iLCJmaXJzdE5hbWUiOiJEZW1vIiwibGFzdE5hbWUiOiJVc2VyIn0sImlhdCI6MTc0ODcyMzU2MSwiZXhwIjoxNzQ5MzI4MzYxfQ.QKtFBzD75hdcGfYGwBeozmfiC9eijEkRQmHrhvaTeQQ'
                    }});
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const jsonData = await response.json();
                    setSpotsArr(Object.values(jsonData));
                } catch (err) {
                    setError(err);
                } finally {
                    setLoading(false);
                }
                };

                fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const handleClick = (id) => {
    navigate('/spot/'+id);
  };

  useEffect(() => {
    dispatch(fetchAllSpots());
  }, [dispatch]);

  if (!spots || Object.keys(spots).length === 0) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>All Spots</h1>
        <div className="container">
        {spotsArr.map(spot => (
          <div key={spot.id} ref={spotRef} id={spot.id} onClick={()=>handleClick(spot.id)}>
            <h3>{spot.name}</h3>
            {spot.previewImage && (
              <img  id={spot.id}  src={spot.previewImage} alt={spot.name} width="200"/>
            )}
            <p>{spot.city}, {spot.state}</p>
            <p>${spot.price} per night</p>
            <Rating
              initialRating={spot.avgRating}
              readonly
              emptySymbol={<FaStar color="gray" />}
              fullSymbol={<FaStar color="gold" />}
              fractions={2}
            /><span>   {spot.avgRating==="NaN"?"New":spot.avgRating}</span>
            <div>
              <div>
                <button>Update</button>
                </div>
                <br/>
                <div>
                <button>Delete</button>
                </div>
            </div>
          </div>
        ))}
       
        </div>
    </div>
  );
}

export default SpotsIndex;
