import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Shift extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SHIFT/.test(str)) {
            return new Shift(tokens);
        }
        return undefined;
    }

}