
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import { useModal } from '../../context/Modal';
import './LoginFormModal.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);

    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        try {
          const data = await res.json();
          if (data?.errors) {
            setErrors(data.errors); 
          } else {
            setErrors(['Login failed. Please try again.']);
          }
        } catch {
          setErrors(['An unexpected error occurred.']);
        }
      });
  };

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {/* Show ALL errors */}
        <div className="error-list">
          {errors.map((error, i) => (
            <p key={i} className="error">{error}</p>
          ))}
        </div>

        <button type="submit">Log In</button>
      </form>
    </>
  );
}

export default LoginFormModal;
