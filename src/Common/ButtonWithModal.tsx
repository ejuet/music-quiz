import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

interface ButtonWithModalProps {
    onAction: () => void;
    buttonContent: JSX.Element | string;
    modalTitle: string;
    modalBody: string | JSX.Element;
    customButton?: JSX.Element;
}

export default function ButtonWithModal({ onAction, buttonContent, modalTitle, modalBody, customButton }: ButtonWithModalProps) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleAction = () => {
        onAction();
        handleClose();
    };

    return (
        <>
            {
                customButton ?
                    React.cloneElement(customButton, { onClick: handleShow }) :
                    <Button variant="primary" onClick={handleShow}>
                        {buttonContent}
                    </Button>
            }

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalBody}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAction}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}