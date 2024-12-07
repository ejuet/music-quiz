import React from 'react';
import { Button } from 'react-bootstrap';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import { useState } from 'react';
import { UploadSoundFile } from './QuizEditor/Media/DropZoneSound.tsx';
import { HashRouter, useParams } from "react-router-dom";
import { Routes, Route } from 'react-router-dom';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { QuizEditor } from './QuizEditor/QuizEditor.tsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDataProvider, useAppDataContext, useCurrentQuiz } from './Logic/AppDataContext.tsx';
import { useAppData } from './Logic/AppDataContext.tsx';
import { Link } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createHashRouter([
  {
    path: "/",
    element: <StartPage />,
  },
  {
    path: "quiz",
    element: <StartPage />,
  },
  {
    path: "/quiz/:quizID",
    element: <QuizPage />,
  },
  {
    path: "quiz/:quizID/edit/:tabKey?",
    element: <QuizEditor />,
  },
]);

//tab stuff
export function useNavigateToTab() {
  const navigate = useNavigate();
  const params = useParams();
  return (tabKey) => navigate(`/quiz/${params.quizID}/edit/${tabKey}`);
}

root.render(
  <AppDataProvider>
    <RouterProvider router={router} />
    </AppDataProvider>
);

function StartPage(){
  return <div>
    <h1>Home</h1>
    <h2>Your Quizzes</h2>
    <ListQuizzes />
  </div>
}

function ListQuizzes() {
  const d = useAppDataContext();
  return <div>
    {
      d.appData.musicQuizzes.map(q => <div key={q.id}>
        <Link to={`/quiz/${q.id}`}>{q.name}</Link>
      </div>)
    }
  </div>
}

function QuizPage() {
  const currentQuiz = useCurrentQuiz();
  return <>
    <h1>"{currentQuiz?.name}"</h1>
    <Link to={`edit`}>Edit</Link>
  </>;
}

