
interface TerminalHistoryProp 
{
  history: string[];
}

function TerminalHistory({ history } : TerminalHistoryProp) : JSX.Element
{
    const list = history.map((e, i) => e ? <div key = {i}>{e}</div> : <div key = {i}>_</div>)

    return <div>{list.slice(-10)}</div>;
}

export default TerminalHistory