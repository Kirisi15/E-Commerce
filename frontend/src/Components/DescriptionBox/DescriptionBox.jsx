import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews(122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, laudantium?
            </p>
            <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Magnam quibusdam sint harum reprehenderit exercitationem ipsam eum at iusto sequi aperiam, explicabo maxime eaque itaque enim?
            </p>
        </div>
    </div>
  )
}

export default DescriptionBox