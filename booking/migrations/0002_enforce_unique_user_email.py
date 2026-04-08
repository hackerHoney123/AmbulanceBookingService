from django.db import migrations


DUPLICATE_EMAIL_INDEX = "auth_user_email_unique_non_empty"


def deduplicate_user_emails(apps, schema_editor):
    User = apps.get_model('auth', 'User')

    users = User.objects.exclude(email='').order_by('-id')
    seen_emails = set()

    for user in users:
        normalized_email = (user.email or '').strip().lower()
        if not normalized_email:
            continue

        if normalized_email in seen_emails:
            user.email = f'dup_{user.id}@local.invalid'
            user.save(update_fields=['email'])
            continue

        if user.email != normalized_email:
            user.email = normalized_email
            user.save(update_fields=['email'])

        seen_emails.add(normalized_email)


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('booking', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(deduplicate_user_emails, migrations.RunPython.noop),
        migrations.RunSQL(
            sql=(
                f'CREATE UNIQUE INDEX IF NOT EXISTS {DUPLICATE_EMAIL_INDEX} '
                "ON auth_user (LOWER(email)) WHERE email <> ''"
            ),
            reverse_sql=f'DROP INDEX IF EXISTS {DUPLICATE_EMAIL_INDEX}',
        ),
    ]
