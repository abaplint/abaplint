import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Interface extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^INTERFACE(S)? /.test(str)) {
            return new Interface(tokens);
        }
        return undefined;
    }

}