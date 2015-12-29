import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Message extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^MESSAGE /.test(str)) {
            return new Message(tokens);
        }
        return undefined;
    }

}