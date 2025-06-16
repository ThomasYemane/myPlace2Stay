import { useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import "./SpotDetails.css"
import Rating from "react-rating";
import { FaStar } from "react-icons/fa";
import { Button } from 'react-bootstrap';
import { useSelector} from 'react-redux';
import API_BASE_URL from '../../config/index';

function formatDate(dateString) {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleString('default', { month: 'short', year: 'numeric' });
  return formattedDate;
}

function SpotDetails(){
    const [data, setData] = useState(null);
    const sessionUser = useSelector(state => state.session.user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState(null);
    const {id} = useParams();

    
    useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/spots/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();
      const reviewsRes = await fetch(`${API_BASE_URL}/api/reviews/${id}`);
      const reviewsData = await reviewsRes.json();
      setData(jsonData);
      setReviews(reviewsData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id]); 


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
      
    
    <br/>
    <div className='outer'>
          <div className='big'>
          <img className="detailsImage" src={data.SpotImages[0].url}></img>
              </div>
            <div className='wrap'>

              {(() => {
                      const arr = [];
                      for (let i = 1; i < data.SpotImages.length; i++) {
                          arr.push(
                              <div className='small'>
                                  <img className="detailsImage" src={data.SpotImages[i].url}></img>
                              </div>
                          );
                      }
                      return arr;
                  })()}

            </div>
    </div>
    
   
   
    <br/>
    <div className="detailContainer">
            <div class="details">
                  <p>Hosted By: {data.Owner.firstName} {data.Owner.lastName}</p>
                  <p>{data.description}</p>
          </div>

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

    </div>
    <div class="break"></div>
    <h1>Reviews: </h1>
     <Rating
            initialRating={data.avgStarRating}
            readonly
            emptySymbol={<FaStar color="gray" />}
            fullSymbol={<FaStar color="gold" />}
            fractions={2}
            /><span>&nbsp;{data.avgStarRating==="NaN"?"New":data.avgStarRating}&nbsp;{data.numReviews==0?"":"\u00B7 "+data.numReviews}&nbsp;{data.numReviews==0?"":data.numReviews==1?"Review":"Reviews"}</span>
       <div>
          {(() => {
                      const arr = [];
                      for (let i = 0; i < reviews.length; i++) {
                          arr.push(
                              <div>
                                  <p  style={{fontWeight:'bold'}} >{reviews[i].User.firstName}</p>
                                  <p>{formatDate(reviews[i].createdAt)}</p>
                                  <p>{reviews[i].review}</p>
                              </div>
                          );
                      }
                      return arr;
                  })()}

       </div>
    
   </div>  

   
    
    </>
  );

}

export default SpotDetails;