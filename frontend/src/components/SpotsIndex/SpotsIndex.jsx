import { useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { fetchAllSpots } from '../../store/spots';
import Modal from 'react-modal';
import "./SpotsIndex.css"

function SpotsIndex() {
  const dispatch = useDispatch();
  const spots = useSelector(state => state.spots);
  const spotsArr = Object.values(spots); 
  const [modalIsOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState([]);

   function openModal(spot, e) {
     e.stopPropagation(); 
     setImages(spot.SpotImages)
     setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  useEffect(() => {
    dispatch(fetchAllSpots());
  }, [dispatch]);

  if (!spots || Object.keys(spots).length === 0) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>All Spots</h1>
        <div className="container">
        {spotsArr.map(spot => (
          <div key={spot.id}>
            <h3>{spot.name}</h3>
            <p>{spot.city}, {spot.state}</p>
            <p>${spot.price} per night</p>
            {spot.previewImage && (
              <img  id={spot.id}  src={spot.previewImage} alt={spot.name} width="200" onClick={(e)=>openModal(spot, e)}/>
            )}
          </div>
        ))}
        </div>
        <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
      >
        <button onClick={closeModal}>close</button>
        <div><ImageGallery items={images} showPlayButton={false}/></div>
        
      </Modal>
       
    </div>
  );
}

export default SpotsIndex;
