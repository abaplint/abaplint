import {ScopeType} from "./_scope_type";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Identifier} from "../4_file_information/_identifier";
import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {IFormDefinition} from "../types/_form_definition";
import {Position} from "../../position";
import {Issue} from "../../issue";
import {IReference} from "./_reference";
import {Token} from "../1_lexer/tokens/_token";

export interface IScopeIdentifier {
  stype: ScopeType;
  sname: string;
  filename: string;
  start: Position;
  end: Position | undefined;
}

export interface IScopeVariable {
  name: string;
  identifier: TypedIdentifier;
}

export interface IScopeData {
  vars: {[name: string]: TypedIdentifier};
  types: {[name: string]: TypedIdentifier};

  deferred: Token[];

  cdefs: IClassDefinition[];
  idefs: IInterfaceDefinition[];
  forms: IFormDefinition[];

  references: IReference[];
}

export interface ISpaghettiScopeNode {
  getParent(): ISpaghettiScopeNode | undefined;
  addChild(node: ISpaghettiScopeNode): void;
  getChildren(): ISpaghettiScopeNode[];
  getFirstChild(): ISpaghettiScopeNode | undefined;
  getIdentifier(): IScopeIdentifier;
  getData(): IScopeData;
  calcCoverage(): {start: Position, end: Position};
  findClassDefinition(name: string): IClassDefinition | undefined;
  findFormDefinition(name: string): IFormDefinition | undefined;
  listFormDefinitions(): IFormDefinition[];
  findInterfaceDefinition(name: string): IInterfaceDefinition | undefined;
  findType(name: string): TypedIdentifier | undefined;
  findVariable(name: string): TypedIdentifier | undefined;
  findScopeForVariable(name: string): IScopeIdentifier | undefined;
}

export interface ISpaghettiScope {
  listDefinitions(filename: string): IScopeVariable[];
  listReadPositions(filename: string): Identifier[];
  listWritePositions(filename: string): Identifier[];
  lookupPosition(p: Position, filename: string): ISpaghettiScopeNode | undefined;
  getTop(): ISpaghettiScopeNode;
}

export interface ISyntaxResult {
  readonly issues: Issue[];
  readonly spaghetti: ISpaghettiScope;
}