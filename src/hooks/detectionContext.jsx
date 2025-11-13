import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useDetections } from './useDetections';

// === ตัวอย่างฟังก์ชัน fetch ข้อมูลจาก backend ===
const getRecentDetections = async (camId, token) => {
  const res = await fetch(`${import.meta.env.API_BASE_URL}/detections/${camId}`, {
    headers: {
      'x-camera-token': token,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch detections');
  return res.json();
};

// === สร้าง Context ===
const DetectionContext = createContext(null);

// === Provider หลัก ===
export const DetectionProvider = ({ camIdDefence, tokenDefence,camIdOffence,tokenOffence, enabled, children }) => {
  const [realtimeDefenceData, setRealtimeDefenceData] = useState(null);
  const [realtimeOffenceData, setRealtimeOffenceData] = useState(null);
  const [isConnectedDefence, setIsConnectedDefence] = useState(false);
  const [isConnectedOffence, setIsConnectedOffence] = useState(false);
  const [defenceHistory,setDefenceHistory] = useState([])
  const [offenceHistory,setOffenceHistory] = useState([])
  const [defenceDaily,setDefenceDaily] =useState([])
  const [offenceDaily,setOffenceDaily] =useState([])
  const [defenceObj,setDefenceObj] = useState([])
  const [offenceObj,setOffenceObj] = useState([])

  // --- ใช้ React Query ---
  const {
    data: dataDefence,
    isLoading: isLoadingDefence,
    error: errorDefence,
    refetch: refetchDefence
  } = useDetections(camIdDefence, tokenDefence, enabled);
  useEffect(() => {

    if (dataDefence?.data) {
      // const newObjs = [];
      // const newIds = [];
      // console.log(dataDefence)
      // // ✅ loop ให้ตรงกับ dataDefence.data
      // dataDefence.data.forEach((data) => {
      //   data.objects.forEach((obj) => {
      //     if (!defenceObj.includes(obj.obj_id)) {
      //       newObjs.push(obj);
      //       newIds.push(obj.obj_id);
      //     }
      //   });
      // });

      // // ✅ setState ทีเดียว ปลอดภัยและเร็ว
      // if (newIds.length > 0) {
      //   setDefenceObj((prev) => [...newIds, ...prev]);
      //   setDefenceDaily((prev) => [...newObjs, ...prev]);
      // }
      setDefenceHistory(dataDefence.data);
      // console.log(dataDefence)
      // console.log(defenceDaily)
    }
  }, [dataDefence]);

  const {
    data: dataOffence,
    isLoading: isLoadingOffence,
    error: errorOffence,
    refetch: refetchOffence
  } = useDetections(camIdOffence, tokenOffence, enabled);
  useEffect(() => {
    
    if (dataOffence?.data) {
      // const newObjs = [];
      // const newIds = [];
      // // ✅ รวมก่อน ไม่ setState ระหว่าง loop
      // dataOffence.data.forEach((data) => {
      //   data.objects.forEach((obj) => {
      //     if (!offenceObj.includes(obj.obj_id)) {
      //       newObjs.push(obj);
      //       newIds.push(obj.obj_id);
      //     }
      //   });
      // });

      // // ✅ แล้วค่อย set ทีเดียว
      // if (newIds.length > 0) {
      //   setOffenceObj((prev) => [...newIds, ...prev]);
      //   setOffenceDaily((prev) => [...newObjs, ...prev]);
      // }
      setOffenceHistory(dataOffence.data);
    }
  }, [dataOffence]);

  // const { data, isLoading, refetch } = useQuery({
  //   queryKey: ['detections', camId],
  //   queryFn: () => getRecentDetections(camId, token),
  //   enabled: enabled && !!camId && !!token,
  //   refetchInterval: 30000, // ทุก 30 วิ
  // });
  // useEffect(() => {
  //   if (data?.data) {
  //     setAllHistory(data.data);
  //   }
  // }, [data]);

  // --- ใช้ Socket.IO ---
  useEffect(() => {
    if (!enabled || !camIdDefence) return;

    const socketInstanceDefence = io(import.meta.env.VITE_SOCKET_URL);

    socketInstanceDefence.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnectedDefence(true);
      socketInstanceDefence.emit('subscribe_camera', { cam_id: camIdDefence });
    });

    socketInstanceDefence.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnectedDefence(false);
    });

    socketInstanceDefence.on('object_detection', (data) => {
      // console.log(data)
      // console.log(`data ${data}`)
    data.objects.forEach((obj) => {
      setDefenceObj((prevObjIds) => {
        if (!prevObjIds.includes(obj.obj_id)) {
          // เพิ่ม obj ใหม่
          setDefenceDaily((prev) => [obj, ...prev]);
          return [obj.obj_id, ...prevObjIds];
        }
        return prevObjIds; // ถ้ามีแล้วไม่ต้องเพิ่ม
      });
    });
      setRealtimeDefenceData(data);
    });

    // socketInstance.onAny((event, data) => {
    //   console.log('📡 Event received:', event, data);
    // });

    return () => socketInstanceDefence.disconnect();
  }, [camIdDefence, enabled]);

  useEffect(() => {
    if (!enabled || !camIdOffence) return;

    const socketInstanceOffence = io(import.meta.env.VITE_SOCKET_URL);

    socketInstanceOffence.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnectedOffence(true);
      socketInstanceOffence.emit('subscribe_camera', { cam_id: camIdOffence });
    });

    socketInstanceOffence.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnectedOffence(false);
    });

    socketInstanceOffence.on('object_detection', (data) => {
      // console.log(data)
      // console.log(`data ${data}`)
      // data.objects.forEach((obj)=>{
      //     if (!offenceObj.includes(obj.obj_id)){
      //       setOffenceDaily(((prev) => [obj, ...prev]))
      //       setOffenceObj(((prev) => [obj.obj_id, ...prev]))
      //     }
      //   })
    data.objects.forEach((obj) => {
      setOffenceObj((prevObjIds) => {
        if (!prevObjIds.includes(obj.obj_id)) {
          // เพิ่ม obj ใหม่
          setOffenceDaily((prev) => [obj, ...prev]);
          return [obj.obj_id, ...prevObjIds];
        }
        return prevObjIds; // ถ้ามีแล้วไม่ต้องเพิ่ม
      });
    });
    
      setRealtimeOffenceData(data);
    });

    // socketInstance.onAny((event, data) => {
    //   console.log('📡 Event received:', event, data);
    // });

    return () => socketInstanceOffence.disconnect();
  }, [camIdOffence, enabled]);

  useEffect(() => {
    if (realtimeDefenceData) {
      // 12. เพิ่ม detection ใหม่ไว้ด้านหน้าสุด
      setDefenceHistory((prev) => [realtimeDefenceData, ...prev]);

      // 13. แสดง notification (optional)
      // console.log('New detection received:', realtimeData);
    }
  }, [realtimeDefenceData]);
  useEffect(() => {
    if (realtimeOffenceData) {
      // 12. เพิ่ม detection ใหม่ไว้ด้านหน้าสุด
      setOffenceHistory((prev) => [realtimeOffenceData, ...prev]);

      // 13. แสดง notification (optional)
      // console.log('New detection received:', realtimeData);
    }
  }, [realtimeOffenceData]);

  
  // --- รวมทุกค่าไว้ใน context ---
  return (
    <DetectionContext.Provider
      value={{ realtimeDefenceData, realtimeOffenceData,defenceHistory,offenceHistory,defenceDaily,offenceDaily, isConnectedDefence,isConnectedOffence, isLoadingDefence,isLoadingOffence,defenceObj,offenceObj }}
    >
      {children}
    </DetectionContext.Provider>
  );
};

// === Hook สำหรับใช้งานใน Component อื่น ๆ ===
export const useDetectionContext = () => {
  const context = useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetectionContext must be used within a DetectionProvider');
  }
  return context;
};
