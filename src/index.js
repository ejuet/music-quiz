import React from 'react';
import { Button } from 'react-bootstrap';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from 'react';
import { UploadSoundFile } from './example.tsx';
import { AudioFileList, ResetDBButton } from './database/DatabaseComponents.tsx';
import { HashRouter } from "react-router-dom";
import { Routes, Route } from 'react-router-dom';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Editor } from './QuizEditor.tsx';
import { QuizEditor } from './QuizEditor.tsx';
import { useLocation, useNavigate } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createHashRouter([
  {
    path: "/",
    element: <p>home</p>,
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

