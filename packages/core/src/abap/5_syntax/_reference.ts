import {Identifier} from "../4_file_information/_identifier";

export enum ReferenceType {
  /** for classes and interface references */
  ObjectOrientedReference = "ObjectOrientedReference",

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
  className?: string,
}

export interface IReference {
  position: Identifier,
  resolved: Identifier,
  referenceType: ReferenceType,
  extra?: IReferenceExtras,
}