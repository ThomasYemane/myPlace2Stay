import { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import "./CreateSpot.css"
import API_BASE_URL from '../../config/index';

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
  const[url, setUrl] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [image4, setImage4] = useState("");
  const [errors, setErrors] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors("");
    const postData = async () => {
      try {
        const images = [];
        if(URL.canParse(image1)){
          images.push(image1);
        }
        if(URL.canParse(image2)){
          images.push(image2);
        }
        if(URL.canParse(image3)){
          images.push(image3);
        }
        if(URL.canParse(image4)){
          images.push(image4);
        }
        const response = await fetch(`${API_BASE_URL}/api/spots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'XSRF-Token': Cookies.get('XSRF-TOKEN')
          },
          credentials: 'include',
          body: JSON.stringify({
            country, address, city, state, lng, lat, description, name, price, url,
            'images': images
          })
        });
        if(response.status==201){
            const jsonData = await response.json();
            navigate('/spot/' + jsonData.id);
        }else{
            const errorData = await response.json();
            setErrors(errorData.errors);
        }
      } catch (err) {
        console.error('Submission error:', err);
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
          <input value={country} placeholder='Country' onChange={e => setCountry(e.target.value)} />
        </label>
        {errors.country && <p className='error'>{errors.country}</p>}

        <label>Street Address
          <input value={address} placeholder='Street Address' onChange={e => setAddress(e.target.value)} />
        </label>
        {errors.address && <p className='error'>{errors.address}</p>}

        <label>City
          <input value={city} placeholder='City' onChange={e => setCity(e.target.value)}  />
        </label>
        {errors.city && <p className='error'>{errors.city}</p>}

        <label>State
          <input value={state} placeholder='State' onChange={e => setState(e.target.value)}  />
        </label>
        {errors.state && <p className='error'>{errors.state}</p>}

        <label>Longitude
          <input value={lng} placeholder='Longitude' onChange={e => setLng(e.target.value)}  />
        </label>
        {errors.lng && <p className='error'>{errors.lng}</p>}

        <label>Latitude
          <input value={lat} placeholder='Latitude' onChange={e => setLat(e.target.value)}  />
        </label>
        {errors.lat && <p className='error'>{errors.lat}</p>}

        <h2>Describe your place to guests</h2>
        <p>Mention features, amenities, and what you love about the neighborhood.</p>
        <input value={description} placeholder="Write at least 30 characters" onChange={e => setDescription(e.target.value)} />
        {errors.description && <p className='error'>{errors.description}</p>}

        <h2>Create a title for your spot</h2>
        <p>Highlight what makes your place special.</p>
        <input value={name} placeholder='Name of your spot' onChange={e => setName(e.target.value)}  />
        {errors.name && <p className='error'>{errors.name}</p>}

        <h2>Set a base price for your spot</h2>
        <p>Competitive pricing helps you stand out.</p>
        <input value={price} placeholder='Price per night (USD)' onChange={e => setPrice(e.target.value)}  />
        {errors.price && <p className='error'>{errors.price}</p>}

        <h2>Liven up your spot with photos</h2>
        <p>Submit at least one image URL.</p>
        <input value={url} placeholder='Preview Image URL' onChange={e => setUrl(e.target.value)}/>
         {errors.url && <p className='error'>{errors.url}</p>}
        <input value={image1} placeholder='Image URL' onChange={e => setImage1(e.target.value)} />
        <input value={image2} placeholder='Image URL' onChange={e => setImage2(e.target.value)} />
        <input value={image3} placeholder='Image URL' onChange={e => setImage3(e.target.value)} />
        <input value={image4} placeholder='Image URL' onChange={e => setImage4(e.target.value)} />
        

        <button className='submitButton' type="submit">Create Spot</button>
      </form>
    </>
  );
}

export default CreateSpot;
