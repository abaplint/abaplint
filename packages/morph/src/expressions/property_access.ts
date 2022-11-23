import {PropertyAccessExpression} from "ts-morph";

export class MorphPropertyAccess {
  public run(s: PropertyAccessExpression) {
    let text = s.getText();
    if (text.startsWith("this.")) {
      text = text.replace("this.", "me->");
    }
    while (text.includes(".")) {
      text = text.replace(".", "->");
    }
    return text;
  }
}