import { Tab, Tabs } from "react-bootstrap";
import React from "react";
import { Link, useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { getTabs, navigateToTab, tabsParentRoute, useNavigateToTab, useTabKey } from ".";



export const Layout = () => {
    const tabs = getTabs();

    const tabKey = useTabKey();
    const navigateToTab = useNavigateToTab();

    return <>
        <Tabs
            activeKey={tabKey}
            onSelect={(key) => navigateToTab(key)}
        >
            {tabs.map((key) => (
                <Tab eventKey={key} title={key} key={key}>
                    <Outlet />
                </Tab>
            ))}
        </Tabs>
    </>
};

export function Editor() {
    return <>
        <h1>Editor</h1>
        <Tabs>
            <Tab eventKey="quiz" title="Quiz">
                <Outlet />
            </Tab>
            <Tab eventKey="media" title="Media">
                <Outlet />
            </Tab>
        </Tabs>
    </>
}