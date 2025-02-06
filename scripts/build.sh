# Script to build Tasks App on Vercel

echo "👷 Running build script for environment: $VERCEL_ENV"
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
    # Check if the branch name contains 'feature' OR 'tdb'
    # VERCEL_GIT_COMMIT_REF is the branch name in Vercel, e.g. "feature/some-branch"
    if [[ "$VERCEL_GIT_COMMIT_REF" =~ (feature/|tdb) ]]; then
      echo "🚀 Deploying trigger jobs for staging environment (branch is '$VERCEL_GIT_COMMIT_REF')..."
      npx trigger.dev@latest deploy -e staging
    else
      echo "🔒 Skip deploying trigger jobs for preview branch '$VERCEL_GIT_COMMIT_REF' as it isn't a feature branch (checking 'feature/' or 'tdb' prefix"
    fi
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
) &

wait

echo "🥳 Deployment completed! 🎉🎉🎉"
