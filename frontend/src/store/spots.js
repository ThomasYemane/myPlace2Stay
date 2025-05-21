// Action Type
const SET_SPOTS = 'spots/setSpots';

// Action Creator
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

// Thunk - Fetch All Spots
export const fetchAllSpots = () => async (dispatch) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/spots`);
    if (res.ok) {
      const data = await res.json();
      dispatch(setSpots(data.Spots)); // extract the 'Spots' array
    } else {
      console.error('Failed to fetch spots');
    }
  } catch (error) {
    console.error('Error fetching spots:', error);
  }
};

// Reducer
const spotsReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_SPOTS:
      return action.spots;
    default:
      return state;
  }
};

export default spotsReducer;
