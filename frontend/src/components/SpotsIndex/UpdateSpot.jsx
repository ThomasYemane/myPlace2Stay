import { useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE_URL from '../../config/index';

function UpdateSpot(){
    const [country, setCountry] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [lng, setLng] = useState("");
    const [lat, setLat] = useState("");
    const [description, setDescription] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    //const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const navigate = useNavigate();
    const {id} = useParams();
    

    

    const handleUpdate = (e) => {
        e.preventDefault();
        const postData = async () => {
             try {
                const response = await fetch(`${API_BASE_URL}/api/spots/`+id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'XSRF-Token': Cookies.get('XSRF-TOKEN')
                },
                credentials: 'include',
                body: JSON.stringify({
                    country,
                    address,
                    city,
                    state,
                    lng,
                    lat,
                    description,
                    name,
                    price})
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
               navigate('/spot/'+id);
            } catch (err) {
                setErrors(err);
            } 

        };
        postData();
    };

     useEffect(() => {
                const fetchData = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/spots/`+id);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const jsonData = await response.json();
                    setCountry(jsonData.country);
                    setCity(jsonData.city);
                    setState(jsonData.state);
                    setAddress(jsonData.address);
                    setDescription(jsonData.description);
                    setLng(jsonData.lng);
                    setLat(jsonData.lat);
                    setName(jsonData.name);
                    setPrice(jsonData.price);
                } catch (err) {
                    setError(err);
                } finally {
                    setLoading(false);
                }
                };

                fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

      return (
    <>
      <h1>Update your Spot</h1>
      <form onSubmit={handleUpdate}>

         <h2>Where&apos;s your place located?</h2>

         <label>
          Country
          <input value={country} placeholder='Country' onChange={e => {setCountry(e.target.value); }} required />
        </label>
        {errors.country && <p>{errors.country}</p>}

         <label>
          Street Address
          <input value={address} placeholder='Street Address' onChange={e => {setAddress(e.target.value); }} required />
        </label>
        {errors.address && <p>{errors.address}</p>}

        <label>
          City
          <input value={city} placeholder='City' onChange={e => {setCity(e.target.value); }} required />
        </label>
        {errors.city && <p>{errors.city}</p>}

        <label>
          State
          <input value={state} placeholder='State' onChange={e => {setState(e.target.value); }} required />
        </label>
        {errors.state && <p>{errors.state}</p>}
        <label>
          Longtitude
          <input value={lng} placeholder='Longtitude' onChange={e => {setLng(e.target.value); }} required />
        </label>
        {errors.lng && <p>{errors.state}</p>}
        <label>
          Longtitude
          <input value={lat} placeholder='Latitude' onChange={e => {setLat(e.target.value); }} required />
        </label>
        {errors.lat && <p>{errors.state}</p>}

        
        <h2>Describe your place to guests</h2>
        <caption>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.</caption>
          <input value={description} placeholder="Please write at least 30 characters" onChange={e => {setDescription(e.target.value);}} required />
        {errors.description && <p>{errors.description}</p>}

       <h2>Create a title for your spot</h2>
        <caption>Catch guests&apos; attention with a spot title that highlights what makes your place special.</caption>

          <input value={name} placeholder='Name of your spot' onChange={e => {setName(e.target.value); }} required />
        {errors.name && <p>{errors.name}</p>}

        
        <h2>Set a base price for your spot</h2>
        <caption>Competitive pricing can help your listing stand out and rank higher in search results.</caption>
        <input value={price} placeholder='Price per night (USD)' onChange={e => {setPrice(e.target.value); }} required />
        {errors.price && <p>{errors.price}</p>}

        <button className='submitButton' type="submit">Update your Spot</button>
      </form>
    </>
  );
}

export default UpdateSpot;