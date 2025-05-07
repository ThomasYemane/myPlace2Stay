// frontend/src/components/LoginForm.jsx

import { useState } from 'react';
// import React, { useState } from 'react'; i dont need this for now so i commented it
import { useDispatch } from 'react-redux';
import { login } from '../store/session';

function LoginForm() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      await dispatch(login({ credential, password }));
      // Optionally redirect or close modal here
    } catch (res) {
      if (res.status >= 400) {
        const data = await res.json();
        if (data?.errors) setErrors(data.errors);
        else setErrors([data.message || "Login failed."]);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Log In</h2>
      <ul>
        {errors.map((error, i) => <li key={i}>{error}</li>)}
      </ul>
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
      <button type="submit">Log In</button>
    </form>
  );
}

export default LoginForm;
