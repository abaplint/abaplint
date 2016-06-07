import { Statement } from "./statement";
import { Token } from "../tokens/";

export class IncludeType extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^INCLUDE TYPE/.test(str)) {
            return new IncludeType(tokens);
        }
        return undefined;
    }

}