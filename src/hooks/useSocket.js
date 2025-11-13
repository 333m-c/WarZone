/**
 * Custom hook สำหรับเชื่อมต่อ Socket.IO และรับข้อมูล real-time
 */

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (camId, enabled) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [realtimeData, setRealtimeData] = useState<DetectionEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // ตัดการเชื่อมต่อถ้าไม่ enable หรือไม่มี camId
    if (!enabled || !camId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // สร้าง socket instance เชื่อมต่อกับ server
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL);

    // เมื่อเชื่อมต่อสำเร็จ
    socketInstance.on('connect', () => {
      // console.log('Connected to socket server');
      setIsConnected(true);

      // บอก server ว่าต้องการข้อมูลจากกล้องไหน
      socketInstance.emit('subscribe_camera', { cam_id: camId });
    });

    // เมื่อตัดการเชื่อมต่อ
    socketInstance.on('disconnect', () => {
      // console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    // เมื่อได้รับข้อมูล object detection
    socketInstance.on('object_detection', (data) => {
      // console.log('Received object detection:', data);

      // แปลง data structure ให้ตรงกับ DetectionEvent interface
      setRealtimeData({
        id: Date.now(),
        cam_id: data.cam_id,
        camera: data.camera,
        timestamp: data.timestamp,
        image_path: data.image.path,
        objects: data.objects,
      });
    });

    setSocket(socketInstance);

    // Cleanup เมื่อ component unmount หรือ dependencies เปลี่ยน
    return () => {
      if (socketInstance) {
        socketInstance.emit('unsubscribe_camera', { cam_id: camId });
        socketInstance.disconnect();
      }
    };
  }, [camId, enabled]);

  return { socket, realtimeData, isConnected };
};
