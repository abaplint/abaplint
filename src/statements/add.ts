import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Add extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ADD /.test(str)) {
            return new Add(tokens);
        }
        return undefined;
    }

}