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
import { ListQuizzes } from './StartPage/ListQuizzes.tsx';
import { QuizPage } from './QuizPage/QuizPage.tsx';

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
    element: <WithNavbar><WithQuizNavbar><QuizEditor /></WithQuizNavbar></WithNavbar>,
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

function WithQuizNavbar({ children }) {
  const currentQuiz = useCurrentQuiz();
  
  return (
    <>
      <div className='mx-4 d-flex justify-content-between align-items-center'>
        <Button variant="link" href={"/#/quiz/" + currentQuiz?.id}>Back</Button>
        <h2 className='text-center flex-grow-1'>Edit <b>{currentQuiz?.name}</b></h2>
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



