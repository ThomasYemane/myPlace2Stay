import { useEffect, useState} from 'react';
import Rating from "react-rating";
import { FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import Cookies from 'js-cookie';
import "./SpotsIndex.css";


function ConfirmPopup({ show, onDelete, onKeep, message }) {
  return (
    <Modal show={show} onHide={onKeep}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message}
      </Modal.Body>
      <Modal.Footer>
        <Button style={{color:'red'}} variant="primary" onClick={onDelete}>
          Yes (Delete Spot)
        </Button>
        <Button style={{color:'grey'}} variant="secondary" onClick={onKeep}>
          No (Keep Spot)
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function ManageSpots() {
  const navigate = useNavigate();
  const [isEmpty, setIsEmpty] = useState(true);
  const [spotsArr, setSpotsArr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [popupCallback, setPopupCallback] = useState(() => {});

  const fetchData = async () => {
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/api/spots/current', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'XSRF-Token': Cookies.get('XSRF-TOKEN')
        },
      credentials: 'include'});
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();
        setIsEmpty(jsonData.Spots.length==0);
        setSpotsArr(jsonData.Spots);
    } catch (err) {
        setError(err);
    } finally {
        setLoading(false);
    }
    };


  const handleUpdateButton = (id) => {
    navigate('/spot/update/'+id);
  };

  const handleDeleteButton = (id) => {
     openPopup(()=>{
          const deleteSpot = async () => {
              try {
                const response = await fetch(import.meta.env.VITE_BACKEND_URL+'/api/spots/'+id, {
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
                fetchData();
            } catch (err) {
                setError(err);
            } 

        };
        deleteSpot();
     });
  }

  const openPopup = (callback) => {
    setPopupCallback(() => callback);
    setShow(true);
  };

  const handleDelete = () => {
    popupCallback();
    setShow(false);
  };

  const handlekeep = () => {
    setShow(false);
  };

  

  useEffect(() => {
       fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }


  return (
    <div>
      {!isEmpty && 
      (
        <div>
            <h1>All Spots</h1>
        <div className="container">
        {spotsArr.map(spot => (
          <div key={spot.id} id={spot.id}>
            <h3>{spot.name}</h3>
            {spot.previewImage && (
              <img  id={spot.id}  src={spot.previewImage} alt={spot.name} width="200"/>
            )}
            <p>{spot.city}, {spot.state}</p>
            <p>${spot.price} per night</p>
            <Rating
              initialRating={spot.avgRating}
              readonly
              emptySymbol={<FaStar color="gray" />}
              fullSymbol={<FaStar color="gold" />}
              fractions={2}
            /><span>   {spot.avgRating==="NaN"?"New":spot.avgRating}</span>
            <div>
              <div>
                    <Button onClick={()=>handleUpdateButton(spot.id)}>Update</Button>
                </div>
                <br/>
                <div>
                    <Button onClick={()=>{handleDeleteButton(spot.id)}}>Delete</Button>
                     <ConfirmPopup
                      show={show}
                      onDelete={handleDelete}
                      onKeep={handlekeep}
                      message="Are you sure you want to remove this spot?"
                    />
                </div>
            </div>
          </div>
        ))}
       
        </div>
        </div>
      )
      }
      
    </div>
  );
}

export default ManageSpots;
