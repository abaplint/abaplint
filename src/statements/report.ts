import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Report extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^REPORT/.test(str)) {
            return new Report(tokens);
        }
        return undefined;
    }

}