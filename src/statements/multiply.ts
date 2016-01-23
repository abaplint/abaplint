import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Multiply extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^MULTIPLY /.test(str)) {
            return new Multiply(tokens);
        }
        return undefined;
    }

}