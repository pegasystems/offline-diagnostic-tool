export function mapSoftFlag(row) {
    if (row.softflag !== undefined) {
        switch (row.softflag) {
            case 0: row.softflag = "0 (empty)"; break;
            case 1: row.softflag = "1 (deleted)"; break;
            case 2: row.softflag = "2 (new)"; break;
            case 3: row.softflag = "3 (local)"; break;
        }
    }
    return row
}

export function mapJsonToObject(row) {
    for (const propertyName in row) {
        // try parse string properties that are valid JSON
        const value = row[propertyName];
        if (typeof value === 'string') {
            const trimmed = value.trimEnd();
            const lastCharIndex = trimmed.length - 1;
            const lastChar = lastCharIndex >= 0 ? trimmed.charAt(lastCharIndex) : ""
            if (lastChar === '}' || lastChar === ']') {
                try {
                    row[propertyName] = JSON.parse(value)
                } catch (parsingError) {
                    // ignore
                }
            }
        }
    }
    return row
}