import React from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { RightOrWrong } from "../../Logic/structure.ts";

export function RightOrWrongButton({ part } : { part: RightOrWrong }) {
    return <>
        <ButtonGroup>
            <Button variant="success">Right</Button>
            <Button variant="danger">Wrong</Button>
        </ButtonGroup>
    </>

}