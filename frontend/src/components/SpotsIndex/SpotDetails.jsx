import { useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import "./SpotDetails.css"
import Rating from "react-rating";
import { FaStar } from "react-icons/fa";
import API_BASE_URL from '../../config/index';
import Modal from 'react-modal';
import { Modal as Modal2, Button } from'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';

function formatDate(dateString) {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleString('default', { month: 'short', year: 'numeric' });
  return formattedDate;
}

function ConfirmPopup({ show, onDelete, onKeep, message, loading }) {
  return (
    <Modal2 show={show} onHide={onKeep}>
      <Modal2.Header closeButton>
        <Modal2.Title>Confirm Delete</Modal2.Title>
      </Modal2.Header>
      <Modal2.Body>
        {message}
      </Modal2.Body>
      <Modal2.Footer>
        <Button 
          style={{color:'red'}} 
          variant="primary" 
          onClick={onDelete}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Yes (Delete Review)'}
        </Button>
        <Button 
          style={{color:'grey'}} 
          variant="secondary" 
          onClick={onKeep}
          disabled={loading}
        >
          No (Keep Review)
        </Button>
      </Modal2.Footer>
    </Modal2>
  );
}

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

function SpotDetails(){
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState(null);
    const [reviews, setReviews] = useState(null);
    const [review, setReview] = useState(null);
    const [stars, setStars] = useState(0);
    const sessionUser = useSelector(state => state.session.user);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [show, setShow] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [currentReviewId, setCurrentReviewId] = useState(null);
    const {id} = useParams();


    const handleDeleteButton = (id) => {
      setCurrentReviewId(id);
      setShow(true);
  };

  const handleDelete = async () => {
    if (!currentReviewId) return;
    
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${currentReviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'XSRF-Token': Cookies.get('XSRF-TOKEN')
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
       setReviews(reviews.filter(review => review.id !== currentReviewId));
    } catch (err) {
      setError(err);
    } finally {
      setDeleteLoading(false);
      setShow(false);
      setCurrentReviewId(null);
    }
  };

  const handleKeep = () => {
    setShow(false);
    setCurrentReviewId(null);
  };

    function openModal() {
      setIsOpen(true);
    }

    function closeModal() {
      setIsOpen(false);
    }


    const postReview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'XSRF-Token': Cookies.get('XSRF-TOKEN')
        },
        credentials: 'include',
        body: JSON.stringify({ spotId: data.id, review: review, stars: Math.trunc(stars) })
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    } catch (err) {
      setErrors({ ...errors, image: err.message });
    }
  };

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
          {data.SpotImages.length>0 && <img className="detailsImage" src={data.SpotImages[0].url}></img>}
              </div>
            <div className='wrap'>

              {(() => {
                      const arr = [];
                      for (let i = 1; i < Math.min(5, data.SpotImages.length); i++) {
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
            <div className="details">
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
                    /><span>&nbsp;{data.avgStarRating==="NaN" || data.numReviews==0?"New":Math.round(data.avgStarRating*100)/100}&nbsp;{data.avgStarRating==="NaN" || data.numReviews==0?"":data.numReviews==1?"Review":"Reviews"}</span>
            </div>
            
            <button onClick={()=>alert("Feature coming soon")}>Reserve</button>
          </div>
</div>

    </div>
    <div className="break"></div>
    <h1>Reviews: </h1>
     <Rating
            initialRating={data.avgStarRating}
            readonly
            emptySymbol={<FaStar color="gray" />}
            fullSymbol={<FaStar color="gold" />}
            fractions={2}
            /><span>&nbsp;{data.avgStarRating==="NaN" || data.numReviews==0?"New":Math.round(data.avgStarRating*100)/100}&nbsp;{data.avgStarRating==="NaN" || data.numReviews==0?"":data.numReviews==1?"Review":"Reviews"}</span>
      <div>
        {
          sessionUser && sessionUser.id!==data.ownerId && reviews.map(item=>item.User.id).find(id=>id==sessionUser.id)!==sessionUser.id &&
           <button onClick={openModal}>Post your review</button>
          
        }
        <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
      >
        
        <button onClick={closeModal}>close</button>
        <div>How was your stay?</div>
        <form onSubmit={postReview}>
          <textarea  value={review}  onChange={e => setReview(e.target.value)} placeholder='Leave your review here ...' rows="5" cols="75"/>
           <Rating
            value={stars}
            onChange={(value) => setStars(value)}
            emptySymbol={<FaStar color="gray" />}
            fullSymbol={<FaStar color="gold" />}
            fractions={2}
            />
          <button type="submit">Submit Your Review</button>
        </form>
      </Modal>
      </div>
       <div>
          {(() => {
                      const arr = [];
                      for (let i = 0; i < reviews.length; i++) {
                          arr.push(
                              <div>
                                  <p  style={{fontWeight:'bold'}} >{reviews[i].User.firstName}</p>
                                  <p>{formatDate(reviews[i].createdAt)}</p>
                                  <div><span>{reviews[i].review}</span>&nbsp;&nbsp;&nbsp;&nbsp;
                                  {  sessionUser && sessionUser.id!==data.ownerId && sessionUser.id===reviews[i].User.id && <Button onClick={()=>handleDeleteButton(reviews[i].id)}>delete</Button>}
                                        <ConfirmPopup
                                            show={show}
                                            onDelete={handleDelete}
                                            onKeep={handleKeep}
                                            message="Are you sure you want to delete this review?"
                                            loading={deleteLoading} 
                                          />
                                  </div>
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