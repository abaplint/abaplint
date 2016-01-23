import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Refresh extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^REFRESH/.test(str)) {
            return new Refresh(tokens);
        }
        return undefined;
    }

}