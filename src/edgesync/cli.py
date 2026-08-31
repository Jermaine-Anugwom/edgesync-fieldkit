import json
from dataclasses import asdict

from .core import *


def main():
    print(
        json.dumps(
            asdict(
                sync(
                    [
                        Event(
                            event_id("R-1", "D-2", 1, {"status": "inspected"}),
                            "R-1",
                            "D-2",
                            1,
                            {"status": "inspected"},
                        )
                    ]
                )
            ),
            indent=2,
            default=str,
        )
    )
