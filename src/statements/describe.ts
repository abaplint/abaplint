import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Describe extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^DESCRIBE /.test(str)) {
            return new Describe(tokens);
        }
        return undefined;
    }

}