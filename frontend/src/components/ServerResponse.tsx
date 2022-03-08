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
    sendMsg: any
}

const ServerResponse = ({driver, websocket, response, setResponse, tableResponse, setTableResponse, sendMsg} : ServerResponseProps) => {
    const classes = useStyles();

    useEffect(() => {
        // Create WebSocket connection.
        websocket.current = new WebSocket('ws://localhost:8222', "echo");
        console.log(websocket.current)

        // Connection opened
        websocket.current.addEventListener('open', function (event : any) {
            console.log('Connected to the WS Server!')
        });

        // Connection closed
        websocket.current.addEventListener('close', function (event: any) {
            console.log('Disconnected from the WS Server!')
        });

        // Listen for messages
        websocket.current.addEventListener('message', function (event: any) {

            event.data.arrayBuffer().then((response: any) => {
                response = driver.getResponse(Buffer.from(response))
                if (typeof response == "string") {
                    setResponse(response)
                } else {
                    setTableResponse(response)
                }
            })

            // TODO: Parsing response for table or just string and then executing respective setState.

           // console.log('Message from server ', Buffer.from(event.data.arrayBuffer()));
           //console.log('Message from server ', event.data.json());
        });
    }, []);

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
                        {response}
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
        backgroundColor: "black",
        color: "lightblue",
        outlineWidth: 0,
        border: "none",
        fontSize: "24px",
    },
    terminalSign: {
        width: "2%",
    },
}));


export  default  ServerResponse;