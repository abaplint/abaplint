import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Constant extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CONSTANT(S?)(:?) /.test(str)) {
            return new Constant(tokens);
        }
        return undefined;
    }

}