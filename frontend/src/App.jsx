import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Spot from './components/SpotsIndex/SpotsIndex';
import * as sessionActions from './store/session';
import './App.css';

// ✅ TitleSetter component to set the browser tab title
function TitleSetter({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}

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
          <>
            <TitleSetter title="AiRbNb" />
            <div id="main">
              <div id="logo">
                <h1><Airbnb></Airbnb></h1>
              </div>
              <div id="spot">
                <Spot id="spot" />
              </div>
            </div>
          </>
        )
      }
    ]
  }
]);

// ✅ App root component
function App() {
  return <RouterProvider router={router} />;
}

export default App;
