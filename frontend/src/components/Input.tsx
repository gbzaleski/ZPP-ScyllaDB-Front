import React, { forwardRef } from "react";
import {makeStyles} from "@material-ui/core/styles";

interface InputProps {
    value: string;
    keyspaceName: string;
    changeValue: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Input = forwardRef<HTMLTextAreaElement, InputProps>(({value, keyspaceName, changeValue}, ref) => {

    const classes = useStyles();

    return(
        <div>
            <hr/>
            <div className={classes.lineContainer}>
                Input: ~/{keyspaceName}{keyspaceName ? "/" : ""}
            </div>
            <div className={classes.lineContainer}>
                <div className={classes.terminalSign}>
                    {'>'}
                </div>
                <textarea
                    className={classes.inputContainer}
                    defaultValue=""
                    value={value}
                    onChange={changeValue}
                    ref={ref}
                    id="inputTextArea"
                />
            </div>
        </div>
    );
});

const useStyles = makeStyles(theme => ({
    lineContainer:  {
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "flex-start"
    },
    inputContainer: {
        width: "98%",
        backgroundColor: "#161616",
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