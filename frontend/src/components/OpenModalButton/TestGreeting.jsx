// frontend/src/components/OpenModalButton/TestGreeting.jsx

import OpenModalButton from './OpenModalButton';

function TestGreeting() {
  return (
    <OpenModalButton
      buttonText="Greeting"
      modalComponent={<h2>Hello World!</h2>}
      onButtonClick={() => console.log("Greeting initiated")}
      onModalClose={() => console.log("Greeting closed")}
    />
  );
}

export default TestGreeting;
