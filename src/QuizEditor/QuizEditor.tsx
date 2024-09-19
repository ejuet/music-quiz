import { Tab, Tabs } from "react-bootstrap";
import React, { useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { AudioFileList, ResetDBButton } from "../Database/DatabaseComponents.tsx";
import { UploadSoundFile } from "./Media/DropZoneSound.tsx";
import { useNavigateToTab } from "../index.js";
import { Grid } from "./Grid/Grid.tsx";



export function QuizEditor() {
    const tabKey = useParams().tabKey;
    const navigate = useNavigateToTab();

    // We need to define the tabs here because we need to check if the tabKey is valid later
    const tabs = [
        <Tab eventKey="grid" title="Grid" key="grid">
            <Grid />
        </Tab>,
        <Tab eventKey="media" title="Media" key="media">
            <h2>Audio Files</h2>
            <UploadSoundFile />
            <AudioFileList />
            <ResetDBButton />
        </Tab>
    ]

    // Navigate to first tab if tabKey is invalid
    const tabIsValid = tabs.map(tab => tab.props.eventKey).includes(tabKey);
    useEffect(() => {
        if(!tabIsValid) {
            navigate(tabs[0].props.eventKey);
        }
    }, [tabIsValid]);

    return <>
        <Tabs
            activeKey={tabKey}
            onSelect={(k) => { navigate(k) }}
        >
            {
                tabs
            }

        </Tabs>
    </>
}