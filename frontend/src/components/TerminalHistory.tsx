import React, {useEffect, useState} from "react";

interface TerminalHistoryProp {
    history: string[];
  }

function TerminalHistory({ history }: TerminalHistoryProp) : JSX.Element
{
    const list = history.map(e => e ? <div>{e}</div> : <div>_</div>)

    return <div>{list.slice(-10)}</div>;
}

export default TerminalHistory