from django.db import migrations

TRIGGER_SQL = """
CREATE OR REPLACE FUNCTION sync_chat_membership_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_group_id UUID;
  v_trip_title TEXT;
  v_trip_destination TEXT;
  v_agency_user_id UUID;
BEGIN
  IF NEW.status = 'confirmed' THEN
    SELECT t.title, t.destination, a.user_id
    INTO v_trip_title, v_trip_destination, v_agency_user_id
    FROM trips t
    JOIN agencies a ON a.id = t.agency_id
    WHERE t.id = NEW.trip_id;

    INSERT INTO chat_groups (id, trip_id, title, subtitle, policy_text, created_at, updated_at)
    VALUES (gen_random_uuid(), NEW.trip_id, COALESCE(v_trip_title, 'Trip Chat'), COALESCE(v_trip_destination, ''), '', NOW(), NOW())
    ON CONFLICT (trip_id) DO NOTHING;

    SELECT id INTO v_group_id FROM chat_groups WHERE trip_id = NEW.trip_id;

    IF v_group_id IS NOT NULL THEN
      INSERT INTO chat_group_members (id, group_id, user_id, role, joined_at)
      VALUES (gen_random_uuid(), v_group_id, NEW.traveler_id, 'member', NOW())
      ON CONFLICT ON CONSTRAINT uniq_chat_group_member DO NOTHING;

      IF v_agency_user_id IS NOT NULL THEN
        INSERT INTO chat_group_members (id, group_id, user_id, role, joined_at)
        VALUES (gen_random_uuid(), v_group_id, v_agency_user_id, 'admin', NOW())
        ON CONFLICT ON CONSTRAINT uniq_chat_group_member DO NOTHING;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'pending') THEN
    SELECT id INTO v_group_id FROM chat_groups WHERE trip_id = NEW.trip_id;
    IF v_group_id IS NOT NULL THEN
      DELETE FROM chat_group_members
      WHERE group_id = v_group_id AND user_id = NEW.traveler_id AND role = 'member';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_chat_membership_on_booking ON bookings;
CREATE TRIGGER trg_sync_chat_membership_on_booking
AFTER INSERT OR UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION sync_chat_membership_on_booking();
"""

REVERSE_SQL = """
DROP TRIGGER IF EXISTS trg_sync_chat_membership_on_booking ON bookings;
DROP FUNCTION IF EXISTS sync_chat_membership_on_booking();
"""


def apply_trigger(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute(TRIGGER_SQL)


def reverse_trigger(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    schema_editor.execute(REVERSE_SQL)


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(apply_trigger, reverse_trigger),
    ]
