import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Try extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^TRY/.test(str)) {
            return new Try(tokens);
        }
        return undefined;
    }

}