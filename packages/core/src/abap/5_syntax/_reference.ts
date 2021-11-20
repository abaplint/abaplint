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
  ooName?: string,
  ooType?: "CLAS" | "INTF" | "Void",
}

export interface IReference {
  position: Identifier,
  resolved: Identifier | undefined,
  referenceType: ReferenceType,
  extra?: IReferenceExtras,
}