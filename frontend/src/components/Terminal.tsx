import React, {useEffect, useState, useRef} from "react";
import TerminalHistory from "./TerminalHistory";
import LaunchForm from "./LaunchForm";

import {makeStyles} from "@material-ui/core/styles";
import Input from "./Input";
import ServerResponse from "./ServerResponse";
import {CQLDriver} from "../CQL-Driver/src/Driver";

const Terminal = () => {
    const [command, setCommand] = useState("");
    const [commandResult, setCommandResult] = useState("");
    const [commandHistory, setCommandHistory] = useState<Array<string>>([]);
    const [positionInHistory, setPositionInHistory] = useState(0);
    const [serverResponse, setServerResponse] = useState<[string, string]>(["", ""]);

    const wrappedSetServerReponse = (elem : any) => {
        setServerResponse(elem);

        setLoadingMode(false);
        setReauthorisationMode(false);
        if (elem[1] === "Authentication Error")
        {
            setPanelErrorMsg("Authorisation failed!");
            setReauthorisationMode(true);
        }
    }

    const [tableResponse, setTableResponse] = useState<Array<Array<string>>>([[]]);
    const [editMode, setEditMode] = useState(false);

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const webSocket:any = useRef();
    const [driver, setDriver] = useState(new CQLDriver());
    const classes = useStyles();

    const [adress, setAddress] = useState<string>("localhost");
    const [port, setPort] = useState<string>("8222");
    const [login, setLogin] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isFormPassed, setFormPassed] = useState(false);

    const [reauthorisationMode, setReauthorisationMode] = useState(false);
    const [loadingMode, setLoadingMode] = useState(false);
    const [panelErrorMsg, setPanelErrorMsg] = useState<string>("");

    const changeCommand = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCommand(event.target.value.length && event.target.value[0].trim() === '' ? 
            event.target.value.slice(1) : event.target.value);
    } 

    const clearInput = () => {
        setCommand("");

        if (textAreaRef && textAreaRef.current && textAreaRef.current.selectionStart 
            && textAreaRef.current.selectionEnd)
        {
            textAreaRef.current.selectionStart = 0;
            textAreaRef.current.selectionEnd = 0;
            textAreaRef.current.setSelectionRange(0, 0)
            textAreaRef.current.focus();
        }
    }

    const sendConnect = (driver : CQLDriver, username : string, password : string) => {
        driver.connect(wrappedSetServerReponse, setTableResponse, username, password);
    }

    function sleep(ms : number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const connectUser = async () => {
        
        setLoadingMode(true);
        
        driver.recreate(adress, port).then(async () => {
            sendConnect(driver, login, password);
            setServerResponse(["", ""])
            clearInput();
            setTableResponse([]);
            await sleep(1500);
        })
        .catch((e) => {
            console.log(e)
            console.log("Could not connect")
        })

    }

    const authorise = async () => {
        
        setReauthorisationMode(true);
        setLoadingMode(true);
        await sleep(1500);

        driver.authenticate(login, password);
        setLoadingMode(false);
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
                        clearInput();
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    }
                    else if (command.toLowerCase().trim() == "short")
                    {
                        setEditMode(false)
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        clearInput();
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1)
                    }
                    else if (command.toLowerCase().trim() == "clear")
                    {
                        clearInput();
                        setServerResponse(["", ""]);
                        setPositionInHistory(0);
                        setCommandHistory([]);
                        setCommandResult("");
                        setTableResponse([]);
                    } else if (tokenizedCommand.length > 1 && tokenizedCommand[0] == "PAGING") {
                        // Rest of arguments are ignored - we can change it for required precise 2 arguemnts
                        const newPagingMode = tokenizedCommand[1].trim();

                        let newPagingValue
                        if (tokenizedCommand.length > 2) {
                            newPagingValue = tokenizedCommand[2].trim();
                        } else {
                            newPagingValue = "";
                        }
                        
                        if (newPagingMode === "OFF")
                        {
                            driver.setPaging("OFF")
                        }
                        else if (newPagingMode === "ON" && newPagingValue === "")
                        {
                            driver.setPaging("ON")
                        }
                        else if (newPagingMode === "ON" && parseInt(newPagingValue) > 0)
                        {
                            driver.setPaging("ON", parseInt(newPagingValue))
                        }

                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        setServerResponse(["", ""])
                        clearInput();
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    } else if (tokenizedCommand.length > 1 && tokenizedCommand[0] == "PREPARE") {

                        const prepareArg = command.slice(tokenizedCommand[0].length).trim()
                        // Tu jakies wys??anie tego


                        // Tu jakis odbi??r
                        driver.prepare(prepareArg)
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        clearInput();
                        setServerResponse(["",""])
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    } else if (tokenizedCommand.length > 1 && tokenizedCommand[0] == "EXECUTE") {
                        
                        const executeArgs : Array<string> = tokenizedCommand.slice(1);
                        console.log("Executing ", executeArgs)

                        // Tu jakies wys??anie tego
                       

                        // Tu jakis odbi??r
                        driver.execute(executeArgs[0], executeArgs.slice(1))
                        
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        clearInput();
                        setServerResponse(["", ""])
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    } else if (tokenizedCommand.length == 1 && tokenizedCommand[0] == "CONSISTENCY") {
                        setServerResponse(["Current consistency level is " + driver.getConsistency() + ".", ""])
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        clearInput();
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    } else if (tokenizedCommand.length == 2 && tokenizedCommand[0] == "CONSISTENCY") {
                        setServerResponse([driver.setConsistency(tokenizedCommand[1]) == 0 ?
                            "Successfully changed consistency level to " + tokenizedCommand[1] + "." :
                            "Invalid consistency level", ""])
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        clearInput();
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    } else if (command && command.length)
                    {
                        if (editMode && command.trim().slice(-1) !== ';') // Commands are to end with semicolon
                            break;

                        setServerResponse(["", ""])
                        driver.query(command);
                        setCommandHistory((prevState: Array<string>) => [...prevState, command]);
                        clearInput();
                        setTableResponse([]);
                        setPositionInHistory(commandHistory.length + 1);
                    }
                    break;

                // When the ArrowDown key is pressed we move up in the command history
                case "ArrowDown":
                    if (positionInHistory < commandHistory.length && !editMode) {
                        event.preventDefault();
                        setPositionInHistory(prevState => prevState + 1);

                        // Dependently on position command is either retrieved from history or empty
                        if (positionInHistory + 1 == commandHistory.length) {
                            clearInput();
                        } else {
                            setCommand(commandHistory[positionInHistory + 1]);
                        }
                    }
                    break;

                // When the ArrowUp key is pressed we move down in the command history
                case "ArrowUp":
                    if (positionInHistory > 0 && !editMode) {
                        event.preventDefault();
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

    const logo = require("../assets/logo.webp").default;

    return (
        <div className={classes.terminalContainer}>
            {(!isFormPassed || reauthorisationMode || loadingMode) && <LaunchForm 
                 adress={adress}
                 setAddress={setAddress}
                 port={port}
                 setPort={setPort}
                 login={login}
                 setLogin={setLogin}
                 password={password}
                 setPassword={setPassword}
                 setFormPassed={setFormPassed}
                 connectUser={connectUser}

                 reauthorisationMode={reauthorisationMode}
                 authorise={authorise}
                 loadingMode={loadingMode}
                 errorMsg={panelErrorMsg}
                 setErrorMsg={setPanelErrorMsg}
            />}
            <img 
                src={logo} 
                style={{
                    opacity: 0.2,
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    height: "52%",
                }}
            />
            <TerminalHistory
                history={commandHistory}
            />
            <Input 
                value={command} 
                keyspaceName={driver.getKeyspace()} 
                changeValue={changeCommand}
                ref={textAreaRef}
            />
             <ServerResponse
                websocket={webSocket}
                response={serverResponse}
                setResponse={setServerResponse}
                tableResponse={tableResponse}
                setTableResponse={setTableResponse}
                driver={driver}
            />
        </div>
    );
}

const useStyles = makeStyles(theme => ({
    terminalContainer: {
        height: "100%",
        width: "100%",
        backgroundColor: "#161616",
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
