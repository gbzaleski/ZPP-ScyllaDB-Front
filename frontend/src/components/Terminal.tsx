import React, {useEffect, useState, useRef} from "react";
import TerminalHistory from "./TerminalHistory";

import {makeStyles} from "@material-ui/core/styles";
import Input from "./Input";
import ServerResponse from "./ServerResponse";
import {CQLDriver} from "../CQL-Driver/src/Driver";

const Terminal = () => {
    const [command, setCommand] = useState("");
    const [commandResult, setCommandResult] = useState("");
    const [commandHistory, setCommandHistory] = useState<Array<string>>([]);
    const [positionInHistory, setPositionInHistory] = useState(0);
    const [serverResponse, setServerResponse] = useState<string>("");
    const [tableResponse, setTableResponse] = useState<Array<Array<string>>>([[]]);
    const [editMode, setEditMode] = useState(false);
    const [pagingValue, setPagingValue] = useState<Number>(0); // 0 = OFF , Positive value > ON, assuming 40 or smth as default value for paging on
    const DEFAULT_PAGING_VALUE = 40;

    const webSocket:any = useRef();
    const [driver, setDriver] = useState(new CQLDriver());
    const classes = useStyles();

    const changeCommand = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCommand(event.target.value);
    }

    // Send a msg to the websocket
    const sendMsg = (msg : Buffer) => {
        webSocket.current.send(msg);
    }

    const sendHandshake = () => {
        const coder = new TextEncoder()
        webSocket.current.send(coder.encode(driver.handshake()));
    }

    // Retrieving previously used commands from the localStorage
    useEffect(() => {
        let receivedHistory = window.localStorage.getItem('commandHistory');
        let receivedConsistency = window.sessionStorage.getItem('consistency');

        if (typeof receivedConsistency === "string") {
            driver.setConsistency(receivedConsistency)
        }

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
        window.sessionStorage.setItem('consistency', driver.getConsistencyName())
    }, [commandHistory, driver]);

    // Creating keylogger
    useEffect(() => {
        const listener = (event: KeyboardEvent)  => {
            switch (event.code) {
                // When the Enter key is pressed command is executed and saved in the command history
                case "Enter":
                    setCommandResult(command);
                    const tokenizedCommand = command.split(' ')

                    if (command.toLowerCase().trim() == "long")
                    {
                        setEditMode(true)
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setCommand("");
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    }
                    else if (command.toLowerCase().trim() == "short")
                    {
                        setEditMode(false)
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setCommand("");
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1)
                    }
                    else if (command.toLowerCase().trim() == "mock") // Mock data
                    {

                        // TODO Temporary mock table with data
                        const mock_table = [
                            ["id", "Imię" , "Urodzony",	"Zmarł", "Początek panowania", "Koniec panowania"],
                            ["0", "Bolesław I Chrobry", "967", "17 czerwca 1025", "18 kwietnia 1025", "17 czerwca 1025"],
                            ["1", "Jan Matejko", "14 października 1257", "8 lutego 1296", "26 czerwca 1295",	"8 lutego 1296"],
                            ["2", "August III Sus", "17 października 1696", "5 października 1763", "5 października 1733", "5 października 1763"],
                            ["3", "August II Mocny", "2 maja 1670", "1 lutego 1733", "15 września 1697", "1 lutego 1733"],
                            ["4", "Bolesław Drugi", "967", "17 czerwca 1025", "18 kwietnia 1025", "17 czerwca 1025"],
                            ["5", "Jan Drugi", "14 października 1257", "8 lutego 1296", "26 czerwca 1295",	"8 lutego 1296"],
                            ["6", "August 2.0", "17 października 1696", "5 października 1763", "5 października 1733", "5 października 1763"],
                            ["7", "August 3.0", "2 maja 1670", "1 lutego 1733", "15 września 1697", "1 lutego 1733"],
                        ]
                        console.log("Using mock table", mock_table)

                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setCommand("");
                        setPositionInHistory(commandHistory.length + 1)
                        setServerResponse("")
                        setTableResponse(mock_table)
                    }
                    else if (command.toLowerCase().trim() == "clear")
                    {
                        setCommand("");
                        setServerResponse("");
                        setPositionInHistory(0);
                        setCommandHistory([]);
                        setCommandResult("");
                        setTableResponse([]);
                    } else if (command.toLowerCase().trim() == "handshake") {
                        setServerResponse("")
                        sendHandshake();
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setCommand("");
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    } else if (tokenizedCommand.length > 1 && tokenizedCommand[0] == "PAGING") {
                        // Rest of arguments are ignored - we can change it for required precise 2 arguemnts

                        // TODO: Fix "delay"
                        console.log("Setting paging from: ", pagingValue, tokenizedCommand)

                        const newPagingValue = tokenizedCommand[1];
                        if (newPagingValue === "OFF")
                        {
                            setPagingValue(0)
                            console.log("Set paging to ", pagingValue)
                        }
                        else if (newPagingValue === "ON" && pagingValue === 0)
                        {
                            setPagingValue(DEFAULT_PAGING_VALUE)
                            console.log("Set paging to ", pagingValue, DEFAULT_PAGING_VALUE)
                        }
                        else if (pagingValue > 0 && parseInt(newPagingValue) > 0)
                        {
                            setPagingValue(parseInt(newPagingValue))
                            console.log("Set paging to ", pagingValue)
                        }

                        console.log("Now paging is: ", pagingValue, newPagingValue)
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setServerResponse("")
                        setCommand("");
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    } else if (tokenizedCommand.length == 1 && tokenizedCommand[0] == "CONSISTENCY") {
                        setServerResponse("Current consistency level is " + driver.getConsistency() + ".")
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setCommand("");
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    } else if (tokenizedCommand.length == 2 && tokenizedCommand[0] == "CONSISTENCY") {
                        setServerResponse(driver.setConsistency(tokenizedCommand[1]) == 0 ?
                            "Successfully changed consistency level to " + tokenizedCommand[1] + "." :
                            "Invalid consistency level")
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setCommand("");
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    } else if (command && command.length)
                    {
                        if (editMode && command.trim().slice(-1) !== ';') // Commands are to end with semicolon
                            break;

                        setServerResponse("")
                        sendMsg(driver.query(command));
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setCommand("");
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    }
                    break;

                // When the ArrowDown key is pressed we move up in the command history
                case "ArrowDown":
                    if (positionInHistory < commandHistory.length && !editMode) {
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
                    if (positionInHistory > 0 && !editMode) {
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
    }, [command, commandHistory, positionInHistory, driver]);

    return (
        <div className={classes.terminalContainer}>
            <TerminalHistory
                history={commandHistory}
            />
            <Input value={command} keyspaceName={driver.getKeyspace()} changeValue={changeCommand}/>
             <ServerResponse
                websocket={webSocket}
                response={serverResponse}
                setResponse={setServerResponse}
                tableResponse={tableResponse}
                setTableResponse={setTableResponse}
                driver={driver}
                sendMsg={sendMsg}
            />
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
