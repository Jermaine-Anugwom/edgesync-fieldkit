import pytest

from edgesync.core import Event, event_id, sync


def ev(seq=1, device="A", record="R", payload=None):
    payload = payload or {"status": "ok"}
    return Event(event_id(record, device, seq, payload), record, device, seq, payload)


@pytest.mark.parametrize("n", range(1, 11))
def test_applies_sequences(n):
    assert len(sync([ev(i) for i in range(1, n + 1)]).applied) == n


@pytest.mark.parametrize("n", range(1, 6))
def test_offline_queues(n):
    assert len(sync([ev(i) for i in range(1, n + 1)], online=False).pending) == n


def test_duplicate():
    e = ev()
    assert sync([e], {e.event_id}).duplicates == (e.event_id,)


def test_conflict():
    assert sync([ev(device="A"), ev(device="B")]).conflicts == ("R",)


def test_conflict_pending():
    assert sync([ev(device="A"), ev(device="B")]).pending[0].status == "conflict"


def test_same_device_same_sequence_different_payload_conflicts():
    result = sync([ev(device="A", payload={"value": 1}), ev(device="A", payload={"value": 2})])
    assert result.conflicts == ("R",)
    assert len(result.applied) == 1 and result.pending[0].status == "conflict"


def test_id_stable():
    assert ev().event_id == ev().event_id


def test_id_payload_changes():
    assert ev(payload={"x": 1}).event_id != ev(payload={"x": 2}).event_id


def test_id_device_changes():
    assert ev(device="A").event_id != ev(device="B").event_id


def test_applied_status():
    assert sync([ev()]).applied[0].status == "applied"


def test_empty():
    assert sync([]).applied == ()


def test_sorting():
    assert [e.sequence for e in sync([ev(3), ev(1), ev(2)]).applied] == [1, 2, 3]
