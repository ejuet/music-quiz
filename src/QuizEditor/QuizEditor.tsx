import { Tab, Tabs } from "react-bootstrap";
import React, { useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { AudioFileList, ResetDBButton } from "../Database/DatabaseComponents.tsx";
import { UploadSoundFile } from "./Media/DropZoneSound.tsx";
import { useNavigateToTab } from "../index.js";
import { Grid } from "./Grid.tsx";
import { Settings } from "./Settings/Settings.tsx";



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
        </Tab>,
        <Tab eventKey="settings" title="Settings" key="settings">
            <Settings />
        </Tab>
    ]

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
