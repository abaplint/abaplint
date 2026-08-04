export function buildGitCloneArguments(url: string, branch?: string): string[] {
  const args = ["clone", "--quiet", "--depth", "1"];

  if (branch) {
    args.push("-b", branch);
  }

  args.push("--", url, ".");
  return args;
}
