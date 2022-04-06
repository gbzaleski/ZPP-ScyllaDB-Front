import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import TableDisplayer from "./TableDisplayer";

interface ServerResponseProps {
    driver: any;
    websocket: any;
    response: string;
    setResponse: (s: string) => void;
    tableResponse: string[][];
    setTableResponse: (s: string[][]) => void;
    sendMsg: (s : Buffer) => void; 
}

const ServerResponse = ({driver, websocket, response, setResponse, tableResponse, setTableResponse, sendMsg} : ServerResponseProps) => {
    const classes = useStyles();

    useEffect(() => {
        // Create WebSocket connection.
        websocket.current = new WebSocket('ws://localhost:8222');
    }, []);

    const errorResponse = <div className={classes.errorStruct}> {response} </div>;

    return (
        <div>
            <hr/>
            <div className={classes.lineContainer}>
                Response
            </div>
            {tableResponse && tableResponse.length && tableResponse[0] && tableResponse[0].length ?
                <TableDisplayer
                    driver = {driver}
                    headers = {tableResponse[0]}
                    data = {tableResponse.slice(1)}
                    sendMsg ={sendMsg}
                />
            :   
            (<div className={classes.lineContainer}>
                    <div className={classes.terminalSign}>
                        {'>'}
                    </div>
                    <div className={classes.inputContainer}>
                        {response.toLocaleLowerCase().includes("error") ? errorResponse : response}
                    </div>
                </div>)}
            <hr/>
        </div>
    )
}


const useStyles = makeStyles(theme => ({
    lineContainer:  {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start"
    },

    inputContainer: {
        width: "98%",
        color: "lightblue",
        outlineWidth: 0,
        border: "none",
        fontSize: "24px",
    },

    terminalSign: {
        width: "2%",
    },

    errorStruct: {
        color: "#bb0000",
        fontWeight: 700,
    },
}));


export  default  ServerResponse;