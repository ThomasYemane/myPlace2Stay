import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSpots } from '../../store/spots';

function SpotsIndex() {
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spots);
  const spotsArr = Object.values(spots); 

  useEffect(() => {
    dispatch(fetchAllSpots());
  }, [dispatch]);

  if (!spots || Object.keys(spots).length === 0) {
    return <h2>Loading...</h2>;
  }

  console.log("✅ spotsArr", spotsArr);

  return (
    <div>
      <h1>All Spots</h1>
      <ul>
        {spotsArr.map(spot => (
          <li key={spot.id}>
            <h3>{spot.name}</h3>
            <p>{spot.city}, {spot.state}</p>
            <p>${spot.price} per night</p>
            {spot.previewImage && (
              <img src={spot.previewImage} alt={spot.name} width="200" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SpotsIndex;
