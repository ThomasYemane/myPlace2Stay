import { useState} from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

function CreateSpot(){
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
    //const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const navigate = useNavigate();

    const postImage = async (image, spotId) => {
        try{
            const response = await fetch('https://myplace2stay.onrender.com/api/spots/'+spotId+'/images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'XSRF-Token': Cookies.get('XSRF-TOKEN')
            },
            credentials: 'include',
            body: JSON.stringify({url: image.url, preview: image.preview})
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }catch(err){
                setErrors(err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const postData = async () => {
             try {
                const response = await fetch('https://myplace2stay.onrender.com/api/spots', {
                method: 'POST',
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
                const jsonData = await response.json();
                alert(jsonData.id);
                postImage({url:image1, preview:true}, jsonData.id).then(()=>{
                      if(image2) postImage({url:image2, preview:false}, jsonData.id);
                      if(image3) postImage({url:image3, preview:false}, jsonData.id);
                      if(image4) postImage({url:image4, preview:false}, jsonData.id);
                      if(image5) postImage({url:image5, preview:false}, jsonData.id);
                }).then(()=>{
                  navigate('/spot/'+jsonData.id);
                });
               
            } catch (err) {
                setErrors(err);
            } 

        };
        postData();
    };
      return (
    <>
      <h1>Create a New Spot</h1>
      <form onSubmit={handleSubmit}>

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

        <h2>Liven up your spot with photos</h2>
        <caption>Submit a link to at least one photo to publish your spot.</caption>
        <input value={image1} placeholder='Preview Image URL' onChange={e => {setImage1(e.target.value); }} required />
        {errors.url && <p>{errors.url}</p>}
         <input value={image2} placeholder='Image URL' onChange={e => {setImage2(e.target.value);}} />
        {errors.url && <p>{errors.url}</p>}
         <input value={image3} placeholder='Image URL' onChange={e => {setImage3(e.target.value); }}  />
        {errors.url && <p>{errors.url}</p>}
         <input value={image4} placeholder='Image URL' onChange={e => {setImage4(e.target.value); }}  />
        {errors.url && <p>{errors.url}</p>}
         <input value={image5} placeholder='Image URL' onChange={e => {setImage5(e.target.value); }}  />
        {errors.url && <p>{errors.url}</p>}
        

        <button className='submitButton' type="submit">Create Spot</button>
      </form>
    </>
  );
}

export default CreateSpot;