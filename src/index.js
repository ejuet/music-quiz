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
import { Alert } from 'react-bootstrap';
import { GameMenu } from './Play/GameMenu.tsx';
import { GameHistory, PlayGame } from './Play/PlayGame.tsx';

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
  {
    path: "quiz/:quizID/game/:gameID",
    element: <WithNavbar><GameMenu/></WithNavbar>,
  },
  {
    path: "quiz/:quizID/game/:gameID/play",
    element: <PlayGame/>,
  },
  {
    path: "quiz/:quizID/game/:gameID/history",
    element: <WithNavbar><GameHistory/></WithNavbar>,
  }
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
      Welcome to the music quiz app!<br/>
      You can create or play quizzes <Link to="/quiz">here</Link>.
    </p>
    <Alert variant="warning">
      <Alert.Heading>Important Note</Alert.Heading>
      <p>
      This app is still in development.
      There might be breaking changes anytime and the quizzes you create might be incompatible with future versions of the app.
      Keep backups of your quizzes outside the app if you want to keep them.
      </p>
      <b>Known Issues</b>
      <ul>
        <li>Please avoid editing or playing games in multiple tabs for now as you might overwrite some changes that happened in another tab.</li>
      </ul>
    </Alert>
    <h2>Coming Soon</h2>
    <ul>
      <li>More question types</li>
      <li>Better page design</li>
      <li>User Accounts & saving quizzes in cloud (Google Firebase)</li>
      <ul>
        <li>Synchronize across devices (except for audio files because I will not create a file server for possibly copyrighted music)</li>
        <li>Share quizzes with others</li>
        <li>Simple Kahoot-style multiplayer</li>
      </ul>
    </ul>
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



