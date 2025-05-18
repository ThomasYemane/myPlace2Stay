// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import * as sessionActions from './store/session';
import { restoreCSRF } from './store/csrf';
import Navigation from './components/Navigation/Navigation';
import SpotsIndex from './components/SpotsIndex/SpotsIndex';
import LoginFormPage from './components/LoginFormPage';
import SignupFormModal from './components/SignupFormModal/SignupFormModal'; // ✅ Corrected import

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    restoreCSRF();
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

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <h1>Welcome!</h1>
      },
      {
        path: '/spots',
        element: <SpotsIndex />
      },
      {
        path: '/login',
        element: <LoginFormPage />
      },
      {
        path: '/signup', // ✅ Route for signup
        element: <SignupFormModal />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
