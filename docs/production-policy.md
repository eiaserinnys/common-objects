# Interior collection production policy

Common Objects covers the props, furniture, equipment, fixtures and machines that furnish everyday **homes, offices and shops/commercial interiors**. Household hand tools are one part of this scope. Build a useful, varied cumulative collection and convincing furnished scenes.

## Select work from the whole collection

Before each production cycle:

1. Refresh the remote state and inspect the working tree, existing plans, `AGENTS.md`, this policy and [asset specification](asset-spec.md). Read any applicable repository/workspace `.agents/skills` instructions. Preserve concurrent work; check for overlapping assets and plans before editing.
2. Read every current catalog entry's identity, source, dimensions, role and available states; consult the latest [catalog balance review](catalog-balance.md), inventory and recent batch records. Recompute cumulative and recent-cycle distributions by space, physical size and function. Do not rely on batch titles or thumbnail sizes. Record the inspected revision and the window of recent cycles used.
3. Separate independently authored objects, imported room groups and complete assemblies. Do not count a room plus its groups as extra furniture, or a desktop and its underframe as two desks. Keep compound groups and multi-purpose objects explicit; use multiple context/function tags where appropriate.
4. Review existing whole-set previews/contact sheets alongside the original room. Check which useful scenes can actually be assembled: floor footprint, working heights, circulation, seating and storage, and how existing small objects sit on furniture. A grid of isolated tools is useful for inspection but does not establish interior coverage.
5. Select the next theme to address the largest current gaps in space, size and function. Search existing names, IDs, geometry, assemblies and prior plans for semantic duplicates. State why each proposed object contributes a missing role and which existing objects will be reused. Prefer a coherent combination of medium/large furniture, fixtures or machines with appropriate small props. Reused props do not count as new assets.

These are adaptive priorities, not permanent numerical quotas or an instruction to alternate spaces mechanically. A run may focus on repairs, a complex anchor object or a smaller finished scene when that offers more value. Do not fill a target of ten with easy small objects, recolors, removable parts or near-duplicates. Complexity and verification determine the honest completed quantity; record partial work and remaining gaps separately.

## Plan an actual interior scene

Write a brief before modeling: intended space and activity, candidate anchors, reuse/duplicate findings, estimated dimensions with reference, support heights, movement/clearance envelopes and meaningful interactions. Show how the planned furniture/equipment and existing props will share one metre-based scene at scale `[1,1,1]`. Prioritize reusable assets; a scene assembly references them rather than cloning them into new catalog counts.

For machines and equipment, define an observable operation appropriate to the object (for example a drawer sliding, chair adjustment, printer paper path or appliance door/control state). Removing a crank, cover, handle, cushion or motor is a maintenance/disassembly state, **not proof of the machine's ordinary operation**. State keys with names like `cranked` do not establish motion. Static depictions are allowed when honestly labeled; do not claim an interaction the renderer cannot implement. Discrete state representations can be useful, but explain their semantics and limitations. Extend supported state/rendering behavior deliberately and validate it before claiming new capabilities; fixed-joint metadata alone does not implement articulation or physics.

## Preserve the technical and review contracts

The [asset specification](asset-spec.md) remains authoritative: metre units, scale `[1,1,1]`, Y-up/XZ ground, contact-center origins, honest dimension estimates/calibration, bounds/clearance, support surfaces, part hierarchy/pivots/axes/state, immutable versions and provenance all remain required. Never resize objects independently to fit the camera. Keep source assets separate from renderer and preview UI.

Keep thumbnails, inspect each new asset from multiple sides and inspect mixed-size scenes for contact, supported placement, occlusion and clearance. Verify independent duplicate operation and save/restore of arrangement and state. Exercise applicable desktop/mobile switching, rotation and zoom. Retain explicit limits of SVG sorting, state representation and absent simulation; quality cannot be inferred from a green schema check alone.

Run `npm run validate`, `npm test` and `npm run build` before committing, plus targeted interaction/visual checks for changed behavior. Update the inventory/balance review and production record with actual completed counts, new versus reused assets, evidence and unresolved issues. Keep private conversations, credentials, generated build output and dependencies out of the repository. Existing commit/push and deployment rules in `AGENTS.md` remain in force.
