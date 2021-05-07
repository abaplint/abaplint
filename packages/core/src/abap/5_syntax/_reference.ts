import {Identifier} from "../4_file_information/_identifier";

export enum ReferenceType {
  /** for classes and interface references */
  ObjectOrientedReference = "ObjectOrientedReference",
  ObjectOrientedVoidReference = "ObjectOrientedVoidReference",

  TableReference = "TableReference",
  TableVoidReference = "TableVoidReference",

  MethodReference = "MethodReference",
  BuiltinMethodReference = "BuiltinMethodReference",
  MethodImplementationReference = "MethodImplementationReference",

  TypeReference = "TypeReference",
  BuiltinTypeReference = "BuiltinTypeReference",
  VoidType = "VoidType",
  InferredType = "InferredType",

  FormReference = "FormReference",
//  FormVoidReference = "FormReference",

  DataReadReference = "DataReadReference",
  DataWriteReference = "DataWriteReference",
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