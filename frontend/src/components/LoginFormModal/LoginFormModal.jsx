import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginFormModal.css';


function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { closeModal } = useModal();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setError(data.errors);
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
            onChange={(e) => {setCredential(e.target.value); setIsButtonDisabled(credential.length<4 || password.length<6)}}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => {setPassword(e.target.value); setIsButtonDisabled(credential.length<4 || password.length<6)}}
            required
          />
        </label> {error && (
          <p>{error}</p>
        )}
        <button className='submitButton' disabled={isButtonDisabled} type="submit">Log In</button>
      </form>
    </>
  );
}

export default LoginFormModal;