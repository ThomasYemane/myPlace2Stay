import { useEffect, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Rating from "react-rating";
import { FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { fetchAllSpots } from '../../store/spots';
import "./SpotsIndex.css"

function SpotsIndex() {
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spots);
  const spotsArr = Object.values(spots); 
  const navigate = useNavigate();
  const spotRef = useRef(null);

  const handleClick = (e) => {
    e.preventDefault();
    alert(e.target.id)
    navigate('/spot/'+e.target.id);
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
          <div key={spot.id} ref={spotRef} id={spot.id} onClick={handleClick}>
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
          </div>
        ))}
        </div>
    </div>
  );
}

export default SpotsIndex;
