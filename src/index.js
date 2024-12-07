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
import { Navbar, Nav } from 'react-bootstrap';
import { AddQuiz } from './StartPage/AddQuiz.tsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createHashRouter([
  {
    path: "/",
    element: <WithNavbar><StartPage /></WithNavbar>,
  },
  {
    path: "quiz",
    element: <WithNavbar><ListQuizzes /></WithNavbar>,
  },
  {
    path: "/quiz/:quizID",
    element: <WithNavbar><QuizPage /></WithNavbar>,
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
    <p>
      Welcome to the music quiz app. Here you can create and play music quizzes.
    </p>
  </div>
}

function WithNavbar({ children }) {
  const location = useLocation();

  return (
    <>
      <div className='mx-4'>
        <Navbar expand="lg">
          <Navbar.Brand href="/#/">Music Quiz</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <NavbarLink to="/" className="mx-2">Home</NavbarLink>
              <NavbarLink to="/quiz" className="mx-2">Quizzes</NavbarLink>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
      {children}
    </>
  );
}

function NavbarLink({ to, children, ...props }) {
  const location = useLocation();
  return <Link to={to} style={{
    color: location.pathname === to ? 'black' : 'inherit',
    fontWeight: location.pathname === to ? 'bold' : 'normal',
    textDecoration: 'none'
    }} {...props}>{children}</Link>
}

function ListQuizzes() {
  const d = useAppDataContext();
  return <div>
    <h1>Your Quizzes</h1>
    {
      d.appData.musicQuizzes.map(q => <div key={q.id}>
        <Link to={`/quiz/${q.id}`}>{q.name}</Link>
      </div>)
    }
    <AddQuiz />
  </div>
}

function QuizPage() {
  const currentQuiz = useCurrentQuiz();
  return <>
    <h1>Quiz "{currentQuiz?.name}"</h1>
    <Link to={`edit`}>Edit</Link>
  </>;
}

