import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import { CQLDriver } from "../CQL-Driver/src/Driver";
import Terminal from "./Terminal";

interface TableProps {
    driver : CQLDriver;
    headers: string[]; 
    data: string[][];
    sendMsg: any;
}

function TableDisplayer({driver, headers, data, sendMsg} : TableProps)
{
    const classes = useStyles();

    const page = 107; // mock page number
    const header = headers.map((ele, i) => {
        return <th className={classes.cellTh} key = {i}>{ele}</th>
    })

    let content =data.map((row, rowId) => {
        return <tr key = {rowId}>
            {row.map((ele, id) => {
                return <td className={classes.cellTd} key={id}>{ele}</td>
            })}
        </tr>
    })

    const onBack = () => {
        const previousPageQuery = driver.getPreviousPageQuery();
        if (previousPageQuery != null) {
            sendMsg (previousPageQuery)
        }
    }    
    const onNext = () => {        
        const nextPageQuery = driver.getNextPageQuery();
        if (nextPageQuery != null) {
            sendMsg (nextPageQuery)
        }
    }

    return (
        <table
            cellSpacing={"0"}
            className={classes.cellTable} 
        >
            <thead>
                <tr>
                    {header}
                </tr>
            </thead>
            <tbody>
                {content}
            </tbody>
            <tfoot>
                <td colSpan={headers.length} className={classes.cellTd} >
                    <button className={classes.tableButton} onClick={onBack}>
                        Back
                    </button>
                    <label className={classes.tableLabel}>{page}</label>
                    <button className={classes.tableButton} onClick={onNext}>
                        Next
                    </button>
                </td>
            </tfoot>
        </table>
    )
}

const useStyles = makeStyles(theme => ({
    cellTable:  {
        width: "auto",
        height: "auto",
        padding: "10px"
    },

    cellTh:  {
        border: "1px solid lightblue;"
    },

    cellTd:  {
        border: "1px solid lightblue;",
        textAlign: "center"
    },

    tableLabel: {
        padding: "0 15px"
    },

    tableButton: {
        color: "#494949",
        textTransform: "uppercase",
        textDecoration: "none",
        background: "#ffffff",
        padding: "5px",
        fontSize: "15px",
        fontWeight: 'bold',
        borderRadius: "5px",
        border: "3px solid lightblue",
        display: "inline-block",
        transition: "all 0.4s ease 0s",

        '&:hover': {
            color: "navy",
            background: "#f6b93b",
            borderColor: "#f6b93b",
            transition: "all 0.4s ease 0s",
        }
    },

}));

export default TableDisplayer;
