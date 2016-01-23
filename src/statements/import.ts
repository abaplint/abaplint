import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Import extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^IMPORT /.test(str)) {
            return new Import(tokens);
        }
        return undefined;
    }

}