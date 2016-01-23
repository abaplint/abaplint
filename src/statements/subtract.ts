import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Subtract extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SUBTRACT /.test(str)) {
            return new Subtract(tokens);
        }
        return undefined;
    }

}