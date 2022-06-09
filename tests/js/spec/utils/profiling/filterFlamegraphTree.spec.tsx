import {filterFlamegraphTree} from 'sentry/utils/profiling/filterFlamegraphTree';
import {FlamegraphFrame} from 'sentry/utils/profiling/flamegraphFrame';

const f = (partial: Partial<FlamegraphFrame>) => {
  return {
    children: [],
    depth: 0,
    end: 0,
    frame: {},
    key: 0,
    node: {},
    parent: null,
    start: 0,
    ...partial,
  } as FlamegraphFrame;
};

const fr = (partial: Partial<FlamegraphFrame['frame']>) => {
  return {is_application: false, ...partial} as FlamegraphFrame['frame'];
};

describe('filterFlamegraphTree', () => {
  it('pushes root if it matches', () => {
    const skipFn = (frame: FlamegraphFrame): boolean => {
      return !frame.frame.is_application;
    };

    const root: FlamegraphFrame = f({
      parent: null,
      frame: fr({is_application: true, key: 0}),
    });

    expect(filterFlamegraphTree([root], skipFn)).toEqual([root]);
  });

  it('pushes child if it has no root', () => {
    const skipFn = (frame: FlamegraphFrame): boolean => {
      return !frame.frame.is_application;
    };

    const root: FlamegraphFrame = f({
      frame: fr({is_application: false, key: 0}),
    });
    const child1 = f({
      frame: fr({key: 1, is_application: true}),
    });

    child1.parent = root;
    root.children = [child1];

    expect(filterFlamegraphTree([root], skipFn)).toEqual([{...child1, parent: null}]);
  });

  it('persists multiple children', () => {
    const skipFn = (frame: FlamegraphFrame): boolean => {
      return !frame.frame.is_application;
    };

    const root: FlamegraphFrame = f({
      frame: fr({key: 'root', is_application: true}),
    });
    const child1 = f({
      parent: root,
      frame: fr({key: 'child1', is_application: true}),
    });
    const child2 = f({
      parent: root,
      frame: fr({key: 'child2', is_application: true}),
    });

    child1.parent = root;
    child2.parent = root;
    root.children = [child1, child2];

    const result = filterFlamegraphTree([root], skipFn);
    expect(result[0].children).toEqual([child1, child2]);
  });

  it('skips a level', () => {
    const skipFn = (frame: FlamegraphFrame): boolean => {
      return !frame.frame.is_application;
    };

    const root = f({
      frame: fr({key: 0, is_application: true}),
    });

    const child1 = f({
      frame: fr({key: 1, is_application: false}),
    });

    const child2 = f({
      frame: fr({key: 2, is_application: true}),
    });

    root.children = [child1];
    child1.children = [child2];

    child1.parent = root;
    child2.parent = root;

    const result = filterFlamegraphTree([root], skipFn);
    expect(result[0].frame.key).toBe(0);
    expect(result[0].children[0].frame.key).toBe(2);
  });

  it('persists hierarchy level', () => {
    const skipFn = (frame: FlamegraphFrame): boolean => {
      return !frame.frame.is_application;
    };

    const root = f({
      frame: fr({key: 0, is_application: true}),
    });

    const child1 = f({
      frame: fr({key: 1, is_application: true}),
    });

    const child2 = f({
      frame: fr({key: 2, is_application: true}),
    });

    root.children = [child1];
    child1.children = [child2];

    child1.parent = root;
    child2.parent = child1;

    const result = filterFlamegraphTree([root], skipFn);
    expect(result[0].frame.key).toBe(0);
    expect(result[0].children[0].frame.key).toBe(1);
    expect(result[0].children[0].children[0].frame.key).toBe(2);
  });

  it('preserves child order', () => {
    const skipFn = (frame: FlamegraphFrame): boolean => {
      return !frame.frame.is_application;
    };

    const root = f({
      frame: fr({key: 0, is_application: true}),
    });

    const child1 = f({
      frame: fr({key: 1, is_application: true}),
    });

    const child2 = f({
      frame: fr({key: 3, is_application: true}),
    });
    const child3 = f({
      frame: fr({key: 2, is_application: true}),
    });

    root.children = [child1];
    child1.children = [child2, child3];

    child1.parent = root;
    child2.parent = child1;
    child3.parent = child1;

    const result = filterFlamegraphTree([root], skipFn);
    expect(result[0].frame.key).toBe(0);
    expect(result[0].children[0].frame.key).toBe(1);
    expect(result[0].children[0].children[0].frame.key).toBe(3);
    expect(result[0].children[0].children[1].frame.key).toBe(2);
  });
});
