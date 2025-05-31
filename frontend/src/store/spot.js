// Action Type
const SET_SPOT = 'spots/setSpot'

// Action Creator
const setSpot = (data) => {
    return {
      type: SET_SPOT,
      spot: data
  };
}

// Thunk - Fetch Spot by Id
export const fetchSpotById = () => async (dispatch) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/spots/2`);
    if (res.ok) {
      const data = await res.json();
      dispatch(setSpot(data)); 
    } else {
      console.error('Failed to fetch spots');
    }
  } catch (error) {
    console.error('Error fetching spots:', error);
  }
};

// Reducer
const spotReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_SPOT:
      return action.spot;
    default:
      return state;
  }
};

export default spotReducer;
