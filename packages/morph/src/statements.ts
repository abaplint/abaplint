import {ClassDeclaration, ExpressionStatement, ReturnStatement, Statement} from "ts-morph";
import {MorphClassDeclaration} from "./statements/class_declaration";
import {MorphExpression} from "./statements/expression";
import {MorphReturn} from "./statements/return";

export function handleStatement(s: Statement): string {
  if (s instanceof ClassDeclaration) {
    return new MorphClassDeclaration().run(s);
  } else if (s instanceof ExpressionStatement) {
    return new MorphExpression().run(s);
  } else if (s instanceof ReturnStatement) {
    return new MorphReturn().run(s);
  } else {
    console.log(s.constructor.name);
  }
  return "";
}

export function handleStatements(statements: Statement[]): string {
  let ret = "";
  for (const s of statements) {
    ret += handleStatement(s);
  }
  return ret;
}