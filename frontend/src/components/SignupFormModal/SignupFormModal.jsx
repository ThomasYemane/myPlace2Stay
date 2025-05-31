
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import { useModal } from '../../context/Modal';
import './SignupFormModal.css';


function SignupFormModal() {
  const dispatch = useDispatch();
  const { closeModal } = useModal(); 

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (password === confirmPassword) {
    setErrors({});
    try {
      const res = await dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password
        })
      );
      closeModal();
    } catch (res) {
      let data;
      try {
        data = await res.json();
      } catch {
        data = { errors: ['Signup failed unexpectedly.'] };
      }
      if (data?.errors) {
        setErrors(data.errors);
      }
    }
  } else {
    setErrors({
      confirmPassword: "Confirm Password field must match Password"
    });
  }
};


  return (
    <>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input value={email} onChange={e => {setEmail(e.target.value); setIsButtonDisabled(email.length==0 || username.length<4 || firstName.length==0 ||
      lastName.length==0 || password.length<6)}} required />
        </label>
        {errors.email && <p>{errors.email}</p>}

        <label>
          Username
          <input value={username} onChange={e => {setUsername(e.target.value); setIsButtonDisabled(email.length==0 || username.length<4 || firstName.length==0 ||
      lastName.length==0 || password.length<6)}} required />
        </label>
        {errors.username && <p>{errors.username}</p>}

        <label>
          First Name
          <input value={firstName} onChange={e => {setFirstName(e.target.value); setIsButtonDisabled(email.length==0 || username.length<4 || firstName.length==0 ||
      lastName.length==0 || password.length<6)}} required />
        </label>
        {errors.firstName && <p>{errors.firstName}</p>}

        <label>
          Last Name
          <input value={lastName} onChange={e => {setLastName(e.target.value); setIsButtonDisabled(email.length==0 || username.length<4 || firstName.length==0 ||
      lastName.length==0 || password.length<6)}} required />
        </label>
        {errors.lastName && <p>{errors.lastName}</p>}

        <label>
          Password
          <input type="password" value={password} onChange={e => {setPassword(e.target.value); setIsButtonDisabled(email.length==0 || username.length<4 || firstName.length==0 ||
      lastName.length==0 || password.length<6)}} required />
        </label>
        {errors.password && <p>{errors.password}</p>}

        <label>
          Confirm Password
          <input type="password" value={confirmPassword} onChange={e => {setConfirmPassword(e.target.value); setIsButtonDisabled(email.length==0 || username.length<4 || firstName.length==0 ||
      lastName.length==0 || password.length<6)}} required />
        </label>
        {errors.confirmPassword && <p>{errors.confirmPassword}</p>}

        <button className='submitButton' disabled={isButtonDisabled} type="submit">Sign Up</button>
      </form>
    </>
  );
}

export default SignupFormModal;
