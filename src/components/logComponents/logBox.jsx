import React from 'react'
import style from './logBox.module.css'
import { Icon } from '@iconify/react';
import { color } from 'three/tsl';
import Card from "../card/card"

export default function LogBox(props) {
  let logo;
  if(props.theme == "red"){
    logo = <Icon icon="material-symbols-light:shield" width="32" height="32" />
  }
  else{
    logo = <Icon icon="ri:sword-fill" width="32" height="32" />
  }
  return (
    <div className={style.container}>
      <div className={style.logText}><h2>Logs</h2></div>
      <div className={style.logContainer}>
        {props.history.map((obj) =>
          obj.objects.map((dron) => (
            <button className={style.box} key={obj.id + "-" + dron.obj_id} onClick={()=>{props.haddleClick(<Card name={dron.obj_id} lat={[dron.lat]} lng={[dron.lng]} color = {dron.details?.details?.color ?? dron.details?.color??"rgba(0, 255, 0, 1)"}handleClose ={props.haddleDisplay} img={obj.image_path ?? obj.image?.path} timestamp={obj.timestamp}/>)}}>
              <h5 style={{ color: props.theme === "red" ? "red" : "green" }}>
                {
                  new Date(new Date(obj.timestamp).getTime() - 7 * 60 * 60 * 1000)
                    .toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })
                }
              </h5>

              <h5>
                ID: {dron.obj_id} lat: {dron.lat} lng: {dron.lng}
              </h5>
            </button>
          ))
        )}

      </div>
    </div>

  )
}
