import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Initialization extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^INITIALIZATION/.test(str)) {
            return new Initialization(tokens);
        }
        return undefined;
    }

}