import React, {useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";

interface ServerResponseProps {
    websocket: any;
    response: string;
    setResponse: (s: string) => void
}

const ServerResponse = ({websocket, response, setResponse} : ServerResponseProps) => {
    const classes = useStyles();

    useEffect(() => {
        // Create WebSocket connection.
        websocket.current = new WebSocket('ws://localhost:8222');
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
            console.log('Message from server ', event.data);
            setResponse(event.data)
        });
    }, []);

    return (
        <div className={classes.lineContainer}>
            <div className={classes.terminalSign}>
                {'>'}
            </div>
            <div className={classes.inputContainer}>
                {response}
            </div>
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