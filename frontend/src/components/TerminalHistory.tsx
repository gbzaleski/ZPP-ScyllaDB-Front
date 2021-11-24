import {makeStyles} from "@material-ui/core/styles";
import React from "react";

interface TerminalHistoryProp {
  history: string[];
}

const TerminalHistory = ({ history } : TerminalHistoryProp) : JSX.Element =>
{
    const classes = useStyles();
    const list = history.map((e, i) => e ?
        <div>
            <div className={classes.lineContainer}>
                <div className={classes.terminalSign}>
                    {'>'}
                </div>
                <div className={classes.inputContainer}>{e}</div>
            </div>
        </div> :
        <div className={classes.inputContainer} key = {i}>
            {'> '}
        </div>)

    return (
        <div>
            <div className={classes.lineContainer}>
                History
            </div>
            {list.slice(-10)}
        </div>
    );
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


export default TerminalHistory