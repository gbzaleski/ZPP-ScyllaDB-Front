import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import TableDisplayer from "./TableDisplayer";

interface ServerResponseProps {
    driver: any;
    websocket: any;
    response: [string, string];
    setResponse: (s: [string, string]) => void;
    tableResponse: string[][];
    setTableResponse: (s: string[][]) => void;
}

const ServerResponse = ({driver, websocket, response, setResponse, tableResponse, setTableResponse} : ServerResponseProps) => {
    const classes = useStyles();

    const errorResponse = (message : string, errorType : string) => 
        <div className={classes.errorStruct}> <span className={classes.errorTag}>{errorType}:</span> {message}</div>;

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
                />
            :   
            (<div className={classes.lineContainer}>
                    <div className={classes.terminalSign}>
                        {'>'}
                    </div>
                    <div className={classes.inputContainer}>
                        {response[1] ? errorResponse(response[0], response[1]) : response}
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
  
    errorTag: {
        color: "#F44336",
        fontWeight: 900,
    },
}));


export  default  ServerResponse;
