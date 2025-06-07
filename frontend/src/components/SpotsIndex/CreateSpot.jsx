import { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

function CreateSpot() {
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [image4, setImage4] = useState("");
  const [image5, setImage5] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const postImage = async (image, spotId) => {
    try {
      const response = await fetch(`${API_BASE}/api/spots/${spotId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'XSRF-Token': Cookies.get('XSRF-TOKEN')
        },
        credentials: 'include',
        body: JSON.stringify({ url: image.url, preview: image.preview })
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    } catch (err) {
      setErrors({ ...errors, image: err.message });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const postData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/spots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'XSRF-Token': Cookies.get('XSRF-TOKEN')
          },
          credentials: 'include',
          body: JSON.stringify({
            country, address, city, state, lng, lat, description, name, price
          })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const jsonData = await response.json();

        await postImage({ url: image1, preview: true }, jsonData.id);
        if (image2) await postImage({ url: image2, preview: false }, jsonData.id);
        if (image3) await postImage({ url: image3, preview: false }, jsonData.id);
        if (image4) await postImage({ url: image4, preview: false }, jsonData.id);
        if (image5) await postImage({ url: image5, preview: false }, jsonData.id);

        navigate('/spot/' + jsonData.id);
      } catch (err) {
        setErrors({ ...errors, submit: err.message });
      }
    };
    postData();
  };

  return (
    <>
      <h1>Create a New Spot</h1>
      <form onSubmit={handleSubmit}>
        <h2>Where’s your place located?</h2>

        <label>Country
          <input value={country} placeholder='Country' onChange={e => setCountry(e.target.value)} required />
        </label>

        <label>Street Address
          <input value={address} placeholder='Street Address' onChange={e => setAddress(e.target.value)} required />
        </label>

        <label>City
          <input value={city} placeholder='City' onChange={e => setCity(e.target.value)} required />
        </label>

        <label>State
          <input value={state} placeholder='State' onChange={e => setState(e.target.value)} required />
        </label>

        <label>Longitude
          <input value={lng} placeholder='Longitude' onChange={e => setLng(e.target.value)} required />
        </label>

        <label>Latitude
          <input value={lat} placeholder='Latitude' onChange={e => setLat(e.target.value)} required />
        </label>

        <h2>Describe your place to guests</h2>
        <p>Mention features, amenities, and what you love about the neighborhood.</p>
        <input value={description} placeholder="Write at least 30 characters" onChange={e => setDescription(e.target.value)} required />

        <h2>Create a title for your spot</h2>
        <p>Highlight what makes your place special.</p>
        <input value={name} placeholder='Name of your spot' onChange={e => setName(e.target.value)} required />

        <h2>Set a base price for your spot</h2>
        <p>Competitive pricing helps you stand out.</p>
        <input value={price} placeholder='Price per night (USD)' onChange={e => setPrice(e.target.value)} required />

        <h2>Liven up your spot with photos</h2>
        <p>Submit at least one image URL.</p>
        <input value={image1} placeholder='Preview Image URL' onChange={e => setImage1(e.target.value)} required />
        <input value={image2} placeholder='Image URL' onChange={e => setImage2(e.target.value)} />
        <input value={image3} placeholder='Image URL' onChange={e => setImage3(e.target.value)} />
        <input value={image4} placeholder='Image URL' onChange={e => setImage4(e.target.value)} />
        <input value={image5} placeholder='Image URL' onChange={e => setImage5(e.target.value)} />

        {errors.submit && <p className="error">{errors.submit}</p>}
        {errors.image && <p className="error">{errors.image}</p>}

        <button className='submitButton' type="submit">Create Spot</button>
      </form>
    </>
  );
}

export default CreateSpot;
