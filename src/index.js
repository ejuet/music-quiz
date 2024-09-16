import React from 'react';
import { Button } from 'react-bootstrap';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from 'react';
import { UploadSoundFile } from './example.tsx';
import { ResetDBButton } from './database/DatabaseComponents.tsx';
import { HashRouter } from "react-router-dom";
import { Routes, Route } from 'react-router-dom';
import { createHashRouter, RouterProvider } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
const router = createHashRouter([
  {
    path: "/",
    element: <>
<UploadSoundFile />
<ResetDBButton />

    </> ,
  },
]);

root.render(
  <RouterProvider router={router} />
);

