import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Assign extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ASSIGN /.test(str)) {
            return new Assign(tokens);
        }
        return undefined;
    }

}