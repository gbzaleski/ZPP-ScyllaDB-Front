import {Consistency} from "../utils/types";
import {numberToShort} from "../utils/conversions";

const getConsistency = (value : string) : Consistency => {
    let consistencyCode = -1

    switch (value) {
        case "ANY": {
            consistencyCode = 0;
            break;
        }
        case "ONE": {
            consistencyCode = 1;
            break;
        }
        case "TWO": {
            consistencyCode = 2;
            break;
        }
        case "THREE": {
            consistencyCode = 3;
            break;
        }
        case "QUORUM": {
            consistencyCode = 4;
            break;
        }
        case "ALL": {
            consistencyCode = 5;
            break;
        }
        case "LOCAL_QUORUM": {
            consistencyCode = 6;
            break;
        }
        case "EACH_QUORUM": {
            consistencyCode = 7;
            break;
        }
        case "LOCAL_SERIAL": {
            consistencyCode = 8;
            break;
        }
        case "LOCAL_ONE": {
            consistencyCode = 9;
            break;
        }
    }

    return {
        name: value,
        consistency : numberToShort(BigInt(consistencyCode))
    };
}

export default getConsistency;