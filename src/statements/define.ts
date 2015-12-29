import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Define extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^DEFINE /.test(str)) {
            return new Define(tokens);
        }
        return undefined;
    }

}