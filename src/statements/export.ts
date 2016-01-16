import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Export extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^EXPORT /.test(str)) {
            return new Export(tokens);
        }
        return undefined;
    }

}