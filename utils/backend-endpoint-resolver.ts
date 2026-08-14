import {
  backendApiContracts,
  type BackendApiContract,
  type BackendHttpMethod,
} from "./backend-api-contracts";

interface CompiledContract {
  contract: BackendApiContract;
  pattern: RegExp;
}

export interface ResolvedBackendEndpoint {
  backendPath: string;
  contract: BackendApiContract;
  id: string;
}

const parameterPattern = /\{([A-Za-z][A-Za-z0-9]*)\}/g;
const numericParameterPattern = /Id$/;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compileContract(contract: BackendApiContract): CompiledContract {
  let cursor = 0;
  let pattern = "^";

  for (const match of contract.frontendPath.matchAll(parameterPattern)) {
    const parameterName = match[1];
    const index = match.index ?? 0;
    pattern += escapeRegex(contract.frontendPath.slice(cursor, index));
    pattern += numericParameterPattern.test(parameterName) ? "([1-9]\\d*)" : "([^/]+)";
    cursor = index + match[0].length;
  }

  pattern += `${escapeRegex(contract.frontendPath.slice(cursor))}$`;
  return { contract, pattern: new RegExp(pattern) };
}

const compiledPassthroughContracts = backendApiContracts
  .filter((contract) => contract.transport === "passthrough")
  .map(compileContract);

function decodePathname(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}

function buildBackendPath(backendTemplate: string, values: string[]) {
  let valueIndex = 0;

  return backendTemplate.replace(parameterPattern, (placeholder) => {
    const value = values[valueIndex++];
    if (!value || value === "." || value === "..") return placeholder;
    return encodeURIComponent(value);
  });
}

export function resolvePassthroughBackendEndpoint(
  method: string,
  pathname: string,
): ResolvedBackendEndpoint | null {
  const decodedPathname = decodePathname(pathname);
  if (!decodedPathname) return null;

  const compiled = compiledPassthroughContracts.find(
    ({ contract, pattern }) => contract.method === method && pattern.test(decodedPathname),
  );
  if (!compiled) return null;

  const match = compiled.pattern.exec(decodedPathname);
  if (!match) return null;
  const values = match.slice(1);
  const backendPath = buildBackendPath(compiled.contract.backendPath, values);
  if (backendPath.includes("{")) return null;

  return { backendPath, contract: compiled.contract, id: compiled.contract.id };
}

export function isBackendHttpMethod(method: string): method is BackendHttpMethod {
  return ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method);
}
