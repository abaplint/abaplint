import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Protected extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^PROTECTED SECTION/.test(str)) {
            return new Protected(tokens);
        }
        return undefined;
    }

}