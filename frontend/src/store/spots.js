
const SET_SPOTS = 'spots/setSpots';


const setSpots = (spots) => ({
  type: SET_SPOTS,
  spots
});


export const fetchAllSpots = () => async (dispatch) => {
  const res = await fetch('/api/spots');
  if (res.ok) {
    const data = await res.json();
    dispatch(setSpots(data.Spots)); 
  } else {

    console.error('Failed to fetch spots');
  }
};


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
