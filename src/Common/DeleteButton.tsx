import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

interface DeleteButtonProps {
    onDelete: () => void;
    customMessage?: string;
}

function DeleteButton ({ onDelete, customMessage }: DeleteButtonProps) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleDelete = () => {
        onDelete();
        handleClose();
    };

    return (
        <>
            <Button variant="danger" onClick={handleShow}>
                Delete
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {customMessage || 'Are you sure you want to delete this item?'}
                </Modal.Body>
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
};

export default DeleteButton;