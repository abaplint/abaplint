import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Collect extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^COLLECT /.test(str)) {
            return new Collect(tokens);
        }
        return undefined;
    }

}