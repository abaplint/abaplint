import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Method extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^(CLASS-)?METHOD(S?)(:?) /.test(str)) {
            return new Method(tokens);
        }
        return undefined;
    }

}