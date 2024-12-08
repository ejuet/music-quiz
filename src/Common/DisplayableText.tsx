import React from "react";
import { DisplayableText, SimpleText } from "../Logic/structure.ts";

export function RenderDisplayableText({ text }: { text: DisplayableText }) {
    return <>
        {text instanceof SimpleText && <div>{text.text}</div>}
        {typeof text === 'string' && <div>{text}</div>}
    </>
}