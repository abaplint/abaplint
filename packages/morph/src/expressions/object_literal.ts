import {ObjectLiteralExpression, PropertyAssignment, ShorthandPropertyAssignment} from "ts-morph";
import {handleExpression} from "../expressions";
import {MorphSettings} from "../statements";

export class MorphObjectLiteral {
  public run(s: ObjectLiteralExpression, settings: MorphSettings) {

    let body = "";

    for (const p of s.getProperties()) {
      if (p instanceof PropertyAssignment) {
        body += " " + p.getName() + " = " + handleExpression(p.getInitializer(), settings);
      } else if (p instanceof ShorthandPropertyAssignment) {
        body += " " + p.getName() + " = " + p.getName();
      } else {
        console.dir("todo, MorphObjectLiteral: " + p.constructor.name);
      }
    }

    return `VALUE #(${body} )`;
  }
}