/**
 * COVERAGE MAP — server entry for the "Find Your Nearest Branch" section.
 *
 * Resolves the branch list and each branch's services (branchLocatorData.ts) on
 * the server, then hands them to the interactive client component. The map
 * itself is MapLibre, lazy-loaded inside BranchLocator.
 *
 * Import sites are unchanged: still `@/components/site/CoverageMap`, still
 * rendering `id="coverage"`, so /coverage, the homepage and every #coverage
 * deep link keep working.
 */

import BranchLocator from "./BranchLocator";
import { buildBranchLocator } from "./branchLocatorData";

export default function CoverageMap() {
  return <BranchLocator {...buildBranchLocator()} />;
}
