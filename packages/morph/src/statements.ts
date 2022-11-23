import {Block, BreakStatement, ClassDeclaration, ExpressionStatement, ForStatement, IfStatement, InterfaceDeclaration, ReturnStatement, Statement, TypeAliasDeclaration, VariableStatement} from "ts-morph";
import {MorphClassDeclaration} from "./statements/class_declaration";
import {MorphExpression} from "./statements/expression";
import {MorphFor} from "./statements/for";
import {MorphIf} from "./statements/if";
import {MorphInterfaceDeclaration} from "./statements/interface_declaration";
import {MorphReturn} from "./statements/return";
import {MorphTypeAliasDeclaration} from "./statements/type_alias_declaration";
import {MorphVariable} from "./statements/variable";

export function handleStatement(s: Statement): string {
  if (s instanceof ClassDeclaration) {
    return new MorphClassDeclaration().run(s);
  }else if (s instanceof InterfaceDeclaration) {
    return new MorphInterfaceDeclaration().run(s);
  } else if (s instanceof BreakStatement) {
    return "EXIT.\n";
  } else if (s instanceof ExpressionStatement) {
    return new MorphExpression().run(s);
  } else if (s instanceof TypeAliasDeclaration) {
    return new MorphTypeAliasDeclaration().run(s);
  } else if (s instanceof VariableStatement) {
    return new MorphVariable().run(s);
  } else if (s instanceof Block) {
    return handleStatements(s.getStatements());
  } else if (s instanceof IfStatement) {
    return new MorphIf().run(s);
  } else if (s instanceof ForStatement) {
    return new MorphFor().run(s);
  } else if (s instanceof ReturnStatement) {
    return new MorphReturn().run(s);
  } else {
    console.dir(s.constructor.name + " - handleStatement");
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