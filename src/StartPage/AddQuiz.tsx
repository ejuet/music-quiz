import { Button } from "react-bootstrap";
import { useAppDataContext } from "../Logic/AppDataContext.tsx";
import React from "react";
import { useState } from "react";
import { Modal } from "react-bootstrap";

export function AddQuiz() {
    const appData = useAppDataContext();
    return <Button onClick={() => {
        appData.appData.createMusicQuiz();
        appData.setAppData(appData.appData);
    }}>Add Quiz</Button>
}


export function DeleteQuiz({ id }: { id: string }) {
    const [show, setShow] = useState(false);
    const appData = useAppDataContext();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleDelete = () => {
        appData.appData.deleteMusicQuiz(id);
        appData.setAppData(appData.appData);
        handleClose();
    };

    return (
        <>
            <Button variant="danger" onClick={handleShow}>Delete</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this quiz?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}