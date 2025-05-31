import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);
  useDispatch();

  return (
    <div className='header'>
       <div className='left'>
                 <NavLink to="/"><img className='logo' src='/logo.png'/></NavLink>
        </div>
        <div className='right'>
                {isLoaded && (
                  <ProfileButton user={sessionUser} />
                  )}
          </div>
    </div>
  );
}

export default Navigation;