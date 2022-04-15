import {Fragment, useMemo} from 'react';

import {BoundTooltip, BoundTooltipProps} from 'sentry/components/profiling/boundTooltip';
import {t} from 'sentry/locale';
import {Flamegraph} from 'sentry/utils/profiling/flamegraph';
import {FlamegraphFrame} from 'sentry/utils/profiling/flamegraphFrame';
import {TypeScriptProfile} from 'sentry/utils/profiling/profile/formats/chromeTraceProfile';

interface TypeScriptTooltipProps {
  frame: FlamegraphFrame;
  tree: TypeScript.TypeTree;
  flamegraph?: Flamegraph;
}

function getFramePath(frame: FlamegraphFrame): string | undefined {
  let start: FlamegraphFrame | null = frame;

  while (start) {
    if (start.frame?.meta?.path) {
      return `Source: ${start.frame.meta.path}`;
    }
    if (start.frame?.meta?.fileName) {
      if (start.frame.meta.fileIncludeKind) {
        return `${start.frame.meta.fileIncludeKind}: ${start.frame.meta.fileName}`;
      }
      return `Source: ${start.frame.meta.fileName}`;
    }
    start = start.parent;
  }

  return undefined;
}

function TypeScriptTooltip(props: TypeScriptTooltipProps) {
  const typeName =
    typeof props?.frame?.frame?.meta?.sourceId === 'number'
      ? props.tree.resolveTypeName(props?.frame?.frame?.meta?.sourceId) ??
        t('Unknown type')
      : t('Unknown type');

  return (
    <Fragment>
      <p>
        {props.flamegraph
          ? props.flamegraph.formatter(props.frame.node.totalWeight)
          : null}{' '}
        {typeName}
      </p>
      <p>{getFramePath(props.frame)}</p>
    </Fragment>
  );
}

interface FlamegraphTooltipProps {
  bounds: BoundTooltipProps['bounds'];
  configSpaceCursor: BoundTooltipProps['cursor'];
  configToPhysicalSpace: BoundTooltipProps['configToPhysicalSpace'];
  hoveredNode: FlamegraphFrame | null;
  flamegraph?: Flamegraph;
}

function isTypeScriptProfile(
  profile: Flamegraph['profile']
): profile is TypeScriptProfile {
  return profile instanceof TypeScriptProfile;
}

export function FlamegraphTooltip(props: FlamegraphTooltipProps) {
  const profileType = useMemo(() => {
    if (props.flamegraph) {
      if (isTypeScriptProfile(props.flamegraph?.profile)) {
        return 'typescript';
      }
    }

    return null;
  }, [props.flamegraph?.profile]);

  return props.hoveredNode ? (
    <BoundTooltip
      bounds={props.bounds}
      cursor={props.configSpaceCursor}
      configToPhysicalSpace={props.configToPhysicalSpace}
    >
      {profileType === 'typescript' ? (
        <TypeScriptTooltip
          frame={props.hoveredNode}
          flamegraph={props.flamegraph}
          tree={(props.flamegraph?.profile as TypeScriptProfile).typeScriptTypeTree}
        />
      ) : (
        `${props.flamegraph?.formatter(props.hoveredNode.node.totalWeight)} ${
          props.hoveredNode.frame.name
        }`
      )}
    </BoundTooltip>
  ) : null;
}