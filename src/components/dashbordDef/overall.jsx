import React, { useEffect, useState } from 'react'
import style from './overall.module.css'

import { Icon } from '@iconify/react';

export default function Defence({realtimeDefenceData,realtimeOffenceData,defenceDaily,offenceDaily}) {
    const [countDefence,setCountDefence] = useState(0)
    const [countOffence,setCountOffence] = useState(0) 
    const [defenceProvince,setDefenceProvince] =useState("No intruders detected")
    const [offenceProvince,setOffenceProvince] =useState("No attacks detected")
    async function getProvince(lat, lon) {
        // const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        // const data = await res.json();
        // return data.address.state || data.address.province || "ไม่ทราบจังหวัด";
        return "Credit หมด"
    }

    useEffect(()=>{
        if (realtimeDefenceData){
            setCountDefence(realtimeDefenceData.objects.length)
            if(countDefence){
                setOffenceProvince("Detecting . . .")
            }
        }
        // if (realtimeOffenceData){
        //     setCountOffence(realtimeOffenceData.objects.length)
        //     if(countOffence){
        //         setOffenceProvince("Attackting . . .")
        //     }
            // getProvince(realtimeOffenceData.objects[0].lat,realtimeOffenceData.objects[0].lng).then(setOffenceProvince);
        //}
        // console.log(defenceDaily)
        // console.log(offenceDaily)
    },[realtimeDefenceData,realtimeOffenceData])
    return (
    <div className={style.container}>
        <div className={style.box}>
            <div>
                <h1>War Zone</h1>
                
            </div>
            <div style={{marginTop:"2rem"}} className={style.grid}>
                <Icon icon="material-symbols-light:shield" width="32" height="32" />
                {defenceProvince}
            </div>
        </div>
        
        <div className={style.box}>
            <div>
                <h2>DEFENCE</h2>
            </div>
            <div className={style.countBox}>
                <h2>{countDefence}</h2>
            </div>
        </div>
    </div>
  )
}
