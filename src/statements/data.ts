import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Data extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^(CLASS-)?DATA /.test(str)) {
            return new Data(tokens);
        }
        return undefined;
    }

}