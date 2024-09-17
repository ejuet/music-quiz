import React from 'react';
import { Button } from 'react-bootstrap';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from 'react';
import { UploadSoundFile } from './QuizEditor/Media/DropZoneSound.tsx';
import { HashRouter } from "react-router-dom";
import { Routes, Route } from 'react-router-dom';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { QuizEditor } from './QuizEditor/QuizEditor.tsx';
import { useLocation, useNavigate } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createHashRouter([
  {
    path: "/",
    element: <p>home</p>,
  },
  {
    path: "/edit",
    element: <QuizEditor />
  },
  {
    path: "/edit/:tabKey",
    element: <QuizEditor />
  }
]);

//tab stuff
export function useNavigateToTab(){
  const navigate = useNavigate();
  return (tabKey)=>navigate('/edit/' + tabKey);
}

root.render(
  <RouterProvider router={router} />
);

