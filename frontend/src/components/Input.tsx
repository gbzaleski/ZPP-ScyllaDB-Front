import React from "react";
import {makeStyles} from "@material-ui/core/styles";

interface InputProps {
    value: string;
<<<<<<< HEAD
    keyspaceName: string;
    changeValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
=======
    changeValue: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
>>>>>>> multi-line-commands
}

const Input = ({value, keyspaceName, changeValue}: InputProps) => {
    const classes = useStyles();

    return(
        <div>
            <hr/>
            <div className={classes.lineContainer}>
                Input
            </div>
            <div className={classes.lineContainer}>
                <div>
                    {keyspaceName}
                </div>
                <div>
                <div className={classes.terminalSign}>
                    {'>'}
                </div>
                <textarea
                    className={classes.inputContainer}
                    value={value}
                    onChange={changeValue}
                />
            </div>
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

export default Input;