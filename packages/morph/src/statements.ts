import {Block, BreakStatement, ClassDeclaration, EnumDeclaration, ExpressionStatement, ForStatement, IfStatement, InterfaceDeclaration, ReturnStatement, Statement, TypeAliasDeclaration, VariableStatement} from "ts-morph";
import {MorphClassDeclaration} from "./statements/class_declaration";
import {MorphEnumDeclaration} from "./statements/enum_declaration";
import {MorphExpression} from "./statements/expression";
import {MorphFor} from "./statements/for";
import {MorphIf} from "./statements/if";
import {MorphInterfaceDeclaration} from "./statements/interface_declaration";
import {MorphReturn} from "./statements/return";
import {MorphTypeAliasDeclaration} from "./statements/type_alias_declaration";
import {MorphVariable} from "./statements/variable";

export type MorphSettings = {
  globalObjects: boolean,
  nameMap: {[name: string]: string},
};

export function handleStatement(s: Statement, settings: MorphSettings): string {
  if (s instanceof ClassDeclaration) {
    return new MorphClassDeclaration().run(s, settings);
  }else if (s instanceof InterfaceDeclaration) {
    return new MorphInterfaceDeclaration().run(s, settings);
  } else if (s instanceof BreakStatement) {
    return "EXIT.\n";
  } else if (s instanceof ExpressionStatement) {
    return new MorphExpression().run(s, settings);
  } else if (s instanceof TypeAliasDeclaration) {
    return new MorphTypeAliasDeclaration().run(s, settings);
  } else if (s instanceof EnumDeclaration) {
    return new MorphEnumDeclaration().run(s);
  } else if (s instanceof VariableStatement) {
    return new MorphVariable().run(s, settings);
  } else if (s instanceof Block) {
    return handleStatements(s.getStatements(), settings);
  } else if (s instanceof IfStatement) {
    return new MorphIf().run(s, settings);
  } else if (s instanceof ForStatement) {
    return new MorphFor().run(s, settings);
  } else if (s instanceof ReturnStatement) {
    return new MorphReturn().run(s, settings);
  } else {
    console.dir(s.constructor.name + " - handleStatement");
  }
  return "";
}

export function handleStatements(statements: Statement[], settings: MorphSettings): string {
  let ret = "";
  for (const s of statements) {
    ret += handleStatement(s, settings);
  }
  return ret;
}