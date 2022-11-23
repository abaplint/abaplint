import {ObjectLiteralExpression, PropertyAssignment} from "ts-morph";
import {handleExpression} from "../expressions";

export class MorphObjectLiteral {
  public run(s: ObjectLiteralExpression) {

    let body = "";

    for (const p of s.getProperties()) {
      if (p instanceof PropertyAssignment) {
        body += " " + p.getName() + " = " + handleExpression(p.getInitializer());
      }
    }

    return `VALUE #(${body} )`;
  }
}