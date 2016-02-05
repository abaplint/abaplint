import { Statement } from "./statement";
import { Token } from "../tokens/";

export class SyntaxCheck extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SYNTAX-CHECK /.test(str)) {
            return new SyntaxCheck(tokens);
        }
        return undefined;
    }

}