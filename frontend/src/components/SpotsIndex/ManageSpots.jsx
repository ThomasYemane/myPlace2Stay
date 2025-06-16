import { useEffect, useState} from 'react';
import Rating from "react-rating";
import { FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import Cookies from 'js-cookie';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import "./SpotsIndex.css";
import API_BASE_URL from '../../config/index';

function ConfirmPopup({ show, onDelete, onKeep, message, loading }) {
  return (
    <Modal show={show} onHide={onKeep}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          style={{color:'red'}} 
          variant="primary" 
          onClick={onDelete}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Yes (Delete Spot)'}
        </Button>
        <Button 
          style={{color:'grey'}} 
          variant="secondary" 
          onClick={onKeep}
          disabled={loading}
        >
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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentSpotId, setCurrentSpotId] = useState(null);

  const fetchData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/spots/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'XSRF-Token': Cookies.get('XSRF-TOKEN')
      },
      credentials: 'include'
    });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      setIsEmpty(jsonData.Spots.length === 0);
      setSpotsArr(jsonData.Spots);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateButton = (id) => {
    navigate('/spot/update/' + id);
  };

  const handleDeleteButton = (id) => {
    setCurrentSpotId(id);
    setShow(true);
  };

  const handleDelete = async () => {
    if (!currentSpotId) return;
    
    setDeleteLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/spots/${currentSpotId}`, {
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
      
      // Remove the deleted spot from the current state immediately
      setSpotsArr(prevSpots => prevSpots.filter(spot => spot.id !== currentSpotId));
      
      // Also refresh data from server to ensure consistency
      await fetchData();
      
    } catch (err) {
      setError(err);
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
      setShow(false);
      setCurrentSpotId(null);
    }
  };

  const handleKeep = () => {
    setShow(false);
    setCurrentSpotId(null);
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
    <div className='main'>
      {!isEmpty && (
        <div>
          <h1>All Spots</h1>
          <div className="container">
            {spotsArr.map(spot => (
              <div  className="tile" key={spot.id} id={spot.id} data-tooltip-id="my-tooltip" data-tooltip-content={spot.name}>
                <h3>{spot.name}</h3>
                {spot.previewImage && (
                  <img id={spot.id} src={spot.previewImage} alt={spot.name} width="200" />
                )}
                <p>{spot.city}, {spot.state}</p>
                <p>${spot.price} per night</p>
                <Rating
                  initialRating={spot.avgRating}
                  readonly
                  emptySymbol={<FaStar color="gray" />}
                  fullSymbol={<FaStar color="gold" />}
                  fractions={2}
                />
                <span>   {spot.avgRating === "NaN" ? "New" : spot.avgRating}</span>
                <div>
                  <div>
                    <Button onClick={() => handleUpdateButton(spot.id)}>Update</Button>
                  </div>
                  <br/>
                  <div>
                    <Button onClick={() => handleDeleteButton(spot.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <ConfirmPopup
            show={show}
            onDelete={handleDelete}
            onKeep={handleKeep}
            message="Are you sure you want to remove this spot?"
            loading={deleteLoading}
          />
        </div>
      )}
       <Tooltip id="my-tooltip" />
    </div>
  );
}

export default ManageSpots;