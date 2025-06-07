import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Spot from './components/SpotsIndex/SpotsIndex';
import SpotDetails from './components/SpotsIndex/SpotDetails';
import UpdateSpot from './components/SpotsIndex/UpdateSpot';
import CreateSpot from './components/SpotsIndex/CreateSpot';
import ManageSpots from './components/SpotsIndex/ManageSpots';
import * as sessionActions from './store/session';
import './App.css';

// ✅ Layout component with session restoration
function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true);
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

// ✅ App routes
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (
          <div id="main">
            <div id="logo">
              <h1>Airbnb</h1>
            </div>
            <div id="spot">
              <Spot id="spot" />
            </div>
          </div>
        )
      },
      {
        path:"/spot/:id", element:(<SpotDetails />)
      },
      {
        path:"/spot/update/:id", element:(<UpdateSpot />)
      },
      {
        path:"/spot/new", element:(<CreateSpot />)
      },
       {
        path:"/spot/manage", element:(<ManageSpots />)
      }
    ]
  }
]);

// ✅ App root component
function App() {
  return <RouterProvider router={router} />;
}

export default App;

