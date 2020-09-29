import {Visibility} from "../4_file_information/visibility";
import {IdentifierMeta, TypedIdentifier} from "./_typed_identifier";

export class ClassAttribute extends TypedIdentifier {
  private readonly visibility: Visibility;

  public constructor(id: TypedIdentifier, visibility: Visibility, meta: readonly IdentifierMeta[]) {
    super(id.getToken(), id.getFilename(), id.getType(), meta);
    this.visibility = visibility;
  }

  public getVisibility() {
    return this.visibility;
  }
}