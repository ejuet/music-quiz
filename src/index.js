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
import { Layout } from './QuizEditor.tsx';
import { useLocation, useNavigate } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

export const routes = [
  {
    path: "/",
    element: <p>home</p>,
  },
  {
    path: "/edit",
    element: <Layout />,
    children: [
      {
        path: "grid",
        element: <p>Display Grid</p>
      },
      {
        path: "media",
        element: <>
          <h2>Audio Files</h2>
          <UploadSoundFile />
          <AudioFileList />
          <ResetDBButton />
        </>,
      }
    ]
  }
]
const router = createHashRouter(routes);

//tab stuff
export const tabsParentRoute = "/edit";
export function useTabKey(){
  const location = useLocation();
  return location.pathname.replace(tabsParentRoute, '').split('/')[1];
}
export function useNavigateToTab(){
  const navigate = useNavigate();
  return (tab)=>navigate(tabsParentRoute + '/' + tab);
}
export function getTabs(){
  return routes.filter(r => r.path === tabsParentRoute)[0].children.map(r => r.path);
}

root.render(
  <RouterProvider router={router} />
);

