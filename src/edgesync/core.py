from __future__ import annotations

import json
from dataclasses import dataclass, replace
from hashlib import sha256
from typing import Any


@dataclass(frozen=True)
class Event:
    event_id: str
    record_id: str
    device_id: str
    sequence: int
    payload: dict[str, Any]
    status: str = "queued"


@dataclass(frozen=True)
class SyncResult:
    applied: tuple[Event, ...]
    duplicates: tuple[str, ...]
    conflicts: tuple[str, ...]
    pending: tuple[Event, ...]


def event_id(record_id: str, device_id: str, sequence: int, payload: dict[str, Any]) -> str:
    return sha256(
        json.dumps([record_id, device_id, sequence, payload], sort_keys=True).encode()
    ).hexdigest()[:16]


def sync(events: list[Event], seen: set[str] | None = None, online: bool = True) -> SyncResult:
    seen = set(seen or ())
    applied = []
    duplicates = []
    conflicts = []
    pending = []
    latest = {}
    for event in sorted(events, key=lambda e: (e.sequence, e.device_id, e.event_id)):
        if event.event_id in seen:
            duplicates.append(event.event_id)
            continue
        if not online:
            pending.append(event)
            continue
        prior = latest.get(event.record_id)
        if (
            prior
            and prior.sequence == event.sequence
            and (prior.device_id != event.device_id or prior.payload != event.payload)
        ):
            conflicts.append(event.record_id)
            pending.append(replace(event, status="conflict"))
            continue
        applied.append(replace(event, status="applied"))
        seen.add(event.event_id)
        latest[event.record_id] = event
    return SyncResult(tuple(applied), tuple(duplicates), tuple(conflicts), tuple(pending))
