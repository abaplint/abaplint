import { Statement } from "./statement";

// this class is needed as the general statement class cannot be used
// as unknown, because everything will be instanceof it
export class Unknown extends Statement {

}