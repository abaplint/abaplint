import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Do extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^DO/.test(str)) {
            return new Do(tokens);
        }
        return undefined;
    }

}