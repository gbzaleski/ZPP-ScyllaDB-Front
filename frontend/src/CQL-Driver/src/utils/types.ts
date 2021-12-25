export type Byte = {
    byte: Buffer
};

export type Short = {
    short: Buffer
};

export type Int = {
    int: Buffer
};

export type Long = {
    long: Buffer
};

export type Uuid = {
    uuid: Buffer
};

export type Consistency = {
    consistency: Short,
    name : string
}

export type String = {
    length: Short
    string: Buffer
}

export type LongString = {
    length: Int
    longString: Buffer
}

export type StringList = {
    length: Short
    stringList: Buffer
}

export type bytes = {
    length: Int
    bytes: Buffer
}

export type value = {
    length: Int
    value: Buffer
}

export type shortBytes = {
    length: Short
    shortBytes: Buffer
}

export type stringMap = {
    length: Short
    stringMap: Buffer
}


