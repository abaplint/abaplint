import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Check extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CHECK /.test(str)) {
            return new Check(tokens);
        }
        return undefined;
    }

}