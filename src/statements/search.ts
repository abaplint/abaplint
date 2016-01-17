import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Search extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SEARCH /.test(str)) {
            return new Search(tokens);
        }
        return undefined;
    }

}