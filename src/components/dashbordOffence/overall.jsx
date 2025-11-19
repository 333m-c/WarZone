import React, { useEffect, useState } from 'react'
import style from './overall.module.css'

import { Icon } from '@iconify/react';

export default function Offence({realtimeDefenceData,realtimeOffenceData,defenceDaily,offenceDaily}) {
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
        // if (realtimeDefenceData){
        //     setCountDefence(realtimeDefenceData.objects.length)
        //     getProvince(realtimeDefenceData.objects[0].lat,realtimeDefenceData.objects[0].lng).then(setDefenceProvince);
        // }
        if (realtimeOffenceData){
            setCountOffence(realtimeOffenceData.objects.length)
            if(countOffence>0){
                setOffenceProvince("Attack detected!!")
            }
            else{
                setOffenceProvince("No attacks detected")
            }
            // getProvince(realtimeOffenceData.objects[0].lat,realtimeOffenceData.objects[0].lng).then(setOffenceProvince);
        }
        // console.log(defenceDaily)
        // console.log(offenceDaily)
    },[realtimeDefenceData,realtimeOffenceData,countOffence])
    return (
    <div className={style.container}>
        <div className={style.box}>
            <div>
                <h1>War Zone</h1>
                
            </div>
            <div className={style.grid}>
                <Icon icon="ri:sword-fill" width="32" height="32" />
                {offenceProvince}
                
            </div>
        </div>
        
        <div className={style.box}>
            <div>
                <h2>OFFENCE</h2>
            </div>
            <div className={style.countBox}>
                <h2>{countOffence}</h2>
            </div>
        </div>
    </div>
  )
}
