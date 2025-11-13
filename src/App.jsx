import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Globe from './components/globe'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DetectionProvider } from './hooks/detectionContext'
import { BrowserRouter, Routes, Route , Navigate  } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  const camIdDEFENCE = import.meta.env.VITE_CAMERA_ID_DEFENCE // ตัวอย่าง
  const tokenDEFENCE = import.meta.env.VITE_TOKEN_DEFENCE;
  const camIdOFFENCE = import.meta.env.VITE_CAMERA_ID_OFFENCE // ตัวอย่าง
  const tokenOFFENCE = import.meta.env.VITE_TOKEN_OFFENCE;
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/:type" element={
          <DetectionProvider camIdDefence={camIdDEFENCE} tokenDefence={tokenDEFENCE} camIdOffence={camIdOFFENCE} tokenOffence={tokenOFFENCE} enabled={true}>
            <Globe />
          </DetectionProvider>} />
          <Route path="*" element={<Navigate to="/overall" replace />} />
          {/* <Route path="/defence" element={
          <DetectionProvider camId={camIdDEFENCE} token={tokenDEFENCE} enabled={true}>
            <Globe />
          </DetectionProvider>} />
          <Route path="/offence" element={
          <DetectionProvider camId={camIdOFFENCE} token={tokenOFFENCE} enabled={true}>
            <Globe />
          </DetectionProvider>} /> */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
