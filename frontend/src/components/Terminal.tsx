import React, {useEffect, useState, useRef} from "react";
import TerminalHistory from "./TerminalHistory";

const debugStatus:boolean = true;
import {makeStyles} from "@material-ui/core/styles";
import Input from "./Input";
import ServerResponse from "./ServerResponse";

const Terminal = () => {
    const [command, setCommand] = useState("");
    const [commandResult, setCommandResult] = useState("");
    const [commandHistory, setCommandHistory] = useState<Array<string>>([]);
    const [positionInHistory, setPositionInHistory] = useState(0);
    const [serverResponse, setServerResponse] = useState("");
    const webSocket:any = useRef();
    const classes = useStyles();

    const changeCommand = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCommand(event.target.value);
    }

    // Send a msg to the websocket
    const sendMsg = (msg : string) => {
        webSocket.current.send(msg);
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
            <TerminalHistory
                history={commandHistory}
            />
            <ServerResponse
                websocket={webSocket}
                response={serverResponse}
                setResponse={setServerResponse}
            />
            <hr className={classes.line}></hr>
            <Input value={command} changeValue={changeCommand}/>
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