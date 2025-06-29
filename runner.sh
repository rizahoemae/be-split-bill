#!/bin/sh
set -e
/app/node_modules/.bin/wait-on -t 60000 tcp:db:3306
echo "Entrypoint: Database is up! Starting application..."
exec "$@"