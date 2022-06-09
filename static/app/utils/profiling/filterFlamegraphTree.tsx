import {FlamegraphFrame} from 'sentry/utils/profiling/flamegraphFrame';

export function filterFlamegraphTree(
  roots: FlamegraphFrame[],
  skipFn: (frame: FlamegraphFrame) => boolean
): FlamegraphFrame[] {
  const stack: FlamegraphFrame[] = [];
  const nodesToKeep = new Set<FlamegraphFrame>();

  // Dfs to find nodes we want to keep
  for (const root of roots) {
    stack.push(root);

    while (stack.length > 0) {
      const node = stack.pop();

      if (!node) {
        continue;
      }

      if (!skipFn(node)) {
        nodesToKeep.add(node);
      }

      for (let i = 0; i < node.children.length; i++) {
        stack.push(node.children[node.children.length - i - 1]);
      }
    }
  }

  const allNodes: FlamegraphFrame[] = [];
  const visitedParents = new Set<FlamegraphFrame>();

  for (const node of nodesToKeep.values()) {
    // Find the first parent that we are not supposed to skip
    node.children = [];
    let parent = node.parent;

    while (parent) {
      if (nodesToKeep.has(parent)) {
        break;
      }
      parent = parent.parent;
    }

    node.parent = parent;

    if (parent) {
      if (parent && !visitedParents.has(parent)) {
        parent.children = [];
        visitedParents.add(parent);
      }
      parent.children.push(node);
    } else {
      allNodes.push(node);
    }
  }

  return allNodes;
}
