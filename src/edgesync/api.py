from dataclasses import asdict
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .core import Event, event_id, sync

app = FastAPI(title="EdgeSync FieldKit", version="0.1.0")


class EventInput(BaseModel):
    record_id: str = Field(min_length=1, max_length=64)
    device_id: str = Field(min_length=1, max_length=64)
    sequence: int = Field(ge=0)
    payload: dict[str, Any]


class SyncInput(BaseModel):
    events: list[EventInput]
    seen: set[str] = set()
    online: bool = True


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ready", "mode": "deterministic", "data": "synthetic"}


@app.post("/sync")
def sync_events(payload: SyncInput) -> dict[str, object]:
    events = [
        Event(
            event_id(item.record_id, item.device_id, item.sequence, item.payload),
            **item.model_dump(),
        )
        for item in payload.events
    ]
    return asdict(sync(events, payload.seen, payload.online))
