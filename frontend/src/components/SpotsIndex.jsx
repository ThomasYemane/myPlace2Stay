
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSpots } from '../store/spots';

function SpotsIndex() {
  const dispatch = useDispatch();


  const spots = useSelector((state) => Object.values(state.spots));

  useEffect(() => {
    dispatch(fetchAllSpots());
  }, [dispatch]);

  return (
    <div>
      <h2>All Spots</h2>
      {spots.length === 0 ? (
        <p>No spots available yet.</p>
      ) : (
        <ul>
          {spots.map((spot) => (
            <li key={spot.id}>
              {spot.name} - ${spot.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SpotsIndex;
