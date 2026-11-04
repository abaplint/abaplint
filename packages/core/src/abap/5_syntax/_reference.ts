import {Identifier} from "../4_file_information/_identifier";

export enum ReferenceType {
  /** for classes and interface references */
  ObjectOrientedReference = "Object",
  ObjectOrientedVoidReference = "Object (Void)",
  ObjectOrientedUnknownReference = "Object (Unknown)",

  TableReference = "Table",
  TableVoidReference = "Table (Void)",

  MethodReference = "Method",
  BuiltinMethodReference = "Builtin Method",
  ConstructorReference = "Constructor Reference",
  MethodImplementationReference = "Method Implementation",

  TypeReference = "Type",
  BuiltinTypeReference = "Builtin Type",
  VoidType = "Type (Void)",
  InferredType = "Inferred Type",

  FormReference = "Form",
//  FormVoidReference = "Form (void)",

  DataReadReference = "Read From",
  DataWriteReference = "Write To",
}


export interface IReferenceExtras {
  /** This attribute access cannot acquire write permission in its enclosing context. */
  readOnly?: boolean,
  /** The enclosing operand writes storage, even when this token only names its class. */
  writeOperand?: boolean,
  ooName?: string,
  ooType?: "CLAS" | "INTF" | "Void",
  foundQualified?: boolean,
}

export interface IReference {
  position: Identifier,
  resolved: Identifier | undefined,
  referenceType: ReferenceType,
  extra?: IReferenceExtras,
}
