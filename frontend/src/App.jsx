import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Spot from './components/SpotsIndex/SpotsIndex'
import * as sessionActions from './store/session';
import './App.css'

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}


const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (<><div id='main'>
                        <div id='logo'>
                            <h1>AirB&B</h1>
                          </div>
                        <div id='spot'>
                            <Spot id="spot"/>
                        </div>
                      </div>
                  </>)
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;