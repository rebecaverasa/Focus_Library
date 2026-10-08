import uuid

import pytest
from pydantic import ValidationError
from sqlalchemy import CheckConstraint, ForeignKeyConstraint, Integer, String

from app.models import Preset
from app.models.preset import SOUND_IDS
from app.schemas.preset import PresetCreate, PresetRead

table = Preset.__table__
LEVELS = dict.fromkeys(SOUND_IDS, 50)


def test_table_name_and_columns():
    assert table.name == "presets"
    assert set(table.c.keys()) == {
        "id",
        "created_at",
        "updated_at",
        "client_id",
        "name",
        *SOUND_IDS,
    }


def test_sound_ids_match_frontend():
    assert SOUND_IDS == ("pages", "rain", "clock", "whispers", "fire", "keys")


def test_column_types_and_nullability():
    assert isinstance(table.c.name.type, String) and table.c.name.type.length == 60
    assert all(isinstance(table.c[s].type, Integer) for s in SOUND_IDS)
    assert all(not table.c[n].nullable for n in ("client_id", "name", *SOUND_IDS))


def test_client_fk_cascades():
    fk = next(c for c in table.constraints if isinstance(c, ForeignKeyConstraint))

    assert [e.target_fullname for e in fk.elements] == ["clients.id"]
    assert fk.ondelete == "CASCADE"
    assert fk.name == "fk_presets_client_id_clients"


def test_index_by_client():
    index = next(i for i in table.indexes if i.name == "ix_presets_client_id")

    assert [c.name for c in index.columns] == ["client_id"]


def test_level_range_checks():
    checks = {c.name: str(c.sqltext) for c in table.constraints if isinstance(c, CheckConstraint)}

    assert checks == {f"ck_presets_{s}_range": f"{s} >= 0 AND {s} <= 100" for s in SOUND_IDS}


def test_create_trims_name_and_accepts_bounds():
    preset = PresetCreate(name="  Rainy  ", **{**LEVELS, "pages": 0, "rain": 100})

    assert preset.name == "Rainy" and preset.pages == 0 and preset.rain == 100


@pytest.mark.parametrize("bad", [{"name": "   "}, {"name": "x" * 61}, {"rain": 101}, {"fire": -1}])
def test_create_rejects_invalid(bad):
    with pytest.raises(ValidationError):
        PresetCreate(**{"name": "ok", **LEVELS, **bad})


def test_create_requires_all_levels_and_forbids_extras():
    with pytest.raises(ValidationError):
        PresetCreate(name="ok", pages=1)
    with pytest.raises(ValidationError):
        PresetCreate(name="ok", **LEVELS, client_id=str(uuid.uuid4()))


def test_read_serializes_from_attributes_without_client_id():
    preset = Preset(id=uuid.uuid4(), name="Focus", **LEVELS)

    data = PresetRead.model_validate(preset).model_dump()

    assert data["name"] == "Focus" and data["keys"] == 50
    assert "client_id" not in data
