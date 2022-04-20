const getAuthenticationMessage = (username : string, password: string) => {
    let buffer = Frame();

    setOpcode(buffer, "EXECUTE");
    setVersion(buffer, 4);

    setLength(buffer, 2n)
    const usr = bufferToString(Buffer.from(username))
    const pwd = bufferToString(Buffer.from(password))
    const body = bufferToBytes(Buffer.concat([usr, pwd]))
    setLength(buffer, body.length)

    buffer.concat(buffer, body)

    return buffer;
}
export default getAuthenticationMessage;
