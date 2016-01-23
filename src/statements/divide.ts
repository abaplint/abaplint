import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Divide extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^DIVIDE /.test(str)) {
            return new Divide(tokens);
        }
        return undefined;
    }

}