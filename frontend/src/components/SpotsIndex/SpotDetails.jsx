import { useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import Carousel from "react-gallery-carousel";
import "./SpotDetails.css"
import "react-gallery-carousel/dist/index.css";
import Rating from "react-rating";
import { FaStar } from "react-icons/fa";
import { Button } from 'react-bootstrap';
import { useSelector} from 'react-redux';

function SpotDetails(){
    const [data, setData] = useState(null);
    const sessionUser = useSelector(state => state.session.user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [spotImages, setSpotImages] = useState(null);
    const {id} = useParams();

    
    useEffect(() => {
                const fetchData = async () => {
                try {
                    const response = await fetch('https://myplace2stay.onrender.com/api/spots/'+id);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const jsonData = await response.json();
                    let newImages = jsonData.SpotImages.map((spotImage)=>({
                        src: spotImage.url
                    }));
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
      <h1>Location: {data.city}, {data.state}, {data.country}</h1>
      <h1>Reviews: </h1>
     <Rating
            initialRating={data.avgStarRating}
            readonly
            emptySymbol={<FaStar color="gray" />}
            fullSymbol={<FaStar color="gold" />}
            fractions={2}
            /><span>&nbsp;{data.avgStarRating==="NaN"?"New":data.avgStarRating}&nbsp;{data.numReviews==0?"":"\u00B7 "+data.numReviews}&nbsp;{data.numReviews==0?"":data.numReviews==1?"Review":"Reviews"}</span>
       <div>
        {  sessionUser && sessionUser.id != data.ownerId && 
            <Button>Post Your Review</Button>
        }
       </div>
    </div>  
    <br/>
    <Carousel images={spotImages} style={{height:400, width: 600, backgroundColor:'#a6d9ec'}} isMaximized={false} hasMediaButton={false}
    hasSizeButton={false} thumbnailWidth="25%" thumbnailHeight="25%" hasIndexBoard={false} hasRightButton={false}
    hasLeftButton={false}/>
    <br/>
    <p>Hosted By: {data.Owner.firstName} {data.Owner.lastName}</p>
    <p>{data.description}</p>

    <div className="callout">
  <div className="callout-container">

    <p>${data.price} per night</p>
    <div>
        <Rating
            initialRating={data.avgStarRating}
            readonly
            emptySymbol={<FaStar color="gray" />}
            fullSymbol={<FaStar color="gold" />}
            fractions={2}
            /><span>&nbsp;{data.avgStarRating==="NaN"?"New":data.avgStarRating}&nbsp;{data.numReviews==0?"":"\u00B7 "+data.numReviews}&nbsp;{data.numReviews==0?"":data.numReviews==1?"Review":"Reviews"}</span>
    </div>
    
    <button onClick={()=>alert("Feature coming soon")}>Reserve</button>
  </div>
</div>
    
    </>
  );

}

export default SpotDetails;