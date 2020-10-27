import {Identifier} from "../4_file_information/_identifier";

export enum ReferenceType {
  /** for classes and interface references */
  ObjectOrientedReference = "ObjectOrientedReference",
  ObjectOrientedVoidReference = "ObjectOrientedVoidReference",

  MethodReference = "MethodReference",
  BuiltinMethodReference = "BuiltinMethodReference",

  TypeReference = "TypeReference",
  BuiltinTypeReference = "BuiltinTypeReference",

  FormReference = "FormReference",

  DataReadReference = "DataReadReference",
  DataWriteReference = "DataWriteReference",

  InferredType = "InferredType",
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