import { expect } from 'chai';
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
    it('Scenario One', async () => {
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

                } catch (error: any) {
                    console.log("Expected: ", error.expected)
                    console.log("But got: ", error.actual)

                    return false
                }
                return true
            })
            .catch((msg: string) => {
                false
            }))).to.equal(true)
    });
});

