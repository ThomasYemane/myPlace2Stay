import { useEffect, useState, useRef} from 'react';
import { useParams } from 'react-router-dom';
import ImageGallery from "react-image-gallery";
import "./SpotDetails.css"
import "react-image-gallery/styles/css/image-gallery.css";

function SpotDetails(){
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [spotImages, setSpotImages] = useState(null);
    const {id} = useParams();

    
    useEffect(() => {
                const fetchData = async () => {
                try {
                    const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/api/spots/'+id);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const jsonData = await response.json();
                    let images = jsonData.SpotImages;
                    let newImages = []
                    for(var i=0; i<images.length; i++){
                        newImages.push({'original':images[i].url, 'thumbnail': images[i].url})
                    }
                    setSpotImages(newImages);
                    setData(jsonData);
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
    <div className='spotDetails'>
      <h1>{data.name}</h1>
      <p>Location: {data.city}, {data.state}, {data.country}</p>
    </div>  
    <p>{data.numReviews}</p>
    <div className="image-gallery-wrapper">
        <ImageGallery items={spotImages}  showNav={false} showPlayButton={false} showFullscreenButton={false}/>
    </div>
    
    </>
  );

}

export default SpotDetails;