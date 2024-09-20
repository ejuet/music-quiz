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
    element: <p>home</p>,
  },
  {
    path: "/edit",
    element: <QuizEditor />
  },
  {
    path: "/edit/:tabKey",
    element: <QuizEditor />
  },
  {
    path: "/quiz/:quizID",
    element: <QuizPage />,
  },
  {
    path: "quizzes",
    element: <ListQuizzes />,
  }
]);

//tab stuff
export function useNavigateToTab() {
  const navigate = useNavigate();
  return (tabKey) => navigate('/edit/' + tabKey);
}

root.render(
  <AppDataProvider>
    <RouterProvider router={router} />
    </AppDataProvider>
);

function ListQuizzes() {
  const d = useAppDataContext();
  return <div>
    <h1>Quizzes</h1>
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
    <p>name: "{currentQuiz?.name}"</p>
  </>;
}

