# Short-circuit old build command for production for now, since trigger is not set up in `main`
# Remove this code once `tdb1` branch is promoted to production
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
  echo "Running old build script"
  next build && npx prisma migrate deploy && yarn db:grant-supabase-privileges
  exit 0
fi

echo "👷 Running build script for environment (4 jobs in parallel): $VERCEL_ENV"
# Real script starts here:

# Build and deploy latest trigger jobs to trigger cloud
# NOTE: In the future we can use Vercel integration for trigger.dev cloud, but this is currently in planning stage only
# https://feedback.trigger.dev/p/vercel-integration-3

(
  echo "💼 [1/4] Build and deploy latest trigger jobs"

  if [ "$VERCEL_ENV" = "production" ]; then
    echo "🚀 Deploying trigger jobs for production environment..."
    npx trigger.dev@latest deploy
  elif [ "$VERCEL_ENV" = "preview" ]; then
    echo "🚀 Deploying trigger jobs for staging environment..."
    npx trigger.dev@latest deploy -e staging
  else
    echo "🔒 Skip deploying trigger jobs for dev environment"
  fi
) &

(
  echo "🔧 [2/4] Applying latest prisma migrations"
  yarn prisma migrate deploy
) &

(
  echo "🛠️ [3/4] Building Next app"
  yarn next build
) &

(
  # Grant anon privileges so realtime channel can work using only Copilot token
  echo "🏃 [4/4] Running grant-supabase-privileges"
  yarn db:grant-supabase-privileges
)

wait

echo "🥳 Deployment completed! 🎉🎉🎉"
