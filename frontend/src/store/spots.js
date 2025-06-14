const SET_SPOTS = 'spots/setSpots';

const setSpots = (spots) => {
  const spotsObj = {};
  spots.forEach(spot => {
    spotsObj[spot.id] = spot;
  });
  return {
    type: SET_SPOTS,
    spots: spotsObj
  };
};

export const fetchAllSpots = () => async (dispatch) => {
  try {
const res = await fetch('http://localhost:8000/api/spots');
    if (res.ok) {
      const data = await res.json();
      dispatch(setSpots(data.Spots)); 
    } else {
      console.error('Failed to fetch spots');
    }
  } catch (error) {
    console.error('Error fetching spots:', error);
  }
};

const spotsReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_SPOTS:
      return action.spots;
    default:
      return state;
  }
};

export default spotsReducer;