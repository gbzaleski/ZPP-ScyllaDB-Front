import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {DEFUALT_ADDRESS, DEFAULT_PORT} from "../consts"

interface LaunchFormProps {
    adress : string;
    setAddress : (s : string) => void;
    port : string;
    setPort : (s : string) => void;
    login : string, 
    setLogin : (s : string) => void;
    password : string;
    setPassword : (s : string) => void;
    setFormPassed : (b : boolean) => void;
}

function LaunchForm({adress, setAddress, port, setPort, login, setLogin, password, setPassword, setFormPassed} : LaunchFormProps)
{
    const classes = useStyles();

    const changeAddress =  (event : React.ChangeEvent<HTMLInputElement>) => {
        setAddress(event.target.value.length && event.target.value[0].trim() === '' ? 
            event.target.value.slice(1) : event.target.value);
    }

    const changePort = (event : React.ChangeEvent<HTMLInputElement>)  => {
        setPort(event.target.value.length && event.target.value[0].trim() === '' ? 
            event.target.value.slice(1) : event.target.value);
    }

    const changeLogin =  (event : React.ChangeEvent<HTMLInputElement>) => {
        setLogin(event.target.value.length && event.target.value[0].trim() === '' ? 
            event.target.value.slice(1) : event.target.value);
    }

    const changePassword = (event : React.ChangeEvent<HTMLInputElement>)  => {
        setPassword(event.target.value.length && event.target.value[0].trim() === '' ? 
            event.target.value.slice(1) : event.target.value);
    }

    const submitForm = (e : any) => {
        e.preventDefault();

        if (adress === "")
            setAddress(DEFUALT_ADDRESS);

        if (port == "")
            setPort(DEFAULT_PORT);

        //console.log(adress, port, login, password)
        setFormPassed(true);
    }

    return <div className={classes.blurredBackground}>
        <form className={classes.content} onSubmit={submitForm} >
            <div className={classes.element}>
                <div>Address:</div>
                <input
                    defaultValue=""
                    value={adress}
                    onChange={changeAddress}
                    placeholder={DEFUALT_ADDRESS}
                />
            </div>

            <div className={classes.element}>
                <div>Port:</div>
                <input
                    defaultValue=""
                    value={port}
                    onChange={changePort}
                />
            </div>

            <div className={classes.element}>
                <div>Username:</div>
                <input
                    defaultValue=""
                    value={login}
                    onChange={changeLogin}
                />
            </div>

            <div className={classes.element}>
                <div>Password:</div>
                <input
                    defaultValue=""
                    value={password}
                    onChange={changePassword}
                    type="password"
                />
            </div>

            <button>
                Connect
            </button>
        </form>
    </div>
}

const useStyles = makeStyles(theme => ({
    blurredBackground: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundSize: "cover",
        backgroundColor: "#161616",
        opacity:"0.8",
        //filter: "blur(5px)", TODO: Blur
    },

    content: {
        fontSize: "80%",
        backgroundColor: "#0b0b61",
        width: "fit-content",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        padding: "25px",
        borderRadius: "15px",
    },

    element: {
        marginBottom: "10px",
    }
}));

export default LaunchForm;