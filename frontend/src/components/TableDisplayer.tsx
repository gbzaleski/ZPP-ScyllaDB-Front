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

    const [page, setPageCount] = useState(driver.getPageNumber() + 1);
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

    const [back, setDisableOnBack] = React.useState(page == 1);
    const [next, setDisableOnNext] = React.useState(false);
    const setDisable = () => {
        setDisableOnNext(driver.hasNextPage())
        setDisableOnBack(driver.hasPreviousPage())
    }

    const onBack = () => {
       driver.getPreviousPageQuery();
    }
    
    const onNext = () => {        
        driver.getNextPageQuery();
    }

    return (
        <div className={classes.tableRoller}>
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
                        <button disabled={back} className={classes.tableButton} onClick={onBack}>
                            Back
                        </button>
                        <label className={classes.tableLabel}>{page}</label>
                        <button disabled={next} className={classes.tableButton} onClick={onNext}>
                            Next
                        </button>
                    </td>
                </tfoot>
            </table>
        </div>
    )
}

const useStyles = makeStyles(theme => ({
    cellTable:  {
        width: "auto",
        height: "auto",
        padding: "10px"
    },

    cellTh:  {
        border: "1px solid lightblue;",
        padding: "10px",
    },

    cellTd:  {
        border: "1px solid lightblue;",
        textAlign: "center",
        padding: "5px",
    },

    tableLabel: {
        padding: "0 15px"
    },

    tableButton: {
        color: "#494949",
        textTransform: "uppercase",
        textDecoration: "none",
        background: "#eeeeee",
        padding: "5px",
        fontSize: "15px",
        fontWeight: 'bold',
        borderRadius: "5px",
        border: "3px solid lightblue",
        display: "inline-block",
        transition: "all 0.4s ease 0s",

        '&:hover': {
            color: "#3a2d55",
            background: "#57d1e5",
            borderColor: "#57d1e5",
            transition: "all 0.4s ease 0s",
        },

        '&:hover:active': {
            background: "#77e1ff",
            borderColor: "#77e1ff",
            boxShadow: "0px 0px 25px 2px  rgba(77, 225, 255, 0.7)",
            transition: "none",
        },

        '&:disabled': {
            color: "#666666",
            background: "#aaaaaa",
            borderColor: "#bbbbbb",
        },

        '&:disabled:active': {
            color: "#666666",
            background: "#aaaaaa",
            borderColor: "#bbbbbb",
            boxShadow: "none",
        },
    },

    tableRoller: {
        overflowX: 'auto',
    },

}));

export default TableDisplayer;
