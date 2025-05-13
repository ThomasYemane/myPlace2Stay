// frontend/src/store/spots.js

// Action Types
const SET_SPOTS = 'spots/setSpots';

// Action Creator
const setSpots = (spots) => ({
  type: SET_SPOTS,
  spots
});

// Thunk: Fetch all spots
export const fetchAllSpots = () => async (dispatch) => {
  const res = await fetch('/api/spots');
  if (res.ok) {
    const data = await res.json();
    dispatch(setSpots(data.Spots)); // Extract the array from { Spots: [...] }
  } else {
    // Optional: Handle errors
    console.error('Failed to fetch spots');
  }
};

// Reducer
const spotsReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_SPOTS: {
      const newState = {};
      action.spots.forEach(spot => {
        newState[spot.id] = spot;
      });
      return newState;
    }
    default:
      return state;
  }
};

export default spotsReducer;
