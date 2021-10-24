import React, {useEffect, useState, useRef} from "react";
import TerminalHistory from "./TerminalHistory";

const debugStatus:boolean = true;
import {makeStyles} from "@material-ui/core/styles";

function Terminal() {
    const [command, setCommand] = useState("");
    const [serverResponse, setServerResponse] = useState("");
    const [commandResult, setCommandResult] = useState("");
    const [commandHistory, setCommandHistory] = useState<Array<string>>([]);
    const [positionInHistory, setPositionInHistory] = useState(0);
    const classes =useStyles();

    const webSocket:any = useRef();
    const init = () => {
        // Create WebSocket connection.
        webSocket.current = new WebSocket('ws://localhost:8222');
        console.log(webSocket.current)

        // Connection opened
        webSocket.current.addEventListener('open', function (event : any) {
            console.log('Connected to the WS Server!')
        });

        // Connection closed
        webSocket.current.addEventListener('close', function (event: any) {
            console.log('Disconnected from the WS Server!')
        });

        // Listen for messages
        webSocket.current.addEventListener('message', function (event: any) {
            console.log('Message from server ', event.data);
            setServerResponse(event.data)
        });    
    }

    useEffect(() => {
        init();
      }, []);

    // Send a msg to the websocket
    const sendMsg = (msg : string) => {
        webSocket.current.send(msg);
    }

    const changeCommand = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCommand(event.target.value);
    }

    // Retrieving previously used commands from the localStorage
    useEffect(() => {
        let receivedHistory = window.localStorage.getItem('commandHistory');

        if (typeof receivedHistory === "string") {
            let parsedReceivedHistory = JSON.parse(receivedHistory);
            setCommandHistory(parsedReceivedHistory);
            setPositionInHistory(parsedReceivedHistory.length);
        } else {
            setCommandHistory([]);
            setPositionInHistory(0);
        }
    }, [])

    // Updating command history in the localStorage
    useEffect(() => {
        window.localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
    }, [commandHistory]);

    // Creating keylogger
    useEffect(() => {
        const listener = (event: KeyboardEvent)  => {
            switch (event.code) {
                // When the Enter key is pressed command is executed and saved in the command history
                case "Enter":
                    setCommandResult(command);
                    
                    if (command.toLowerCase().trim() == "clear")
                    {
                        setCommand("");
                        setServerResponse("");
                        setPositionInHistory(0);
                        setCommandHistory([]);
                        setCommandResult("");
                    }
                    else if (command && command.length)
                    {
                        sendMsg(command);
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setCommand("");
                        setPositionInHistory(commandHistory.length + 1);
                    }
                    break;

                // When the ArrowDown key is pressed we move up in the command history
                case "ArrowDown":
                    if (positionInHistory < commandHistory.length) {
                        setPositionInHistory(prevState => prevState + 1);

                        // Dependently on position command is either retrieved from history or empty
                        if (positionInHistory + 1 == commandHistory.length) {
                            setCommand("")
                        } else {
                            setCommand(commandHistory[positionInHistory + 1]);
                        }
                    }
                    break;

                // When the ArrowUp key is pressed we move down in the command history
                case "ArrowUp":
                    if (positionInHistory > 0) {
                        setPositionInHistory(prevState => prevState - 1);
                        setCommand(commandHistory[positionInHistory - 1]);
                    }
                    break;
            }
        };
        document.addEventListener("keydown", listener);

        // When the component is about to get destroyed listener gets removed
        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [command, commandHistory, positionInHistory]);

    const debugPanel = (<>
            <hr></hr>State:
            {command}<br/>
            {commandResult}<br/>
            {commandHistory.toString()}<br/>
            {positionInHistory}<br/>
        </>
        )

    return (
        <div className={classes.terminalContainer}>
            <div>
                <TerminalHistory
                    history={commandHistory}
                />
                <div>{serverResponse ? "> " + serverResponse : ""}</div>
                <hr className={classes.line}></hr>
            </div>
            <div className={classes.lineContainer}>
                <div className={classes.terminalSign}>
                    {'>'}
                </div>
                <input className={classes.inputContainer} type="text" value={command} onChange={changeCommand} />
            </div>
            {debugStatus && debugPanel}
        </div>
    );
}

const useStyles = makeStyles(theme => ({
    terminalContainer: {
        height: "100vh",
        width: "100%",
        backgroundColor: "black",
        color: "lightblue",
        fontSize: "24px",
    },
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
    line : {
        marginTop: 0,
    }
}));

export default Terminal;