import { assert, expect } from 'chai';
import { CQLDriver } from "../src/CQL-Driver/src/Driver";

const waitForFlag = async (condition: () => Boolean) => {
    return new Promise<void>((resolve, reject) => {
        const interval = setInterval(() => {
            if (!condition()) { return };
            clearInterval(interval);
            resolve();
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            reject("Waited too long for response");
        }, 20000);
    });
};

describe('End to end tests', () => {
    it('Scenario One - Paging', async () => {
        let driver = new CQLDriver()

        let serverResponse = ["", ""]
        let tableResponse: string[][] = [[]]
        let gotFlag = false
        const setServerResponseWithFlag = (val: [string, string]): void => {
            serverResponse = val
            gotFlag = true
        }
        const setTableResponseWithFlag = (val: string[][]): void => {
            tableResponse = val
            gotFlag = true
        }
        const check = async (type : number) => {
            const val = await (waitForFlag(() => gotFlag)
                .then(async () => {
                    if (type == 0) {
                        return serverResponse
                    } else {
                        return tableResponse
                    }
                })
                .catch((msg: string[][]) => msg))
            return val
        }

        expect(await (waitForFlag(() => driver.isReady())
            .then(async () => {
                try {
                    driver.connect(setServerResponseWithFlag, setTableResponseWithFlag, "cassandra", "cassandra")
                    expect(await (check(0))).to.eql(["Successful authentication", ""])
                    gotFlag = false
                    driver.query("SELECT * FROM system_schema.keyspaces")
                    expect(await (check(1))).to.have.lengthOf(7)
                    driver.setPaging("ON", 4)
                    gotFlag = false
                    driver.query("SELECT * FROM system_schema.keyspaces")
                    expect(await (check(1))).to.have.lengthOf(5)
                    driver.setPaging("OFF")
                    gotFlag = false
                    driver.query("SELECT * FROM system_schema.keyspaces")
                    expect(await (check(1))).to.have.lengthOf(7)
                    driver.setPaging("ON", 4)
                    gotFlag = false
                    driver.query("SELECT * FROM system_schema.keyspaces")
                    expect(await (check(1))).to.have.lengthOf(5)
                    gotFlag = false
                    driver.getNextPageQuery()
                    expect(await (check(1))).to.have.lengthOf(3)
                    gotFlag = false
                    driver.getPreviousPageQuery()
                    expect(await (check(1))).to.have.lengthOf(5)
                    gotFlag = false
                } catch (error: any) {
                    console.log("Expected: ", error.expected)
                    console.log("But got: ", error.actual)
                    driver.endWebsocket()
                    return false
                }
                return true
            })
            .catch((msg: string) => {
                false
            }))).to.equal(true)
            driver.endWebsocket()
    });

    it('Scenario Two - Simple queries', async () => {
        let driver = new CQLDriver()

        let serverResponse = ["", ""]
        let tableResponse: string[][] = [[]]
        let gotFlag = false
        const setServerResponseWithFlag = (val: [string, string]): void => {
            serverResponse = val
            gotFlag = true
        }
        const setTableResponseWithFlag = (val: string[][]): void => {
            tableResponse = val
            gotFlag = true
        }
        const check = async (type : number) => {
            const val = await (waitForFlag(() => gotFlag)
                .then(async () => {
                    if (type == 0) {
                        return serverResponse
                    } else {
                        return tableResponse
                    }
                })
                .catch((msg: string[][]) => msg))
            return val
        }

        expect(await (waitForFlag(() => driver.isReady())
            .then(async () => {
                try {
                    driver.connect(setServerResponseWithFlag, setTableResponseWithFlag, "cassandra", "cassandra")
                    expect(await (check(0))).to.eql(["Successful authentication", ""])
                    gotFlag = false
                    // Deleting in case it already exists
                    driver.query("DROP KEYSPACE test")
                    console.log(await (check(0)))
                    gotFlag = false
                    driver.query("CREATE KEYSPACE test WITH REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 1}")
                    expect(await (check(0))).to.eql(["CREATED KEYSPACE test", ""])
                    gotFlag = false
                    driver.query("USE test")
                    expect(await (check(0))).to.eql(["Changed keyspace to test", ""])
                    gotFlag = false
                    driver.query("CREATE TABLE ttable (tid int PRIMARY KEY, name text, number int)")
                    expect(await (check(0))).to.eql(["CREATED TABLE test ttable", ""])
                    gotFlag = false
                    driver.query("SELECT * FROM ttable")
                    expect(await (check(1))).to.have.lengthOf(1)
                    gotFlag = false
                    driver.query("INSERT INTO ttable (tid, name, number) VALUES (1, 'test', 2137)")
                    driver.query("INSERT INTO ttable (tid, name, number) VALUES (2, 'testing', 2137)")
                    driver.query("INSERT INTO ttable (tid, name, number) VALUES (3, 'test', 42)")
                    driver.query("INSERT INTO ttable (tid, name, number) VALUES (4, 'tester', 2137)")
                    gotFlag = false
                    driver.query("SELECT * FROM ttable")
                    expect(await (check(1))).to.have.lengthOf(5)
                    gotFlag = false
                    driver.query("SELECT * FROM ttable WHERE number = 2137 ALLOW FILTERING")
                    expect(await (check(1))).to.have.lengthOf(4)
                    gotFlag = false
                    driver.query("SELECT * FROM ttable WHERE name = 'test' ALLOW FILTERING")
                    expect(await (check(1))).to.have.lengthOf(3)
                    gotFlag = false
                    driver.query("SELECT * FROM ttable WHERE tid = 3 ALLOW FILTERING")
                    expect(await (check(1))).to.have.lengthOf(2)

                } catch (error: any) {
                    console.log("Expected: ", error.expected)
                    console.log("But got: ", error.actual)
                    driver.endWebsocket()
                    return false
                }
                return true
            })
            .catch((msg: string) => {
                false
            }))).to.equal(true)
            driver.endWebsocket()
    }).timeout(5000);


    it('Scenario Three - Prepare and execute', async () => {
        let driver = new CQLDriver()

        let serverResponse = ["", ""]
        let tableResponse: string[][] = [[]]
        let gotFlag = false
        const setServerResponseWithFlag = (val: [string, string]): void => {
            serverResponse = val
            gotFlag = true
        }
        const setTableResponseWithFlag = (val: string[][]): void => {
            tableResponse = val
            gotFlag = true
        }
        const check = async (type : number) => {
            const val = await (waitForFlag(() => gotFlag)
                .then(async () => {
                    if (type == 0) {
                        return serverResponse
                    } else {
                        return tableResponse
                    }
                })
                .catch((msg: string[][]) => msg))
            return val
        }

        expect(await (waitForFlag(() => driver.isReady())
            .then(async () => {
                try {
                    driver.connect(setServerResponseWithFlag, setTableResponseWithFlag, "cassandra", "cassandra")
                    expect(await (check(0))).to.eql(["Successful authentication", ""])
                    gotFlag = false
                    // Deleting in case it already exists
                    driver.query("DROP KEYSPACE test")
                    console.log(await (check(0)))
                    gotFlag = false
                    driver.query("CREATE KEYSPACE test WITH REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 1}")
                    expect(await (check(0))).to.eql(["CREATED KEYSPACE test", ""])
                    gotFlag = false
                    driver.query("USE test")
                    expect(await (check(0))).to.eql(["Changed keyspace to test", ""])
                    gotFlag = false
                    driver.query("CREATE TABLE ttable (tid int PRIMARY KEY, name text, number int)")
                    expect(await (check(0))).to.eql(["CREATED TABLE test ttable", ""])
                    gotFlag = false
                    driver.query("SELECT * FROM ttable")
                    expect(await (check(1))).to.have.lengthOf(1)
                    gotFlag = false
                    driver.query("INSERT INTO ttable (tid, name, number) VALUES (1, 'test', -2137)")
                    driver.query("INSERT INTO ttable (tid, name, number) VALUES (2, 'testing', -2137)")
                    driver.query("INSERT INTO ttable (tid, name, number) VALUES (3, 'test', -42)")
                    driver.query("INSERT INTO ttable (tid, name, number) VALUES (4, 'tester', -2137)")
                    gotFlag = false
                    driver.query("SELECT * FROM ttable")
                    expect(await (check(1))).to.have.lengthOf(5)
                    gotFlag = false
                    driver.prepare("SELECT * FROM ttable WHERE number = ? ALLOW FILTERING")
                    const id = (await (check(0)))
                    console.log(id)
                    gotFlag = false
                    if (typeof id[0] == "string") {
                        const message = id[0].split(" ")
                        driver.execute(message[message.length - 1], ["-2137"])
                    } else {
                        expect(true).to.eql(false)
                    }
                    const execResponse = await (check (1))
                    expect(execResponse).to.have.lengthOf(4)
                    expect(execResponse[3]).to.include("-2137")

                } catch (error: any) {
                    console.log("Expected: ", error.expected)
                    console.log("But got: ", error.actual)
                    driver.endWebsocket()
                    return false
                }
                return true
            })
            .catch((msg: string) => {
                false
            }))).to.equal(true)
            driver.endWebsocket()
    }).timeout(5000); 

    it('Scenario Four authentication', async () => {
        let driver = new CQLDriver()

        let serverResponse = ["", ""]
        let tableResponse: string[][] = [[]]
        let gotFlag = false
        const setServerResponseWithFlag = (val: [string, string]): void => {
            serverResponse = val
            gotFlag = true
        }
        const setTableResponseWithFlag = (val: string[][]): void => {
            tableResponse = val
            gotFlag = true
        }
        const check = async (type : number) => {
            const val = await (waitForFlag(() => gotFlag)
                .then(async () => {
                    if (type == 0) {
                        return serverResponse
                    } else {
                        return tableResponse
                    }
                })
                .catch((msg: string[][]) => msg))
            return val
        }

        expect(await (waitForFlag(() => driver.isReady())
            .then(async () => {
                try {
                    driver.connect(setServerResponseWithFlag, setTableResponseWithFlag, "capandra", "capandra")
                    expect(await (check(0))).to.eql(["Username and/or password are incorrect", "Authentication Error"])
                    gotFlag = false
                    driver.authenticate("cassandra", "capandra")
                    expect(await (check(0))).to.eql(["Username and/or password are incorrect", "Authentication Error"])
                    gotFlag = false
                    driver.authenticate("cassandra", "cassandra")
                    expect(await (check(0))).to.eql(["Successful authentication", ""])
                    gotFlag = false  
                } catch (error: any) {
                    console.log("Expected: ", error.expected)
                    console.log("But got: ", error.actual)
                    driver.endWebsocket()
                    return false
                }
                return true
            })
            .catch((msg: string) => {
                false
            }))).to.equal(true)
            driver.endWebsocket()
    });


    it('Scenario Five - Error handling', async () => {
        let driver = new CQLDriver()

        let serverResponse = ["", ""]
        let tableResponse: string[][] = [[]]
        let gotFlag = false
        const setServerResponseWithFlag = (val: [string, string]): void => {
            serverResponse = val
            gotFlag = true
        }
        const setTableResponseWithFlag = (val: string[][]): void => {
            tableResponse = val
            gotFlag = true
        }
        const check = async (type : number) => {
            const val = await (waitForFlag(() => gotFlag)
                .then(async () => {
                    if (type == 0) {
                        return serverResponse
                    } else {
                        return tableResponse
                    }
                })
                .catch((msg: string[][]) => msg))
            return val
        }

        expect(await (waitForFlag(() => driver.isReady())
            .then(async () => {
                try {
                    driver.connect(setServerResponseWithFlag, setTableResponseWithFlag, "cassandra", "cassandra")
                    expect(await (check(0))).to.eql(["Successful authentication", ""])
                    gotFlag = false
                    // In case it exists
                    driver.query("DROP KEYSPACE testing")
                    console.log(await (check(0)))
                    gotFlag = false
                    driver.query("USE testing")
                    expect(await (check(0))).to.eql(["Keyspace 'testing' does not exist", "Invalid"])
                    gotFlag = false
                    driver.query("Setp")
                    expect(await (check(0))).to.eql(["line 1:0 no viable alternative at input 'Setp'", "Syntax Error"])
                    gotFlag = false
                    const val = driver.execute("2137", [])
                    expect(val).to.eql("Query with id 2137 is not prepared")
                } catch (error: any) {
                    console.log("Expected: ", error.expected)
                    console.log("But got: ", error.actual)
                    driver.endWebsocket()
                    return false
                }
                return true
            })
            .catch((msg: string) => {
                false
            }))).to.equal(true)
            driver.endWebsocket()
    });
});

