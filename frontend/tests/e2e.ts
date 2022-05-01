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
    /*it('Scenario One', async () => {
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
                    expect(await (check(0))).to.eql(["Connection properly established", ""])
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

    it('Scenario Two', async () => {
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
                    expect(await (check(0))).to.eql(["Connection properly established", ""])
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
    }).timeout(50000);*/


    it('Scenario Three', async () => {
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
                    expect(await (check(0))).to.eql(["Connection properly established", ""])
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
                        driver.execute(message[message.length - 1], ["2137"])
                    } else {
                        expect(true).to.eql(false)
                    }
                    expect(await (check(1))).to.have.lengthOf(4)
                    

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
    }).timeout(50000);
});

