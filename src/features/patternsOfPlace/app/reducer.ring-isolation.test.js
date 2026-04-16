import test from "node:test";
import assert from "node:assert/strict";
import { reducer, initialState } from "./reducer.js";
import {
  SELECT_TEMPLATE,
  UPDATE_RING,
  SET_ACTIVE_RING,
  SET_ACTIVE_CLUSTER,
  ADD_RING,
} from "./actions.js";
import { MOTIF_META } from "../data/motifs/motifMeta.js";

function buildStudioState() {
  return reducer(initialState, {
    type: SELECT_TEMPLATE,
    template: {
      id: "test-template",
      name: "Test Template",
      clusters: [
        { x: 0.2, y: 0.3, scale: 0.7 },
        { x: 0.8, y: 0.7, scale: 0.7 },
      ],
    },
  });
}

function getFirstRing(state, clusterIndex) {
  return state.editor.clusters[clusterIndex].rings[0];
}

test("updates colors only on targeted cluster ring", () => {
  let state = buildStudioState();

  const clusterOne = state.editor.clusters[0];
  const clusterTwo = state.editor.clusters[1];
  const clusterOneRing = clusterOne.rings[0];
  const clusterTwoRing = clusterTwo.rings[0];
  const baselineClusterOneColors = [...clusterOneRing.colors];

  const targetColors = ["#111111", "#222222", "#333333", "#444444", "#555555"];

  state = reducer(state, {
    type: UPDATE_RING,
    clusterId: clusterTwo.id,
    id: clusterTwoRing.id,
    key: "colors",
    value: targetColors,
  });

  assert.deepEqual(getFirstRing(state, 0).colors, baselineClusterOneColors);
  assert.deepEqual(getFirstRing(state, 1).colors, targetColors);
});

test("template selection keeps deterministic default motif and colors for all clusters", () => {
  let state = buildStudioState();

  const defaultMotifId = MOTIF_META[0].id;
  const defaultColors = MOTIF_META[0].previewColors;

  for (const cluster of state.editor.clusters) {
    const ring = cluster.rings[0];
    assert.equal(ring.motifId, defaultMotifId);
    assert.deepEqual(ring.colors, defaultColors);
  }
});

test("SET_ACTIVE_RING with clusterId syncs both active ids", () => {
  let state = buildStudioState();

  const clusterOne = state.editor.clusters[0];
  const clusterTwo = state.editor.clusters[1];
  const clusterTwoRing = clusterTwo.rings[0];

  state = reducer(state, {
    type: SET_ACTIVE_RING,
    clusterId: clusterTwo.id,
    id: clusterTwoRing.id,
  });

  assert.equal(state.ui.activeClusterId, clusterTwo.id);
  assert.equal(state.ui.activeRingId, clusterTwoRing.id);

  const targetColors = ["#1a1a1a", "#2b2b2b", "#3c3c3c", "#4d4d4d", "#5e5e5e"];
  state = reducer(state, {
    type: UPDATE_RING,
    clusterId: state.ui.activeClusterId,
    id: state.ui.activeRingId,
    key: "colors",
    value: targetColors,
  });

  assert.deepEqual(getFirstRing(state, 1).colors, targetColors);
  assert.notDeepEqual(getFirstRing(state, 0).colors, targetColors);
  assert.deepEqual(getFirstRing(state, 0).id, clusterOne.rings[0].id);
});

test("changing cluster 2 ring 1 and then cluster 1 ring 2 stays isolated", () => {
  let state = buildStudioState();

  const cluster1 = state.editor.clusters[0];
  const cluster2 = state.editor.clusters[1];
  const cluster1Ring1 = cluster1.rings[0];
  const cluster2Ring1 = cluster2.rings[0];

  const cluster2Ring1Colors = [
    "#910000",
    "#920000",
    "#930000",
    "#940000",
    "#950000",
  ];

  state = reducer(state, {
    type: UPDATE_RING,
    clusterId: cluster2.id,
    id: cluster2Ring1.id,
    key: "colors",
    value: cluster2Ring1Colors,
  });

  assert.deepEqual(
    state.editor.clusters[1].rings[0].colors,
    cluster2Ring1Colors,
  );
  assert.deepEqual(
    state.editor.clusters[0].rings[0].colors,
    cluster1Ring1.colors,
  );

  state = reducer(state, { type: SET_ACTIVE_CLUSTER, id: cluster1.id });
  state = reducer(state, { type: ADD_RING });

  const updatedCluster1 = state.editor.clusters[0];
  const cluster1Ring2 = updatedCluster1.rings[1];
  const cluster1Ring2Colors = [
    "#001199",
    "#0022aa",
    "#0033bb",
    "#0044cc",
    "#0055dd",
  ];

  state = reducer(state, {
    type: UPDATE_RING,
    clusterId: cluster1.id,
    id: cluster1Ring2.id,
    key: "colors",
    value: cluster1Ring2Colors,
  });

  assert.deepEqual(
    state.editor.clusters[0].rings[1].colors,
    cluster1Ring2Colors,
  );
  assert.deepEqual(
    state.editor.clusters[0].rings[0].colors,
    cluster1Ring1.colors,
  );
  assert.deepEqual(
    state.editor.clusters[1].rings[0].colors,
    cluster2Ring1Colors,
  );
});
