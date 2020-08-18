import {Identifier} from "../4_file_information/_identifier";

export enum ReferenceType {
  /** for classes and interface references */
  ObjectOrientedReference = "ObjectOrientedReference",
  MethodReference = "MethodReference",
  BuiltinMethodReference = "BuiltinMethodReference",
  FormReference = "FormReference",
  TypeReference = "TypeReference",
  DataReadReference = "DataReadReference",
  DataWriteReference = "DataWriteReference",
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