"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# --- DB CONNECTION HEALTH CHECK ---
try:
    from django.db import connection
    print("Checking DB connection...")
    connection.ensure_connection()
    print("✅ DATABASE CONNECTION: SUCCESS")
except Exception as e:
    print(f"❌ DATABASE CONNECTION: FAILED! Error: {e}")
# ----------------------------------

application = get_wsgi_application()
