const getConsistencyName = (value : number) : string => {
    let consistencyName = ""

    switch (value) {
        case 0: {
            consistencyName = "ANY";
            break;
        }
        case 1: {
            consistencyName = "ONE";
            break;
        }
        case 2: {
            consistencyName = "TWO";
            break;
        }
        case 3: {
            consistencyName = "THREE";
            break;
        }
        case 4: {
            consistencyName = "QUORUM";
            break;
        }
        case 5: {
            consistencyName = "ALL";
            break;
        }
        case 6: {
            consistencyName = "LOCAL_QUORUM";
            break;
        }
        case 7: {
            consistencyName = "EACH_QUORUM";
            break;
        }
        case 8: {
            consistencyName = "LOCAL_SERIAL";
            break;
        }
        case 9: {
            consistencyName = "LOCAL_ONE";
            break;
        }
    }

    return consistencyName
}

export default getConsistencyName;