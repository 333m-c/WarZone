import React, { useState } from 'react'
import style from './card.module.css'
import MapboxMap from '../mapbox'

export default function card(props) {
  const [showImage, setShowImage] = useState(false);
  return (
    <div className={style.box} onClick={props.handleClose}>
      <div 
        className={style.container} 
        onClick={(e) => e.stopPropagation()}  // ⭐ กันไม่ให้คลิกไหลไปถึง globe
      >
        <p>                {
                  new Date(new Date(props.timestamp).getTime() - 7 * 60 * 60 * 1000)
                    .toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })
                }</p>

        <div className={style.boxImg}>
          <MapboxMap 
            token={import.meta.env.VITE_TOKEN_MAP_BOX}
            lat={props.lat}
            lng={props.lng}
            colors ={props.color}
          />

          {/* รูปไม่ fix height */}
          <div className={style.imgWrapper}>
            <img 
              className={style.imgDrone}
              src={`https://tesa-api.crma.dev${props.img}`}
              alt={props.img}
            />

            {/* ปุ่มวางขวาล่างบนรูป */}
            <button 
              className={style.viewBtn}
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowImage(true); 
              }}
            >
              View Picture
            </button>
          </div>

        </div>
      </div>

      {/* Modal */}
      {showImage && (
        <div 
          className={style.modal}
          onClick={(e) => {
            e.stopPropagation();     // ⭐ ป้องกันคลิกไหลไปปิดการ์ด
            setShowImage(false); 
          }}
        >
          <img 
            className={style.fullImage}
            src={`https://tesa-api.crma.dev${props.img}`}
            alt="full"
            onClick={(e) => e.stopPropagation()}   // ⭐ คลิกบนรูปก็ไม่ปิด
          />
        </div>
      )}
    </div>
  )
}
